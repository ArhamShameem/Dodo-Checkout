import { ProductDetails } from "./types.js";

export const DEFAULT_CHECKOUT_URL = "http://localhost:5174";

export const DODO_PRODUCT_PRO: ProductDetails = {
  id: "prod_123",
  name: "Pro Developer Plan",
  description: "Everything you need to build and ship faster.",
  priceFormatted: "$49.00 USD",
  currency: "USD",
  amount: 4900,
};

export const DOM_IDS = {
  CONTAINER: "dodo-checkout-container",
  BACKDROP: "dodo-checkout-backdrop",
  FRAME_WRAPPER: "dodo-checkout-frame-wrapper",
  IFRAME: "dodo-checkout-iframe",
  LOADER: "dodo-checkout-loader",
  STYLE_TAG: "dodo-checkout-styles",
} as const;
