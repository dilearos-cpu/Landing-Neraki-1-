export type BannerTone = "info" | "success" | "warning" | "critical" | "auto";

export type FieldTarget =
  | "header"
  | "contact"
  | "delivery"
  | "payment"
  | "footer"
  | "block";

export type CustomFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "checkbox"
  | "date"
  | "phone"
  | "email";

export type DefaultFieldKey =
  | "company"
  | "address2"
  | "phone"
  | "firstName"
  | "lastName"
  | "city"
  | "province"
  | "zip"
  | "country";

export type DefaultFieldAction = "hide" | "optional" | "required" | "show";

export interface BannerConfig {
  id: string;
  enabled: boolean;
  heading?: string;
  message: string;
  tone: BannerTone;
  target: FieldTarget;
  dismissible?: boolean;
}

export interface CustomFieldConfig {
  id: string;
  enabled: boolean;
  type: CustomFieldType;
  label: string;
  name: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  target: FieldTarget;
  helpText?: string;
}

export interface DefaultFieldSetting {
  field: DefaultFieldKey;
  action: DefaultFieldAction;
  enabled: boolean;
}

export interface CheckoutCustomizerConfig {
  banners: BannerConfig[];
  customFields: CustomFieldConfig[];
  defaultFieldSettings: DefaultFieldSetting[];
}

export const METAFIELD_NAMESPACE = "$app:checkout_customizer";
export const METAFIELD_KEY = "config";

export const DEFAULT_FIELD_OPTIONS: Array<{
  field: DefaultFieldKey;
  label: string;
  adminPath: string;
  limitation: string;
}> = [
  {
    field: "company",
    label: "Empresa",
    adminPath: "Configuración > Checkout > Información del cliente",
    limitation:
      "Puedes ocultar o marcar como opcional desde el editor de checkout de Shopify.",
  },
  {
    field: "address2",
    label: "Apartamento / suite",
    adminPath: "Configuración > Checkout > Dirección de envío",
    limitation:
      "Puedes ocultar este campo desde el editor de checkout de Shopify.",
  },
  {
    field: "phone",
    label: "Teléfono",
    adminPath: "Configuración > Checkout > Información del cliente",
    limitation:
      "Puedes marcarlo como opcional en Configuración > Checkout. No se puede eliminar por completo.",
  },
  {
    field: "firstName",
    label: "Nombre",
    adminPath: "Configuración > Checkout",
    limitation: "Campo nativo obligatorio de Shopify. No se puede deshabilitar.",
  },
  {
    field: "lastName",
    label: "Apellido",
    adminPath: "Configuración > Checkout",
    limitation: "Campo nativo obligatorio de Shopify. No se puede deshabilitar.",
  },
  {
    field: "city",
    label: "Ciudad",
    adminPath: "Configuración > Checkout",
    limitation: "Campo nativo obligatorio de Shopify. No se puede deshabilitar.",
  },
  {
    field: "province",
    label: "Provincia / estado",
    adminPath: "Configuración > Checkout",
    limitation: "Campo nativo obligatorio de Shopify. No se puede deshabilitar.",
  },
  {
    field: "zip",
    label: "Código postal",
    adminPath: "Configuración > Checkout",
    limitation: "Campo nativo obligatorio de Shopify. No se puede deshabilitar.",
  },
  {
    field: "country",
    label: "País",
    adminPath: "Configuración > Checkout",
    limitation: "Campo nativo obligatorio de Shopify. No se puede deshabilitar.",
  },
];

export function createDefaultConfig(): CheckoutCustomizerConfig {
  return {
    banners: [],
    customFields: [],
    defaultFieldSettings: DEFAULT_FIELD_OPTIONS.map((option) => ({
      field: option.field,
      action: option.field === "company" || option.field === "address2"
        ? "hide"
        : option.field === "phone"
          ? "optional"
          : "show",
      enabled: false,
    })),
  };
}

export function parseConfig(raw: string | null | undefined): CheckoutCustomizerConfig {
  if (!raw) {
    return createDefaultConfig();
  }

  try {
    const parsed = JSON.parse(raw) as CheckoutCustomizerConfig;
    return {
      banners: parsed.banners ?? [],
      customFields: parsed.customFields ?? [],
      defaultFieldSettings:
        parsed.defaultFieldSettings ?? createDefaultConfig().defaultFieldSettings,
    };
  } catch {
    return createDefaultConfig();
  }
}
