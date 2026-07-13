import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useAppMetafields } from "@shopify/ui-extensions/checkout/preact";
import { FieldSection } from "./shared/FieldRenderer";
import { PostalCodeWorkaroundSection } from "./shared/PostalCodeWorkaround";
import {
  METAFIELD_NAMESPACE,
  parseConfig,
  type PostalCodeWorkaround,
} from "./shared/config";

export default function extension() {
  render(<DeliveryExtension />, document.body);
}

function DeliveryExtension() {
  const postalCodeSettings = usePostalCodeSettings();

  return (
    <s-stack direction="block" gap="base">
      <PostalCodeWorkaroundSection settings={postalCodeSettings} />
      <FieldSection
        target="delivery"
        heading="Información de entrega adicional"
      />
    </s-stack>
  );
}

function usePostalCodeSettings(): PostalCodeWorkaround {
  const [configEntries] = useAppMetafields({
    type: "shop",
    namespace: METAFIELD_NAMESPACE,
    key: "config",
  });

  const configEntry = configEntries.find((entry) => entry.metafield?.value);
  const config = parseConfig(configEntry?.metafield?.value);

  return config.postalCodeWorkaround;
}
