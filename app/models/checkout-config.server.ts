import prisma from "../db.server";
import {
  METAFIELD_KEY,
  METAFIELD_NAMESPACE,
  type CheckoutCustomizerConfig,
  createDefaultConfig,
  parseConfig,
} from "../types/checkout-config";

const CONFIG_QUERY = `#graphql
  query CheckoutCustomizerConfig {
    shop {
      id
      metafield(namespace: "${METAFIELD_NAMESPACE}", key: "${METAFIELD_KEY}") {
        value
      }
    }
  }
`;

const CONFIG_MUTATION = `#graphql
  mutation CheckoutCustomizerConfigSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        namespace
        key
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type AdminClient = {
  graphql: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<Response>;
};

export async function getCheckoutConfig(shop: string): Promise<CheckoutCustomizerConfig> {
  const record = await prisma.checkoutConfig.findUnique({
    where: { shop },
  });

  if (!record) {
    return createDefaultConfig();
  }

  return parseConfig(record.config);
}

export async function saveCheckoutConfig(
  shop: string,
  config: CheckoutCustomizerConfig,
): Promise<CheckoutCustomizerConfig> {
  const serialized = JSON.stringify(config);

  await prisma.checkoutConfig.upsert({
    where: { shop },
    create: {
      shop,
      config: serialized,
    },
    update: {
      config: serialized,
    },
  });

  return config;
}

export async function syncCheckoutConfigToMetafield(
  admin: AdminClient,
  config: CheckoutCustomizerConfig,
): Promise<void> {
  const response = await admin.graphql(CONFIG_QUERY);
  const responseJson = await response.json();
  const shopId = responseJson.data?.shop?.id;

  if (!shopId) {
    throw new Error("No se pudo obtener el ID de la tienda.");
  }

  const mutationResponse = await admin.graphql(CONFIG_MUTATION, {
    variables: {
      metafields: [
        {
          ownerId: shopId,
          namespace: METAFIELD_NAMESPACE,
          key: METAFIELD_KEY,
          type: "json",
          value: JSON.stringify(config),
        },
      ],
    },
  });

  const mutationJson = await mutationResponse.json();
  const userErrors = mutationJson.data?.metafieldsSet?.userErrors ?? [];

  if (userErrors.length > 0) {
    throw new Error(userErrors.map((error: { message: string }) => error.message).join(", "));
  }
}

export async function loadCheckoutConfig(
  shop: string,
  admin?: AdminClient,
): Promise<CheckoutCustomizerConfig> {
  if (admin) {
    const response = await admin.graphql(CONFIG_QUERY);
    const responseJson = await response.json();
    const value = responseJson.data?.shop?.metafield?.value as string | undefined;

    if (value) {
      const config = parseConfig(value);
      await saveCheckoutConfig(shop, config);
      return config;
    }
  }

  return getCheckoutConfig(shop);
}
