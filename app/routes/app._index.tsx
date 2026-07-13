import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { loadCheckoutConfig } from "../models/checkout-config.server";
import { persistConfigAction } from "../utils/checkout-config-actions.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const config = await loadCheckoutConfig(session.shop, admin);

  return {
    config,
    shop: session.shop,
  };
};

export const action = async (actionArgs: ActionFunctionArgs) => {
  await persistConfigAction(actionArgs);
  return { ok: true };
};

export default function Dashboard() {
  const { config } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

  useEffect(() => {
    if (fetcher.data?.ok) {
      shopify.toast.show("Configuración sincronizada con checkout");
    }
  }, [fetcher.data?.ok, shopify]);

  const enabledBanners = config.banners.filter((banner) => banner.enabled).length;
  const enabledFields = config.customFields.filter((field) => field.enabled).length;
  const enabledDefaults = config.defaultFieldSettings.filter(
    (setting) => setting.enabled,
  ).length;

  return (
    <s-page heading="Checkout Customizer">
      <s-button
        slot="primary-action"
        href="/app/campos"
        variant="primary"
      >
        Agregar campo
      </s-button>

      <s-section heading="Personaliza tu checkout">
        <s-paragraph>
          Administra banners, campos personalizados y preferencias sobre los
          campos predeterminados de Shopify. Los cambios se sincronizan
          automáticamente con la extensión de checkout.
        </s-paragraph>
      </s-section>

      <s-section heading="Resumen">
        <s-grid gridTemplateColumns="1fr 1fr 1fr" gap="base">
          <s-box padding="base" border="base" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="small">
              <s-text type="strong">Banners activos</s-text>
              <s-heading>{enabledBanners}</s-heading>
              <s-link href="/app/banners">Gestionar banners</s-link>
            </s-stack>
          </s-box>
          <s-box padding="base" border="base" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="small">
              <s-text type="strong">Campos personalizados</s-text>
              <s-heading>{enabledFields}</s-heading>
              <s-link href="/app/campos">Gestionar campos</s-link>
            </s-stack>
          </s-box>
          <s-box padding="base" border="base" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="small">
              <s-text type="strong">Ajustes de campos nativos</s-text>
              <s-heading>{enabledDefaults}</s-heading>
              <s-link href="/app/campos-predeterminados">Ver guía</s-link>
            </s-stack>
          </s-box>
        </s-grid>
      </s-section>

      <s-section heading="Instalación en checkout">
        <s-paragraph>
          Después de guardar tu configuración, abre el editor de checkout en
          Shopify Admin y activa la extensión &quot;Checkout Customizer&quot;.
          Puedes mover el bloque a la posición que prefieras.
        </s-paragraph>
        <s-unordered-list>
          <s-list-item>
            Los banners del encabezado aparecen en la parte superior del checkout.
          </s-list-item>
          <s-list-item>
            Los campos de contacto se muestran después del email.
          </s-list-item>
          <s-list-item>
            Los campos de entrega se muestran después de la dirección de envío.
          </s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section slot="aside" heading="Limitaciones de Shopify">
        <s-banner tone="warning">
          Shopify no permite ocultar campos nativos obligatorios (nombre,
          dirección, etc.) desde una app. Para empresa, apartamento y teléfono
          puedes ajustarlos en Configuración &gt; Checkout.
        </s-banner>
      </s-section>

      <s-section slot="aside" heading="Sincronización">
        <s-button
          onClick={() =>
            fetcher.submit(
              { config: JSON.stringify(config) },
              { method: "POST" },
            )
          }
          {...(fetcher.state !== "idle" ? { loading: true } : {})}
        >
          Sincronizar ahora
        </s-button>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
