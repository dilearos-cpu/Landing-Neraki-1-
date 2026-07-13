import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useAppMetafields } from "@shopify/ui-extensions/checkout/preact";
import {
  getBannersForTarget,
  METAFIELD_NAMESPACE,
  parseConfig,
  type BannerConfig,
  type FieldTarget,
} from "./config";

export function BannerList({ banners }: { banners: BannerConfig[] }) {
  if (banners.length === 0) {
    return null;
  }

  return (
    <s-stack direction="block" gap="base">
      {banners.map((banner) => (
        <s-banner
          key={banner.id}
          heading={banner.heading}
          tone={banner.tone}
          {...(banner.dismissible ? { dismissible: true } : {})}
        >
          {banner.message}
        </s-banner>
      ))}
    </s-stack>
  );
}

export function useBanners(target: FieldTarget) {
  const [configEntries] = useAppMetafields({
    type: "shop",
    namespace: METAFIELD_NAMESPACE,
    key: "config",
  });

  const configEntry = configEntries.find((entry) => entry.metafield?.value);
  const config = parseConfig(configEntry?.metafield?.value);

  return getBannersForTarget(config, target);
}

export function mountBannerExtension(target: FieldTarget) {
  render(<BannerExtension target={target} />, document.body);
}

function BannerExtension({ target }: { target: FieldTarget }) {
  const banners = useBanners(target);
  return <BannerList banners={banners} />;
}
