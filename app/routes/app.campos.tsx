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
import type {
  CustomFieldConfig,
  CustomFieldType,
  FieldTarget,
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

const FIELD_TYPES: Array<{ value: CustomFieldType; label: string }> = [
  { value: "text", label: "Texto" },
  { value: "textarea", label: "Texto largo" },
  { value: "number", label: "Número" },
  { value: "select", label: "Lista desplegable" },
  { value: "checkbox", label: "Casilla" },
  { value: "date", label: "Fecha" },
  { value: "phone", label: "Teléfono" },
  { value: "email", label: "Email" },
];

const TARGET_OPTIONS: Array<{ value: FieldTarget; label: string }> = [
  { value: "contact", label: "Contacto" },
  { value: "delivery", label: "Entrega" },
  { value: "payment", label: "Pago" },
  { value: "block", label: "Bloque general" },
];

function createField(): CustomFieldConfig {
  const id = crypto.randomUUID();
  return {
    id,
    enabled: true,
    type: "text",
    label: "Nuevo campo",
    name: `campo_${id.slice(0, 8)}`,
    placeholder: "",
    required: false,
    target: "contact",
    options: [],
  };
}

export default function CustomFieldsPage() {
  const { config } = useLoaderData<typeof loader>();
  const [fields, setFields] = useState(config.customFields);
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

  useEffect(() => {
    if (fetcher.data?.ok) {
      shopify.toast.show("Campos guardados");
    }
  }, [fetcher.data?.ok, shopify]);

  function updateField(id: string, patch: Partial<CustomFieldConfig>) {
    setFields((current) =>
      current.map((field) =>
        field.id === id ? { ...field, ...patch } : field,
      ),
    );
  }

  function removeField(id: string) {
    setFields((current) => current.filter((field) => field.id !== id));
  }

  function save() {
    fetcher.submit(
      {
        config: JSON.stringify({
          ...config,
          customFields: fields,
        }),
      },
      { method: "POST" },
    );
  }

  return (
    <s-page heading="Campos personalizados">
      <s-button
        slot="primary-action"
        onClick={() => setFields([...fields, createField()])}
      >
        Agregar campo
      </s-button>

      <s-section heading="Campos adicionales en checkout">
        <s-paragraph>
          Agrega campos extra que se guardan como metafields del carrito y
          aparecen en el pedido. Puedes marcarlos como obligatorios u
          opcionales.
        </s-paragraph>
      </s-section>

      {fields.length === 0 ? (
        <s-section>
          <s-box padding="base" background="subdued" borderRadius="base">
            <s-text>No hay campos personalizados. Crea el primero.</s-text>
          </s-box>
        </s-section>
      ) : (
        fields.map((field, index) => (
          <s-section key={field.id} heading={`Campo ${index + 1}`}>
            <s-stack direction="block" gap="base">
              <s-switch
                label="Activo"
                checked={field.enabled}
                onChange={(event: Event) => {
                  const target = event.currentTarget as HTMLInputElement;
                  updateField(field.id, { enabled: target.checked });
                }}
              />
              <s-text-field
                label="Etiqueta visible"
                value={field.label}
                onInput={(event: Event) => {
                  const target = event.currentTarget as HTMLInputElement;
                  updateField(field.id, { label: target.value });
                }}
              />
              <s-text-field
                label="Identificador interno"
                value={field.name}
                onInput={(event: Event) => {
                  const target = event.currentTarget as HTMLInputElement;
                  updateField(field.id, {
                    name: target.value.replace(/\s+/g, "_").toLowerCase(),
                  });
                }}
              />
              <s-select
                label="Tipo de campo"
                value={field.type}
                onChange={(event: Event) => {
                  const target = event.currentTarget as HTMLSelectElement;
                  updateField(field.id, {
                    type: target.value as CustomFieldType,
                  });
                }}
              >
                {FIELD_TYPES.map((type) => (
                  <s-option key={type.value} value={type.value}>
                    {type.label}
                  </s-option>
                ))}
              </s-select>
              <s-select
                label="Ubicación"
                value={field.target}
                onChange={(event: Event) => {
                  const target = event.currentTarget as HTMLSelectElement;
                  updateField(field.id, {
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
              <s-text-field
                label="Placeholder"
                value={field.placeholder ?? ""}
                onInput={(event: Event) => {
                  const target = event.currentTarget as HTMLInputElement;
                  updateField(field.id, { placeholder: target.value });
                }}
              />
              {field.type === "select" ? (
                <s-text-area
                  label="Opciones (una por línea)"
                  rows={4}
                  value={(field.options ?? []).join("\n")}
                  onInput={(event: Event) => {
                    const target = event.currentTarget as HTMLTextAreaElement;
                    updateField(field.id, {
                      options: target.value
                        .split("\n")
                        .map((option) => option.trim())
                        .filter(Boolean),
                    });
                  }}
                />
              ) : null}
              <s-switch
                label="Obligatorio"
                checked={field.required}
                onChange={(event: Event) => {
                  const target = event.currentTarget as HTMLInputElement;
                  updateField(field.id, { required: target.checked });
                }}
              />
              <s-button tone="critical" onClick={() => removeField(field.id)}>
                Eliminar campo
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
          Guardar campos
        </s-button>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
