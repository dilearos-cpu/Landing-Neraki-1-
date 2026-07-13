import "@shopify/ui-extensions/preact";
import { useEffect, useState } from "preact/hooks";
import {
  useApplyShippingAddressChange,
  useShippingAddress,
} from "@shopify/ui-extensions/checkout/preact";
import {
  normalizePostalCodeWorkaround,
  type PostalCodeWorkaround,
} from "./config";

export function PostalCodeWorkaroundSection({
  settings: rawSettings,
}: {
  settings: PostalCodeWorkaround;
}) {
  const settings = normalizePostalCodeWorkaround(rawSettings);
  const shippingAddress = useShippingAddress();
  const applyShippingAddressChange = useApplyShippingAddressChange();
  const [manualZip, setManualZip] = useState("");

  const currentZip =
    shippingAddress?.zip?.trim() || settings.defaultValue || "000000";

  useEffect(() => {
    setManualZip(currentZip);
  }, [currentZip]);

  useEffect(() => {
    if (!settings.enabled || !settings.autoFill || !applyShippingAddressChange) {
      return;
    }

    const zip = shippingAddress?.zip?.trim();
    if (zip) {
      return;
    }

    void applyShippingAddressChange({
      type: "updateShippingAddress",
      address: {
        zip: settings.defaultValue,
      },
    });
  }, [
    settings.enabled,
    settings.autoFill,
    settings.defaultValue,
    shippingAddress?.zip,
    applyShippingAddressChange,
  ]);

  if (!settings.enabled || settings.displayMode === "silent") {
    return null;
  }

  if (settings.displayMode === "banner") {
    return (
      <s-banner tone="info" heading="Código postal">
        {settings.bannerMessage}
      </s-banner>
    );
  }

  const summary = settings.collapsedSummary.replace("{zip}", currentZip);

  async function handleManualZipChange(nextValue: string) {
    setManualZip(nextValue);

    if (!applyShippingAddressChange || !nextValue.trim()) {
      return;
    }

    await applyShippingAddressChange({
      type: "updateShippingAddress",
      address: {
        zip: nextValue.trim(),
      },
    });
  }

  return (
    <s-details>
      <s-summary>{summary}</s-summary>
      <s-stack direction="block" gap="base">
        <s-text>{settings.expandedMessage}</s-text>
        <s-text color="subdued">
          El campo de código postal del formulario de dirección también se
          actualizará con el valor que indiques.
        </s-text>
        {settings.allowManualEdit ? (
          <s-text-field
            label="Tu código postal"
            name="custom_postal_code"
            value={manualZip}
            onInput={(event: Event) => {
              const target = event.currentTarget as HTMLInputElement;
              void handleManualZipChange(target.value);
            }}
          />
        ) : null}
      </s-stack>
    </s-details>
  );
}
