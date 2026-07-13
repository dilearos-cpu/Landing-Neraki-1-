import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useState } from "preact/hooks";
import {
  useAppMetafields,
  useBuyerJourneyIntercept,
} from "@shopify/ui-extensions/checkout/preact";
import {
  getFieldsForTarget,
  METAFIELD_NAMESPACE,
  parseConfig,
  type CheckoutCustomizerConfig,
  type CustomFieldConfig,
  type FieldTarget,
} from "./config";

type FieldRendererProps = {
  fields: CustomFieldConfig[];
};

export function FieldRenderer({ fields }: FieldRendererProps) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <s-stack direction="block" gap="base">
      {fields.map((field) => (
        <CustomField key={field.id} field={field} />
      ))}
    </s-stack>
  );
}

function CustomField({ field }: { field: CustomFieldConfig }) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const canSetMetafields =
    shopify.instructions.value.metafields.canSetCartMetafields;

  async function persistFieldValue(nextValue: string) {
    if (!canSetMetafields) {
      return;
    }

    await shopify.applyMetafieldChange({
      type: "updateCartMetafield",
      metafield: {
        namespace: METAFIELD_NAMESPACE,
        key: field.name,
        value: nextValue,
        type: "single_line_text_field",
      },
    });
  }

  async function handleTextChange(nextValue: string) {
    setValue(nextValue);
    await persistFieldValue(nextValue);
  }

  async function handleCheckboxChange(nextChecked: boolean) {
    setChecked(nextChecked);
    await persistFieldValue(nextChecked ? "true" : "false");
  }

  const commonProps = {
    label: field.label,
    name: field.name,
    ...(field.placeholder ? { placeholder: field.placeholder } : {}),
    ...(field.required ? { required: true } : {}),
  };

  switch (field.type) {
    case "textarea":
      return (
        <s-text-area
          {...commonProps}
          rows={4}
          value={value}
          onInput={(event: Event) => {
            const target = event.currentTarget as HTMLTextAreaElement;
            void handleTextChange(target.value);
          }}
        />
      );
    case "number":
      return (
        <s-number-field
          {...commonProps}
          value={value}
          onInput={(event: Event) => {
            const target = event.currentTarget as HTMLInputElement;
            void handleTextChange(target.value);
          }}
        />
      );
    case "select":
      return (
        <s-select
          {...commonProps}
          value={value}
          onChange={(event: Event) => {
            const target = event.currentTarget as HTMLSelectElement;
            void handleTextChange(target.value);
          }}
        >
          <s-option value="">Selecciona una opción</s-option>
          {(field.options ?? []).map((option) => (
            <s-option key={option} value={option}>
              {option}
            </s-option>
          ))}
        </s-select>
      );
    case "checkbox":
      return (
        <s-checkbox
          label={field.label}
          name={field.name}
          checked={checked}
          onChange={(event: Event) => {
            const target = event.currentTarget as HTMLInputElement;
            void handleCheckboxChange(target.checked);
          }}
        />
      );
    case "date":
      return (
        <s-date-field
          {...commonProps}
          value={value}
          onInput={(event: Event) => {
            const target = event.currentTarget as HTMLInputElement;
            void handleTextChange(target.value);
          }}
        />
      );
    case "phone":
      return (
        <s-text-field
          {...commonProps}
          value={value}
          onInput={(event: Event) => {
            const target = event.currentTarget as HTMLInputElement;
            void handleTextChange(target.value);
          }}
        />
      );
    case "email":
      return (
        <s-email-field
          {...commonProps}
          value={value}
          onInput={(event: Event) => {
            const target = event.currentTarget as HTMLInputElement;
            void handleTextChange(target.value);
          }}
        />
      );
    default:
      return (
        <s-text-field
          {...commonProps}
          value={value}
          onInput={(event: Event) => {
            const target = event.currentTarget as HTMLInputElement;
            void handleTextChange(target.value);
          }}
        />
      );
  }
}

export function useCheckoutConfig(target: FieldTarget) {
  const [configEntries] = useAppMetafields({
    type: "shop",
    namespace: METAFIELD_NAMESPACE,
    key: "config",
  });

  const configEntry = configEntries.find((entry) => entry.metafield?.value);
  const config = parseConfig(configEntry?.metafield?.value);
  const fields = getFieldsForTarget(config, target);

  return { config, fields };
}

export function useRequiredFieldValidation(fields: CustomFieldConfig[]) {
  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    if (!canBlockProgress) {
      return { behavior: "allow" };
    }

    const cartMetafields = shopify.metafields.value ?? [];
    const missingFields = fields
      .filter((field) => field.required)
      .filter((field) => {
        const stored = cartMetafields.find(
          (entry) =>
            entry.metafield.namespace === METAFIELD_NAMESPACE &&
            entry.metafield.key === field.name,
        );
        return !stored?.metafield?.value;
      });

    if (missingFields.length === 0) {
      return { behavior: "allow" };
    }

    return {
      behavior: "block",
      reason: "Completa los campos obligatorios",
      errors: missingFields.map((field) => ({
        message: `${field.label} es obligatorio`,
      })),
    };
  });
}

export function FieldSection({
  target,
  heading,
}: {
  target: FieldTarget;
  heading: string;
}) {
  const { config, fields } = useCheckoutConfig(target);

  useRequiredFieldValidation(fields);

  if (fields.length === 0) {
    return null;
  }

  return (
    <s-stack direction="block" gap="base">
      <s-heading>{heading}</s-heading>
      {config.defaultFieldSettings
        .filter((setting) => setting.enabled && setting.action !== "show")
        .map((setting) => (
          <s-banner key={setting.field} tone="info">
            Configura el campo nativo &quot;{setting.field}&quot; desde
            Configuración &gt; Checkout en Shopify Admin.
          </s-banner>
        ))}
      <FieldRenderer fields={fields} />
    </s-stack>
  );
}

export function mountFieldExtension(
  target: FieldTarget,
  heading: string,
) {
  render(<FieldSection target={target} heading={heading} />, document.body);
}
