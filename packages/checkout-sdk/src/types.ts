/**
 * Types and contracts for Dodo Checkout SDK
 */

export type PaymentErrorCode =
  | "PAYMENT_DECLINED"
  | "PAYMENT_FAILED"
  | "CHECKOUT_ERROR"
  | "INVALID_MESSAGE";

export type CloseReason = "user" | "success" | "error" | "unknown";

export interface SuccessPayload {
  sessionId: string;
}

export interface ClosePayload {
  reason: CloseReason;
}

export interface ErrorPayload {
  code: PaymentErrorCode;
  message: string;
}

export interface InitPayload {
  productId: string;
}

export interface CheckoutReadyMessage {
  type: "checkout:ready";
}

export interface CheckoutInitMessage {
  type: "checkout:init";
  payload: InitPayload;
}

export interface CheckoutProcessingMessage {
  type: "checkout:payment_processing";
}

export interface CheckoutSuccessMessage {
  type: "checkout:success";
  payload: SuccessPayload;
}

export interface CheckoutErrorMessage {
  type: "checkout:error";
  payload: ErrorPayload;
}

export interface CheckoutCloseMessage {
  type: "checkout:close";
  payload: ClosePayload;
}

export type IncomingCheckoutMessage =
  | CheckoutReadyMessage
  | CheckoutProcessingMessage
  | CheckoutSuccessMessage
  | CheckoutErrorMessage
  | CheckoutCloseMessage;

export type OutgoingCheckoutMessage =
  | CheckoutInitMessage;

export type CheckoutEventType =
  | "checkout:ready"
  | "checkout:init"
  | "checkout:payment_processing"
  | "checkout:success"
  | "checkout:error"
  | "checkout:close";

export interface CheckoutOptions {
  productId: string;
  checkoutUrl?: string;
  onSuccess?: (payload: SuccessPayload) => void;
  onClose?: (payload: ClosePayload) => void;
  onError?: (payload: ErrorPayload) => void;
  onEvent?: (event: IncomingCheckoutMessage) => void;
}

export interface ProductDetails {
  id: string;
  name: string;
  description: string;
  priceFormatted: string;
  currency: string;
  amount: number;
}
