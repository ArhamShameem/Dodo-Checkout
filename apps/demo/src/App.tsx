import React, { useState } from "react";
import { DodoCheckout } from "@dodo/checkout-sdk";
import { Header } from "./components/Header.js";
import { ProductCard } from "./components/ProductCard.js";
import { TestCardsGuide } from "./components/TestCardsGuide.js";
import { EventLog, LogEntry } from "./components/EventLog.js";
import { SecurityArchitectureCard } from "./components/SecurityArchitectureCard.js";

function getFormattedTime(): string {
  const now = new Date();
  return now.toTimeString().split(" ")[0] ?? "00:00:00";
}

export const App: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "init",
      time: getFormattedTime(),
      message: "store ready — ready to initialize checkout",
      type: "info",
    },
  ]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const addLog = (
    message: string,
    type: LogEntry["type"],
    details?: Record<string, unknown>
  ) => {
    setLogs((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        time: getFormattedTime(),
        message,
        type,
        details,
      },
      ...prev,
    ]);
  };

  const handleBuy = () => {
    addLog("checkout open requested (productId: prod_123)", "info");

    DodoCheckout.open({
      productId: "prod_123",
      // Optional explicit checkoutUrl, defaults to CHECKOUT_URL or http://localhost:5174
      onSuccess: ({ sessionId }) => {
        addLog(`payment success — session: ${sessionId}`, "success", {
          sessionId,
        });
      },
      onClose: ({ reason }) => {
        setIsCheckoutOpen(false);
        addLog(`checkout closed (reason: ${reason})`, "close", { reason });
      },
      onError: ({ code, message }) => {
        addLog(`payment error: ${code} — ${message}`, "error", {
          code,
          message,
        });
      },
      onEvent: (event) => {
        if (event.type === "checkout:ready") {
          setIsCheckoutOpen(true);
          addLog("checkout ready (iframe handshake completed)", "info");
        } else if (event.type === "checkout:payment_processing") {
          addLog("payment processing", "processing");
        }
      },
    });

    setIsCheckoutOpen(true);
  };

  const handleProgrammaticClose = () => {
    if (DodoCheckout.isOpen()) {
      addLog("programmatic DodoCheckout.close() invoked from host", "info");
      DodoCheckout.close("user");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 w-full">
        {/* Product Section */}
        <section aria-labelledby="product-heading">
          <ProductCard onBuy={handleBuy} isCheckoutOpen={isCheckoutOpen} />
        </section>

        {/* Test Cards Reference Guide */}
        <section aria-labelledby="test-cards-heading">
          <TestCardsGuide />
        </section>

        {/* Live Event Stream / SDK Callbacks */}
        <section aria-labelledby="events-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="events-heading" className="text-lg font-bold text-slate-900 tracking-tight">
              Real-Time Checkout Events
            </h2>
            {isCheckoutOpen && (
              <button
                type="button"
                onClick={handleProgrammaticClose}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors"
              >
                Close Programmatically (SDK API)
              </button>
            )}
          </div>
          <EventLog logs={logs} onClear={() => setLogs([])} />
        </section>

        {/* Security & Architecture Breakdown */}
        <section aria-labelledby="security-heading">
          <SecurityArchitectureCard />
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-400">
        <p>Dodo Checkout — Frontend-Only Architecture Assignment</p>
      </footer>
    </div>
  );
};

export default App;
