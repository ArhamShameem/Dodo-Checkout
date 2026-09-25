import {
  CloseReason,
  CheckoutOptions,
  IncomingCheckoutMessage,
  PaymentErrorCode,
} from "./types.js";
import { DEFAULT_CHECKOUT_URL } from "./constants.js";
import { getOriginFromUrl, validateCheckoutMessage } from "./validator.js";
import {
  createModalElements,
  hideLoader,
  ModalElements,
  removeModalElements,
} from "./ui.js";

export * from "./types.js";
export * from "./constants.js";
export * from "./validator.js";

interface CustomImportMeta {
  env?: {
    VITE_CHECKOUT_URL?: string;
    [key: string]: unknown;
  };
}

/**
 * Internal state for the singleton checkout SDK
 */
interface SDKState {
  isOpen: boolean;
  isProcessing: boolean;
  elements: ModalElements | null;
  options: CheckoutOptions | null;
  expectedOrigin: string;
  messageListener: ((event: MessageEvent) => void) | null;
  keydownListener: ((event: KeyboardEvent) => void) | null;
  backdropClickListener: ((event: MouseEvent) => void) | null;
  loadTimeoutId: ReturnType<typeof setTimeout> | null;
}

const state: SDKState = {
  isOpen: false,
  isProcessing: false,
  elements: null,
  options: null,
  expectedOrigin: "",
  messageListener: null,
  keydownListener: null,
  backdropClickListener: null,
  loadTimeoutId: null,
};

/**
 * Resolves the target checkout URL based on options or environment configuration.
 */
function resolveCheckoutUrl(optionsUrl?: string, productId?: string): string {
  let base = optionsUrl;
  
  // Check build-time / runtime environment variable if available
  const customMeta = import.meta as unknown as CustomImportMeta;
  if (!base && customMeta?.env?.VITE_CHECKOUT_URL) {
    base = customMeta.env.VITE_CHECKOUT_URL;
  }

  if (!base) {
    base = DEFAULT_CHECKOUT_URL;
  }

  try {
    const url = new URL(base, window.location.href);
    if (productId) {
      url.searchParams.set("productId", productId);
    }
    return url.toString();
  } catch {
    return base;
  }
}

/**
 * Core DodoCheckout SDK controller
 */
class DodoCheckoutSDK {
  /**
   * Check whether checkout is currently open
   */
  public isOpen(): boolean {
    return state.isOpen;
  }

  /**
   * Check whether payment is currently processing
   */
  public isProcessing(): boolean {
    return state.isProcessing;
  }

