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
import {
  DEFAULT_FIELD_OPTIONS,
  createDefaultPostalCodeWorkaround,
  normalizePostalCodeWorkaround,
  type DefaultFieldAction,
  type DefaultFieldSetting,
  type PostalCodeDisplayMode,
  type PostalCodeWorkaround,
} from "../types/checkout-config";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const config = await loadCheckoutConfig(session.shop, admin);
  return { config };
};

export const action = async (actionArgs: ActionFunctionArgs) => {
  await persistConfigAction(actionArgs);
  return { ok: true };
};

const DISPLAY_MODE_OPTIONS: Array<{
  value: PostalCodeDisplayMode;
  label: string;
}> = [
  {
    value: "collapsed",
    label: "Aviso colapsado (recomendado)",
  },
  {
    value: "banner",
    label: "Banner siempre visible",
  },
  {
    value: "silent",
    label: "Solo autocompletar, sin aviso",
  },
];

const ACTION_OPTIONS: Array<{ value: DefaultFieldAction; label: string }> = [
  { value: "show", label: "Mostrar (predeterminado)" },
  { value: "optional", label: "Hacer opcional" },
  { value: "hide", label: "Ocultar" },
  { value: "required", label: "Obligatorio" },
];

export default function DefaultFieldsPage() {
  const { config } = useLoaderData<typeof loader>();
  const [settings, setSettings] = useState<DefaultFieldSetting[]>(
    config.defaultFieldSettings.length > 0
      ? config.defaultFieldSettings
      : DEFAULT_FIELD_OPTIONS.map((option) => ({
          field: option.field,
          action: option.field === "company" || option.field === "address2"
            ? "hide"
            : option.field === "phone"
              ? "optional"
              : "show",
          enabled: false,
        })),
  );
  const [postalCodeWorkaround, setPostalCodeWorkaround] =
    useState<PostalCodeWorkaround>(
      normalizePostalCodeWorkaround(
        config.postalCodeWorkaround ?? createDefaultPostalCodeWorkaround(),
      ),
    );
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

  useEffect(() => {
    if (fetcher.data?.ok) {
      shopify.toast.show("Preferencias guardadas");
    }
  }, [fetcher.data?.ok, shopify]);

  function updateSetting(
    field: DefaultFieldSetting["field"],
    patch: Partial<DefaultFieldSetting>,
  ) {
    setSettings((current) =>
      current.map((setting) =>
        setting.field === field ? { ...setting, ...patch } : setting,
      ),
    );
  }

  function save() {
    fetcher.submit(
      {
        config: JSON.stringify({
          ...config,
          defaultFieldSettings: settings,
          postalCodeWorkaround,
        }),
      },
      { method: "POST" },
    );
  }

  return (
    <s-page heading="Campos predeterminados">
      <s-section heading="Campos nativos de Shopify">
        <s-banner tone="warning" heading="Importante">
          Shopify no permite que las apps oculten o cambien la obligatoriedad
          de los campos nativos directamente. Esta sección guarda tus
          preferencias y muestra instrucciones en checkout para que completes
          la configuración en Admin.
        </s-banner>
      </s-section>

      <s-section heading="Código postal">
        <s-banner tone="warning" heading="El campo nativo no se puede ocultar">
          Shopify no permite ocultar el campo de código postal del formulario
          de dirección. Lo que sí hace esta app: autocompletarlo y mostrar un
          aviso discreto colapsado, con opción de editarlo si el cliente lo
          desea.
        </s-banner>
        <s-stack direction="block" gap="base">
          <s-switch
            label="Activar alternativa para código postal"
            checked={postalCodeWorkaround.enabled}
            onChange={(event: Event) => {
              const target = event.currentTarget as HTMLInputElement;
              setPostalCodeWorkaround((current) => ({
                ...current,
                enabled: target.checked,
              }));
            }}
          />
          <s-switch
            label="Autocompletar con valor genérico"
            checked={postalCodeWorkaround.autoFill}
            onChange={(event: Event) => {
              const target = event.currentTarget as HTMLInputElement;
              setPostalCodeWorkaround((current) => ({
                ...current,
                autoFill: target.checked,
              }));
            }}
          />
          <s-text-field
            label="Valor por defecto (ej. 00000)"
            value={postalCodeWorkaround.defaultValue}
            onInput={(event: Event) => {
              const target = event.currentTarget as HTMLInputElement;
              setPostalCodeWorkaround((current) => ({
                ...current,
                defaultValue: target.value,
              }));
            }}
          />
          <s-select
            label="Cómo mostrar el aviso al cliente"
            value={postalCodeWorkaround.displayMode}
            onChange={(event: Event) => {
              const target = event.currentTarget as HTMLSelectElement;
              setPostalCodeWorkaround((current) => ({
                ...current,
                displayMode: target.value as PostalCodeDisplayMode,
                showBanner: target.value === "banner",
              }));
            }}
          >
            {DISPLAY_MODE_OPTIONS.map((option) => (
              <s-option key={option.value} value={option.value}>
                {option.label}
              </s-option>
            ))}
          </s-select>
          {postalCodeWorkaround.displayMode === "collapsed" ? (
            <>
              <s-text-field
                label="Texto colapsado (usa {zip} para el valor)"
                value={postalCodeWorkaround.collapsedSummary}
                onInput={(event: Event) => {
                  const target = event.currentTarget as HTMLInputElement;
                  setPostalCodeWorkaround((current) => ({
                    ...current,
                    collapsedSummary: target.value,
                  }));
                }}
              />
              <s-text-area
                label="Mensaje al expandir"
                rows={3}
                value={postalCodeWorkaround.expandedMessage}
                onInput={(event: Event) => {
                  const target = event.currentTarget as HTMLTextAreaElement;
                  setPostalCodeWorkaround((current) => ({
                    ...current,
                    expandedMessage: target.value,
                  }));
                }}
              />
              <s-switch
                label="Permitir editar el código postal al expandir"
                checked={postalCodeWorkaround.allowManualEdit}
                onChange={(event: Event) => {
                  const target = event.currentTarget as HTMLInputElement;
                  setPostalCodeWorkaround((current) => ({
                    ...current,
                    allowManualEdit: target.checked,
                  }));
                }}
              />
            </>
          ) : null}
          {postalCodeWorkaround.displayMode === "banner" ? (
            <s-text-area
              label="Mensaje del banner"
              rows={3}
              value={postalCodeWorkaround.bannerMessage}
              onInput={(event: Event) => {
                const target = event.currentTarget as HTMLTextAreaElement;
                setPostalCodeWorkaround((current) => ({
                  ...current,
                  bannerMessage: target.value,
                }));
              }}
            />
          ) : null}
        </s-stack>
      </s-section>

      {DEFAULT_FIELD_OPTIONS.filter((option) => option.field !== "zip").map((option) => {
        const setting = settings.find((item) => item.field === option.field);
        if (!setting) {
          return null;
        }

        return (
          <s-section key={option.field} heading={option.label}>
            <s-stack direction="block" gap="base">
              <s-paragraph>{option.limitation}</s-paragraph>
              <s-text color="subdued">Ruta en admin: {option.adminPath}</s-text>
              <s-switch
                label="Activar recordatorio en checkout"
                checked={setting.enabled}
                onChange={(event: Event) => {
                  const target = event.currentTarget as HTMLInputElement;
                  updateSetting(option.field, { enabled: target.checked });
                }}
              />
              <s-select
                label="Acción deseada"
                value={setting.action}
                onChange={(event: Event) => {
                  const target = event.currentTarget as HTMLSelectElement;
                  updateSetting(option.field, {
                    action: target.value as DefaultFieldAction,
                  });
                }}
              >
                {ACTION_OPTIONS.map((actionOption) => (
                  <s-option key={actionOption.value} value={actionOption.value}>
                    {actionOption.label}
                  </s-option>
                ))}
              </s-select>
            </s-stack>
          </s-section>
        );
      })}

      <s-section heading="Cómo aplicar los cambios">
        <s-unordered-list>
          <s-list-item>
            Ve a Configuración &gt; Checkout en tu panel de Shopify.
          </s-list-item>
          <s-list-item>
            Abre el editor de checkout y selecciona la sección de información
            del cliente o dirección de envío.
          </s-list-item>
          <s-list-item>
            Oculta o marca como opcional los campos que lo permita Shopify.
          </s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section>
        <s-button
          variant="primary"
          onClick={save}
          {...(fetcher.state !== "idle" ? { loading: true } : {})}
        >
          Guardar preferencias
        </s-button>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
