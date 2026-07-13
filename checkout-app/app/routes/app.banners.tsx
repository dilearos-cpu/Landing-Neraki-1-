import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { useEffect, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { loadCheckoutConfig } from "../models/checkout-config.server";
import { persistConfigAction } from "../utils/checkout-config-actions.server";
import type { BannerConfig, BannerTone, FieldTarget } from "../types/checkout-config";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const config = await loadCheckoutConfig(session.shop, admin);
  return { config };
};

export const action = async (actionArgs: ActionFunctionArgs) => {
  await persistConfigAction(actionArgs);
  return { ok: true };
};

const TONE_OPTIONS: BannerTone[] = [
  "info",
  "success",
  "warning",
  "critical",
  "auto",
];

const TARGET_OPTIONS: Array<{ value: FieldTarget; label: string }> = [
  { value: "header", label: "Encabezado" },
  { value: "contact", label: "Contacto" },
  { value: "delivery", label: "Entrega" },
  { value: "payment", label: "Pago" },
  { value: "block", label: "Bloque general" },
];

function createBanner(): BannerConfig {
  return {
    id: crypto.randomUUID(),
    enabled: true,
    heading: "Aviso importante",
    message: "Escribe tu mensaje aquí",
    tone: "info",
    target: "header",
    dismissible: false,
  };
}

export default function BannersPage() {
  const { config } = useLoaderData<typeof loader>();
  const [banners, setBanners] = useState(config.banners);
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

  useEffect(() => {
    if (fetcher.data?.ok) {
      shopify.toast.show("Banners guardados");
    }
  }, [fetcher.data?.ok, shopify]);

  function updateBanner(id: string, patch: Partial<BannerConfig>) {
    setBanners((current) =>
      current.map((banner) =>
        banner.id === id ? { ...banner, ...patch } : banner,
      ),
    );
  }

  function removeBanner(id: string) {
    setBanners((current) => current.filter((banner) => banner.id !== id));
  }

  function save() {
    fetcher.submit(
      {
        config: JSON.stringify({
          ...config,
          banners,
        }),
      },
      { method: "POST" },
    );
  }

  return (
    <s-page heading="Banners">
      <s-button slot="primary-action" onClick={() => setBanners([...banners, createBanner()])}>
        Agregar banner
      </s-button>

      <s-section heading="Mensajes en checkout">
        <s-paragraph>
          Crea banners informativos, promocionales o de advertencia en
          diferentes secciones del checkout.
        </s-paragraph>
      </s-section>

      {banners.length === 0 ? (
        <s-section>
          <s-box padding="base" background="subdued" borderRadius="base">
            <s-text>No hay banners configurados. Agrega uno para empezar.</s-text>
          </s-box>
        </s-section>
      ) : (
        banners.map((banner, index) => (
          <s-section key={banner.id} heading={`Banner ${index + 1}`}>
            <s-stack direction="block" gap="base">
              <s-switch
                label="Activo"
                checked={banner.enabled}
                onChange={(event: Event) => {
                  const target = event.currentTarget as HTMLInputElement;
                  updateBanner(banner.id, { enabled: target.checked });
                }}
              />
              <s-text-field
                label="Título"
                value={banner.heading ?? ""}
                onInput={(event: Event) => {
                  const target = event.currentTarget as HTMLInputElement;
                  updateBanner(banner.id, { heading: target.value });
                }}
              />
              <s-text-area
                label="Mensaje"
                rows={3}
                value={banner.message}
                onInput={(event: Event) => {
                  const target = event.currentTarget as HTMLTextAreaElement;
                  updateBanner(banner.id, { message: target.value });
                }}
              />
              <s-select
                label="Tono"
                value={banner.tone}
                onChange={(event: Event) => {
                  const target = event.currentTarget as HTMLSelectElement;
                  updateBanner(banner.id, {
                    tone: target.value as BannerTone,
                  });
                }}
              >
                {TONE_OPTIONS.map((tone) => (
                  <s-option key={tone} value={tone}>
                    {tone}
                  </s-option>
                ))}
              </s-select>
              <s-select
                label="Ubicación"
                value={banner.target}
                onChange={(event: Event) => {
                  const target = event.currentTarget as HTMLSelectElement;
                  updateBanner(banner.id, {
                    target: target.value as FieldTarget,
                  });
                }}
              >
                {TARGET_OPTIONS.map((option) => (
                  <s-option key={option.value} value={option.value}>
                    {option.label}
                  </s-option>
                ))}
              </s-select>
              <s-switch
                label="Permitir cerrar"
                checked={banner.dismissible ?? false}
                onChange={(event: Event) => {
                  const target = event.currentTarget as HTMLInputElement;
                  updateBanner(banner.id, { dismissible: target.checked });
                }}
              />
              <s-button tone="critical" onClick={() => removeBanner(banner.id)}>
                Eliminar banner
              </s-button>
            </s-stack>
          </s-section>
        ))
      )}

      <s-section>
        <s-button
          variant="primary"
          onClick={save}
          {...(fetcher.state !== "idle" ? { loading: true } : {})}
        >
          Guardar banners
        </s-button>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
