import crypto from "crypto";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN || "caletzza.myshopify.com";
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN || "";
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || "";
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || process.env.SHOPIFY_API_SECRET || "";
const API_SECRET = process.env.SHOPIFY_API_SECRET || CLIENT_SECRET;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

let cachedAccessToken = ADMIN_TOKEN || "";
let tokenExpiresAt = 0;

app.use(express.json({ limit: "1mb" }));

async function getAccessToken() {
  if (ADMIN_TOKEN) {
    return ADMIN_TOKEN;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Configura SHOPIFY_CLIENT_ID y SHOPIFY_CLIENT_SECRET (Dev Dashboard) o SHOPIFY_ADMIN_API_TOKEN.");
  }

  const now = Date.now();
  if (cachedAccessToken && now < tokenExpiresAt - 60000) {
    return cachedAccessToken;
  }

  const response = await fetch(`https://${SHOP_DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    })
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || "No se pudo obtener el access token.");
  }

  cachedAccessToken = payload.access_token;
  tokenExpiresAt = now + Number(payload.expires_in || 86399) * 1000;
  return cachedAccessToken;
}

function verifyProxySignature(query) {
  if (!API_SECRET) {
    return process.env.ALLOW_UNSIGNED_PROXY === "true";
  }

  const signature = query.signature;
  if (!signature) {
    return false;
  }

  const pairs = Object.keys(query)
    .filter((key) => key !== "signature")
    .sort()
    .map((key) => `${key}=${Array.isArray(query[key]) ? query[key].join(",") : query[key]}`);

  const digest = crypto.createHmac("sha256", API_SECRET).update(pairs.join("")).digest("hex");
  return digest === signature;
}

function variantGid(variantId) {
  return `gid://shopify/ProductVariant/${variantId}`;
}

function moneyFromCents(cents) {
  return (Number(cents || 0) / 100).toFixed(2);
}

function parseProxyBody(req) {
  if (req.body && typeof req.body === "object" && Object.keys(req.body).length) {
    return req.body;
  }

  return {};
}

async function handleProxyOrder(req, res) {
  try {
    if (!verifyProxySignature(req.query)) {
      console.error("Proxy signature invalid", {
        shop: req.query.shop,
        path_prefix: req.query.path_prefix
      });
      return res.status(401).json({ error: "Firma de app proxy invalida." });
    }

    const body = parseProxyBody(req);
    if (!body.lineItems || !body.lineItems.length) {
      return res.status(400).json({ error: "No se recibieron productos. Revisa app proxy POST." });
    }

    const result = await createCodOrder(body);
    return res.json(result);
  } catch (error) {
    console.error("Create order failed:", error.message);
    return res.status(400).json({ error: error.message || "No se pudo crear el pedido." });
  }
}

async function shopifyGraphql(query, variables) {
  const accessToken = await getAccessToken();

  const response = await fetch(`https://${SHOP_DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken
    },
    body: JSON.stringify({ query, variables })
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.errors?.[0]?.message || "Error en Admin API.");
  }

  if (payload.errors?.length) {
    throw new Error(payload.errors[0].message);
  }

  return payload.data;
}

async function createStorefrontCheckout(body) {
  const hasEffiFlete = Boolean(
    body.packEffiFlow ||
      body.freightVariantId ||
      (body.lineItems || []).some((item) => item && item.isEffiFlete)
  );

  const variantLineItems = (body.lineItems || []).map((item) => {
    const lineItem = {
      variantId: variantGid(item.variantId),
      quantity: Number(item.quantity || 1)
    };

    if (
      item.isEffiFlete ||
      (body.freightVariantId && String(item.variantId) === String(body.freightVariantId))
    ) {
      lineItem.customAttributes = [
        { key: "_caletzza_effi_hidden", value: "yes" },
        { key: "_caletzza_effi_flow_source", value: "pack" }
      ];
      lineItem.taxable = false;
    }

    return lineItem;
  });

  if (!variantLineItems.length) {
    throw new Error("No hay productos en el carrito.");
  }

  const tags = ["Discount-Rules", "Storefront-Checkout"];
  if (hasEffiFlete) {
    tags.push("Pack-Effi-Flow", "Pack-Express");
  }
  if (body.packLabel) {
    tags.push(body.packLabel);
  }

  const discountAmount = Number(body.discountAmount || 0);
  const draftInput = {
    email: body.email || body.customer?.email || undefined,
    phone: body.phone || body.customer?.phone || undefined,
    note:
      body.note ||
      (hasEffiFlete
        ? "Checkout pack con flete Effi (sin IVA en flete)"
        : "Checkout con descuento por cantidad"),
    tags,
    lineItems: variantLineItems,
    shippingLine: {
      title: hasEffiFlete ? "Envio gratis" : "Envio",
      price: moneyFromCents(hasEffiFlete ? 0 : body.shippingPrice || 0)
    }
  };

  if (body.shippingAddress) {
    draftInput.shippingAddress = {
      firstName: body.customer?.firstName || body.shippingAddress.firstName || "Cliente",
      lastName: body.customer?.lastName || body.shippingAddress.lastName || "Online",
      address1: body.shippingAddress.address1,
      city: body.shippingAddress.city,
      province: body.shippingAddress.province,
      countryCode: body.shippingAddress.countryCode || "CO",
      zip: body.shippingAddress.zip || "000000",
      phone: body.customer?.phone || body.phone || undefined
    };
  }

  if (hasEffiFlete) {
    draftInput.customAttributes = [
      { key: "_caletzza_pack_effi_flow", value: "yes" },
      { key: "flete_product_variant_id", value: String(body.freightVariantId || "") },
      { key: "valor_flete_cents", value: String(body.freightPrice || 0) }
    ];
  }

  if (discountAmount > 0) {
    draftInput.appliedDiscount = {
      description: body.discountLabel || "Descuento por cantidad",
      value: moneyFromCents(discountAmount),
      valueType: "FIXED_AMOUNT"
    };
  }

  const createMutation = `
    mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          invoiceUrl
          name
        }
        userErrors { field message }
      }
    }
  `;

  const createData = await shopifyGraphql(createMutation, { input: draftInput });
  const createResult = createData.draftOrderCreate;

  if (createResult.userErrors?.length) {
    throw new Error(createResult.userErrors.map((error) => error.message).join(" "));
  }

  const draftOrder = createResult.draftOrder;
  if (!draftOrder?.invoiceUrl) {
    throw new Error("No se pudo generar la URL de pago.");
  }

  return {
    draftOrderId: draftOrder.id,
    draftOrderName: draftOrder.name,
    invoiceUrl: draftOrder.invoiceUrl,
    packEffiFlow: hasEffiFlete
  };
}

async function handleProxyCheckout(req, res) {
  try {
    if (!verifyProxySignature(req.query)) {
      return res.status(401).json({ error: "Firma de app proxy invalida." });
    }

    const body = parseProxyBody(req);
    const result = await createStorefrontCheckout(body);
    return res.json(result);
  } catch (error) {
    console.error("Discount checkout failed:", error.message);
    return res.status(400).json({ error: error.message || "No se pudo iniciar el checkout." });
  }
}

async function createCodOrder(body) {
  const customer = body.customer || {};
  const shippingAddress = body.shippingAddress || {};
  const hasEffiFlete = Boolean(
    body.packEffiFlow ||
      body.freightVariantId ||
      (body.lineItems || []).some((item) => item && item.isEffiFlete)
  );

  const variantLineItems = (body.lineItems || []).map((item) => {
    const lineItem = {
      variantId: variantGid(item.variantId),
      quantity: Number(item.quantity || 1)
    };

    if (item.isEffiFlete || (body.freightVariantId && String(item.variantId) === String(body.freightVariantId))) {
      lineItem.customAttributes = [
        { key: "_caletzza_effi_hidden", value: "yes" },
        { key: "_caletzza_effi_flow_source", value: "pack" }
      ];
      /* El flete Effi no debe generar IVA en el pedido. */
      lineItem.taxable = false;
    }

    return lineItem;
  });

  if (!variantLineItems.length) {
    throw new Error("No hay productos en el pedido.");
  }

  const tags = ["COD", "Pack-Express", body.packLabel].filter(Boolean);
  if (hasEffiFlete) {
    tags.push("Pack-Effi-Flow");
  }

  const noteParts = [body.packLabel, body.note];
  if (hasEffiFlete) {
    noteParts.push("Flete Effi incluido como line item");
  }

  const draftInput = {
    email: customer.email || undefined,
    phone: customer.phone || undefined,
    note: noteParts.filter(Boolean).join(" | ") || undefined,
    tags,
    shippingAddress: {
      firstName: customer.firstName || "Cliente",
      lastName: customer.lastName || "COD",
      address1: shippingAddress.address1,
      city: shippingAddress.city,
      province: shippingAddress.province,
      countryCode: "CO",
      zip: shippingAddress.zip || "000000",
      phone: customer.phone || undefined
    },
    lineItems: variantLineItems,
    shippingLine: {
      title: hasEffiFlete ? "Envio (flete en producto)" : "Envio",
      price: moneyFromCents(body.shippingPrice)
    },
    customAttributes: hasEffiFlete
      ? [
          { key: "_caletzza_pack_effi_flow", value: "yes" },
          { key: "flete_product_variant_id", value: String(body.freightVariantId || "") },
          { key: "valor_flete_cents", value: String(body.freightPrice || 0) }
        ]
      : undefined
  };

  const discountAmount = Number(body.discountAmount || 0);
  if (discountAmount > 0) {
    draftInput.appliedDiscount = {
      description: "Descuento pack por cantidad",
      value: moneyFromCents(discountAmount),
      valueType: "FIXED_AMOUNT"
    };
  }

  const createMutation = `
    mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder { id name }
        userErrors { field message }
      }
    }
  `;

  const createData = await shopifyGraphql(createMutation, { input: draftInput });
  const createResult = createData.draftOrderCreate;

  if (createResult.userErrors?.length) {
    throw new Error(createResult.userErrors.map((error) => error.message).join(" "));
  }

  const draftId = createResult.draftOrder?.id;
  if (!draftId) {
    throw new Error("No se pudo crear el borrador del pedido.");
  }

  const completeMutation = `
    mutation draftOrderComplete($id: ID!) {
      draftOrderComplete(id: $id, paymentPending: true) {
        draftOrder {
          order { id name legacyResourceId }
        }
        userErrors { field message }
      }
    }
  `;

  const completeData = await shopifyGraphql(completeMutation, { id: draftId });
  const completeResult = completeData.draftOrderComplete;

  if (completeResult.userErrors?.length) {
    throw new Error(completeResult.userErrors.map((error) => error.message).join(" "));
  }

  const order = completeResult.draftOrder?.order;
  if (!order) {
    throw new Error("No se pudo completar el pedido.");
  }

  return {
    orderId: order.legacyResourceId,
    orderName: order.name,
    packEffiFlow: hasEffiFlete
  };
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, shop: SHOP_DOMAIN });
});

app.post(["/proxy/order", "/proxy/order/", "/proxy/order/order", "/proxy/order/order/"], handleProxyOrder);
app.post(
  ["/proxy/checkout", "/proxy/checkout/", "/proxy/order/checkout", "/proxy/order/checkout/", "/checkout"],
  handleProxyCheckout
);

app.post("/order", async (req, res) => {
  try {
    const result = await createCodOrder(req.body);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message || "No se pudo crear el pedido." });
  }
});

app.post("/checkout", async (req, res) => {
  try {
    const result = await createStorefrontCheckout(req.body);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message || "No se pudo iniciar el checkout." });
  }
});

app.listen(PORT, () => {
  console.log(`COD Express listening on :${PORT} for ${SHOP_DOMAIN}`);
});
