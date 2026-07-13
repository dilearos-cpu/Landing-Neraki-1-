import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { BannerList, useBanners } from "./shared/BannerRenderer";
import { FieldSection } from "./shared/FieldRenderer";

export default function extension() {
  render(<BlockExtension />, document.body);
}

function BlockExtension() {
  const banners = useBanners("block");

  return (
    <s-stack direction="block" gap="base">
      <BannerList banners={banners} />
      <FieldSection target="block" heading="Campos personalizados" />
    </s-stack>
  );
}
