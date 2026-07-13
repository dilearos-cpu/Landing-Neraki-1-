import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import {
  saveCheckoutConfig,
  syncCheckoutConfigToMetafield,
} from "../models/checkout-config.server";
import type { CheckoutCustomizerConfig } from "../types/checkout-config";

export async function saveAndSyncConfig(
  request: Request,
  config: CheckoutCustomizerConfig,
) {
  const { session, admin } = await authenticate.admin(request);
  await saveCheckoutConfig(session.shop, config);
  await syncCheckoutConfigToMetafield(admin, config);
  return config;
}

export async function persistConfigAction({
  request,
}: ActionFunctionArgs): Promise<CheckoutCustomizerConfig> {
  const formData = await request.formData();
  const configJson = formData.get("config");

  if (typeof configJson !== "string") {
    throw new Response("Configuración inválida", { status: 400 });
  }

  const config = JSON.parse(configJson) as CheckoutCustomizerConfig;
  return saveAndSyncConfig(request, config);
}
