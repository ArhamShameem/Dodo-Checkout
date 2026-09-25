import {
  CloseReason,
  IncomingCheckoutMessage,
  PaymentErrorCode,
} from "./types.js";

const VALID_ERROR_CODES: readonly PaymentErrorCode[] = [
  "PAYMENT_DECLINED",
  "PAYMENT_FAILED",
  "CHECKOUT_ERROR",
  "INVALID_MESSAGE",
];

const VALID_CLOSE_REASONS: readonly CloseReason[] = [
  "user",
  "success",
  "error",
  "unknown",
];

const SENSITIVE_CARD_KEYS = [
  "cardnumber",
  "card_number",
  "pan",
  "cvc",
  "cvv",
  "expirymonth",
  "expiryyear",
  "expiry",
  "card",
];

/**
 * Validates origin URL and derives origin safely.
 */
export function getOriginFromUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return parsed.origin;
  } catch {
    return "";
  }
}

/**
 * Recursively scans an object for any sensitive card field keys.
 * Security decision: Ensure no payment credentials ever cross the iframe boundary.
 */
export function containsSensitiveData(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  for (const [key, value] of Object.entries(data)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, "");
    if (SENSITIVE_CARD_KEYS.some((sensitive) => normalizedKey.includes(sensitive))) {
      return true;
    }
    if (typeof value === "object" && value !== null) {
      if (containsSensitiveData(value)) return true;
    }
  }
  return false;
}

/**
 * Validates message data from the checkout iframe.
 * Returns the typed IncomingCheckoutMessage if valid, or null if invalid.
 */
export function validateCheckoutMessage(data: unknown): IncomingCheckoutMessage | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  // Reject any message attempting to leak card credentials
  if (containsSensitiveData(data)) {
    return null;
  }

  const raw = data as Record<string, unknown>;
  const type = raw.type;

  if (typeof type !== "string") {
    return null;
  }

  // Handle both { type, payload: { ... } } and flattened { type, ...payload } structures
  const payload = (typeof raw.payload === "object" && raw.payload !== null)
    ? (raw.payload as Record<string, unknown>)
    : raw;

  switch (type) {
    case "checkout:ready": {
      return { type: "checkout:ready" };
    }

    case "checkout:payment_processing": {
      return { type: "checkout:payment_processing" };
    }

    case "checkout:success": {
      const sessionId = payload.sessionId;
      if (typeof sessionId !== "string" || sessionId.trim().length === 0) {
        return null;
      }
      return {
        type: "checkout:success",
        payload: { sessionId: sessionId.trim() },
      };
    }

    case "checkout:error": {
      const code = payload.code as PaymentErrorCode;
      const message = payload.message;

      if (!VALID_ERROR_CODES.includes(code)) {
        return null;
      }
      if (typeof message !== "string" || message.trim().length === 0) {
        return null;
      }

      return {
        type: "checkout:error",
        payload: { code, message: message.trim() },
      };
    }

    case "checkout:close": {
      const reason = payload.reason as CloseReason;
      if (!VALID_CLOSE_REASONS.includes(reason)) {
        return null;
      }

      return {
        type: "checkout:close",
        payload: { reason },
      };
    }

    default:
      return null;
  }
}
