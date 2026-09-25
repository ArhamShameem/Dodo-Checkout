import React, { useEffect, useState, useRef } from "react";
import {
  DODO_PRODUCT_PRO,
  ProductDetails,
  IncomingCheckoutMessage,
} from "@dodo/checkout-sdk";
import { OrderSummary } from "./components/OrderSummary.js";
import { CheckoutForm } from "./components/CheckoutForm.js";
import { SuccessView } from "./components/SuccessView.js";
import { ErrorBanner } from "./components/ErrorBanner.js";
import { PaymentDetails, simulatePayment } from "./simulator.js";

type CheckoutUIState = "idle" | "processing" | "success" | "declined" | "failed";

export const App: React.FC = () => {
  const [product] = useState<ProductDetails>(DODO_PRODUCT_PRO);
  const [uiState, setUiState] = useState<CheckoutUIState>("idle");
  const [sessionId, setSessionId] = useState<string>("");
  const [last4, setLast4] = useState<string>("4242");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Captured trusted parent origin
  const parentOriginRef = useRef<string>("");

  // Determine host origin safely
  const getParentOrigin = (): string => {
    if (parentOriginRef.current) {
      return parentOriginRef.current;
    }
    // Check hostOrigin passed securely via URL query params by SDK
    if (typeof window !== "undefined" && window.location?.search) {
      try {
        const params = new URLSearchParams(window.location.search);
        const hostOriginParam = params.get("hostOrigin");
        if (hostOriginParam) {
          const parsed = new URL(hostOriginParam).origin;
          if (parsed && parsed !== "null") {
            return parsed;
          }
        }
      } catch {
        // invalid URL param
      }
    }
    if (typeof document !== "undefined" && document.referrer) {
      try {
        const refOrigin = new URL(document.referrer).origin;
        if (refOrigin && refOrigin !== "null") {
          return refOrigin;
        }
      } catch {
        // invalid referrer URL
      }
    }
    // Default fallback in development environment
    return "http://localhost:5173";
  };

  /**
   * Safely dispatches typed postMessage to parent frame with explicit targetOrigin
   */
  const postToParent = (message: IncomingCheckoutMessage) => {
    if (typeof window === "undefined" || window.parent === window) {
      return;
    }
    const targetOrigin = getParentOrigin();
    window.parent.postMessage(message, targetOrigin);
  };

  // Initial handshake: announce ready and listen for init
  useEffect(() => {
    const handleParentMessage = (event: MessageEvent) => {
      // Security: Only accept messages from the parent window
      if (event.source !== window.parent) {
        return;
      }

      // Lock parent origin upon handshake
      if (event.origin && event.origin !== "null") {
        parentOriginRef.current = event.origin;
      }

      if (event.data?.type === "checkout:init") {
        // Initialized by SDK
      }
    };

    window.addEventListener("message", handleParentMessage);

    // Announce to SDK that the iframe application is ready
    postToParent({ type: "checkout:ready" });

    return () => {
      window.removeEventListener("message", handleParentMessage);
    };
  }, []);

  const handlePaymentSubmit = async (details: PaymentDetails) => {
    if (uiState === "processing") return;

    setUiState("processing");
    setErrorMessage("");
    setLast4(details.cardNumber.slice(-4) || "4242");

    // Notify host that payment is actively processing
    postToParent({ type: "checkout:payment_processing" });

    try {
      const result = await simulatePayment(details);

      if (result.status === "success") {
        setSessionId(result.sessionId);
        setUiState("success");

        // Notify host of successful checkout
        postToParent({
          type: "checkout:success",
          payload: { sessionId: result.sessionId },
        });
      } else if (result.status === "declined") {
        setUiState("declined");
        setErrorMessage(result.message);

        // Notify host of declined payment
        postToParent({
          type: "checkout:error",
          payload: {
            code: result.code,
            message: result.message,
          },
        });
      } else if (result.status === "failed") {
        setUiState("failed");
        setErrorMessage(result.message);

        // Notify host of temporary failure
        postToParent({
          type: "checkout:error",
          payload: {
            code: result.code,
            message: result.message,
          },
        });
      }
    } catch {
      setUiState("failed");
      const fallbackMsg = "An unexpected error occurred while processing. Please try again.";
      setErrorMessage(fallbackMsg);
      postToParent({
        type: "checkout:error",
        payload: {
          code: "PAYMENT_FAILED",
          message: fallbackMsg,
        },
      });
    }
  };

  const handleClose = () => {
    // If payment is currently processing, avoid accidental dismissal
    if (uiState === "processing") return;

    const reason = uiState === "success" ? "success" : "user";
    postToParent({
      type: "checkout:close",
      payload: { reason },
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between selection:bg-slate-100">
      <div>
        {/* Header / Product summary */}
        <OrderSummary
          product={product}
          onClose={handleClose}
          isProcessing={uiState === "processing"}
        />

        {/* Error notification banner if declined or failed */}
        {(uiState === "declined" || uiState === "failed") && (
          <div className="px-6 pt-4">
            <ErrorBanner type={uiState} message={errorMessage} />
          </div>
        )}

        {/* Main Content Area */}
        {uiState === "success" ? (
          <SuccessView
            sessionId={sessionId}
            product={product}
            cardLast4={last4}
            onDone={handleClose}
          />
        ) : (
          <CheckoutForm
            product={product}
            onSubmit={handlePaymentSubmit}
            isProcessing={uiState === "processing"}
          />
        )}
      </div>
    </div>
  );
};

export default App;