  /**
   * Opens the checkout modal
   */
  public open(options: CheckoutOptions): void {
    if (typeof window === "undefined" || typeof document === "undefined") {
      console.warn("[DodoCheckout] Cannot open in non-browser environment.");
      return;
    }

    // Edge Case: Duplicate open requests while already open
    if (state.isOpen) {
      console.warn("[DodoCheckout] Checkout is already open. Multiple instances are prevented.");
      return;
    }

    if (!options || typeof options.productId !== "string" || !options.productId.trim()) {
      const err = {
        code: "CHECKOUT_ERROR" as PaymentErrorCode,
        message: "A valid productId must be provided to DodoCheckout.open().",
      };
      options?.onError?.(err);
      return;
    }

    const checkoutUrl = resolveCheckoutUrl(options.checkoutUrl, options.productId);
    const expectedOrigin = getOriginFromUrl(checkoutUrl);

    if (!expectedOrigin) {
      const err = {
        code: "CHECKOUT_ERROR" as PaymentErrorCode,
        message: `Invalid checkout URL provided: ${checkoutUrl}`,
      };
      options.onError?.(err);
      return;
    }

    state.isOpen = true;
    state.isProcessing = false;
    state.options = options;
    state.expectedOrigin = expectedOrigin;

    // Create modal elements
    const elements = createModalElements(checkoutUrl);
    state.elements = elements;

    // Listen for Escape key
    state.keydownListener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (state.isProcessing) {
          // Prevent accidental dismissal while payment is processing
          return;
        }
        this.close("user");
      }
    };
    window.addEventListener("keydown", state.keydownListener);

    // Backdrop click
    state.backdropClickListener = (event: MouseEvent) => {
      if (event.target === elements.backdrop) {
        if (state.isProcessing) {
          // Do not allow backdrop click to dismiss during processing
          return;
        }
        this.close("user");
      }
    };
    elements.backdrop.addEventListener("click", state.backdropClickListener);

    // Timeout for iframe loading (15 seconds)
    state.loadTimeoutId = setTimeout(() => {
      if (state.isOpen && elements.loader && !elements.loader.classList.contains("dodo-hidden")) {
        const errorPayload = {
          code: "CHECKOUT_ERROR" as PaymentErrorCode,
          message: "Checkout took too long to load. Please check your connection and try again.",
        };
        state.options?.onError?.(errorPayload);
        state.options?.onEvent?.({ type: "checkout:error", payload: errorPayload });
      }
    }, 15000);

    // Listen for postMessage
    state.messageListener = (event: MessageEvent) => {
      // 1. Validate message origin
      if (event.origin !== state.expectedOrigin) {
        return;
      }

      // 2. Validate message source window (must be the checkout iframe)
      if (!elements.iframe.contentWindow || event.source !== elements.iframe.contentWindow) {
        return;
      }

      // 3. Validate message payload and schema
      const message: IncomingCheckoutMessage | null = validateCheckoutMessage(event.data);
      if (!message) {
        // Discard malformed or invalid messages
        return;
      }

      this.handleIncomingMessage(message);
    };

    window.addEventListener("message", state.messageListener);
  }

  /**
   * Internal message dispatcher
   */
  private handleIncomingMessage(message: IncomingCheckoutMessage): void {
    if (!state.isOpen || !state.options || !state.elements) return;

    // Forward event to observer if provided
    state.options.onEvent?.(message);

    switch (message.type) {
      case "checkout:ready": {
        if (state.loadTimeoutId) {
          clearTimeout(state.loadTimeoutId);
          state.loadTimeoutId = null;
        }
        hideLoader(state.elements.loader);

        // Send checkout:init handshake to iframe with targetOrigin
        if (state.elements.iframe.contentWindow) {
          state.elements.iframe.contentWindow.postMessage(
            {
              type: "checkout:init",
              payload: { productId: state.options.productId },
            },
            state.expectedOrigin
          );
        }
        break;
      }

      case "checkout:payment_processing": {
        state.isProcessing = true;
        break;
      }

      case "checkout:success": {
        state.isProcessing = false;
        state.options.onSuccess?.(message.payload);
        break;
      }

      case "checkout:error": {
        state.isProcessing = false;
        state.options.onError?.(message.payload);
        break;
      }

      case "checkout:close": {
        state.isProcessing = false;
        this.close(message.payload.reason);
        break;
      }
    }
  }

  /**
   * Closes the checkout modal and cleans up DOM & listeners
   */
  public close(reason: CloseReason = "user"): void {
    if (!state.isOpen) {
      return;
    }

    const { options, elements, messageListener, keydownListener, backdropClickListener, loadTimeoutId } = state;

    if (loadTimeoutId) {
      clearTimeout(loadTimeoutId);
    }

    // Remove event listeners
    if (messageListener) {
      window.removeEventListener("message", messageListener);
    }
    if (keydownListener) {
      window.removeEventListener("keydown", keydownListener);
    }
    if (backdropClickListener && elements?.backdrop) {
      elements.backdrop.removeEventListener("click", backdropClickListener);
    }

    // Remove modal DOM elements cleanly
    if (elements) {
      removeModalElements(elements);
    }

    // Reset SDK internal state
    state.isOpen = false;
    state.isProcessing = false;
    state.elements = null;
    state.options = null;
    state.expectedOrigin = "";
    state.messageListener = null;
    state.keydownListener = null;
    state.backdropClickListener = null;
    state.loadTimeoutId = null;

    // Fire callback to host merchant
    options?.onClose?.({ reason });
    options?.onEvent?.({
      type: "checkout:close",
      payload: { reason },
    });
  }
}

export const DodoCheckout = new DodoCheckoutSDK();
export default DodoCheckout;
