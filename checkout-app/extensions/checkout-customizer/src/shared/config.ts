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
  postalCodeWorkaround: PostalCodeWorkaround;
}

export type PostalCodeDisplayMode = "collapsed" | "banner" | "silent";

export interface PostalCodeWorkaround {
  enabled: boolean;
  autoFill: boolean;
  defaultValue: string;
  showBanner: boolean;
  bannerMessage: string;
  displayMode: PostalCodeDisplayMode;
  collapsedSummary: string;
  expandedMessage: string;
  allowManualEdit: boolean;
}

export const METAFIELD_NAMESPACE = "$app:checkout_customizer";
export const METAFIELD_KEY = "config";

export function createDefaultPostalCodeWorkaround(): PostalCodeWorkaround {
  return {
    enabled: true,
    autoFill: true,
    defaultValue: "000000",
    showBanner: true,
    bannerMessage:
      "En Colombia el código postal tiene 6 dígitos. Si no conoces el tuyo, puedes usar 000000.",
    displayMode: "collapsed",
    collapsedSummary:
      "Código postal completado ({zip}). Toca aquí si deseas cambiarlo.",
    expandedMessage:
      "En Colombia el código postal tiene 6 dígitos. Lo hemos completado por ti para agilizar tu compra. Si conoces el de tu barrio o ciudad, edítalo abajo.",
    allowManualEdit: true,
  };
}

export function normalizePostalCodeWorkaround(
  input?: Partial<PostalCodeWorkaround>,
): PostalCodeWorkaround {
  const defaults = createDefaultPostalCodeWorkaround();
  const merged = { ...defaults, ...input };

  if (!input?.displayMode) {
    merged.displayMode = input?.showBanner === false ? "silent" : "collapsed";
  }

  return merged;
}

export function createDefaultConfig(): CheckoutCustomizerConfig {
  return {
    banners: [],
    customFields: [],
    defaultFieldSettings: [],
    postalCodeWorkaround: createDefaultPostalCodeWorkaround(),
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
      defaultFieldSettings: parsed.defaultFieldSettings ?? [],
      postalCodeWorkaround: normalizePostalCodeWorkaround(
        parsed.postalCodeWorkaround,
      ),
    };
  } catch {
    return createDefaultConfig();
  }
}

export function getBannersForTarget(
  config: CheckoutCustomizerConfig,
  target: FieldTarget,
): BannerConfig[] {
  return config.banners.filter(
    (banner) => banner.enabled && banner.target === target,
  );
}

export function getFieldsForTarget(
  config: CheckoutCustomizerConfig,
  target: FieldTarget,
): CustomFieldConfig[] {
  return config.customFields.filter(
    (field) => field.enabled && field.target === target,
  );
}
