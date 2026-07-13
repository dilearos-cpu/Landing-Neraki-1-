import "@shopify/ui-extensions/preact";
import { useEffect } from "preact/hooks";
import {
  useApplyShippingAddressChange,
  useShippingAddress,
} from "@shopify/ui-extensions/checkout/preact";
import type { PostalCodeWorkaround } from "./config";

export function PostalCodeWorkaroundSection({
  settings,
}: {
  settings: PostalCodeWorkaround;
}) {
  const shippingAddress = useShippingAddress();
  const applyShippingAddressChange = useApplyShippingAddressChange();

  useEffect(() => {
    if (!settings.enabled || !settings.autoFill || !applyShippingAddressChange) {
      return;
    }

    const currentZip = shippingAddress?.zip?.trim();
    if (currentZip) {
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

  if (!settings.enabled || !settings.showBanner) {
    return null;
  }

  return (
    <s-banner tone="info" heading="Código postal">
      {settings.bannerMessage}
    </s-banner>
  );
}
