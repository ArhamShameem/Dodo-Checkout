import React, { useState } from "react";
import { ProductDetails } from "@dodo/checkout-sdk";

interface SuccessViewProps {
  sessionId: string;
  product: ProductDetails;
  cardLast4?: string;
  onDone: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  sessionId,
  product,
  cardLast4 = "4242",
  onDone,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between p-6 h-full text-center fade-in">
      <div className="flex flex-col items-center max-w-sm mt-4">
        {/* Animated Checkmark Icon */}
        <div className="w-16 h-16 bg-emerald-100/90 text-emerald-600 rounded-full flex items-center justify-center mb-5 ring-8 ring-emerald-50">
          <svg
            className="w-8 h-8 animate-bounce-short"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Payment successful
        </h2>
        <p className="text-sm text-slate-600 mt-1.5">
          Your <strong className="font-semibold text-slate-800">{product.name}</strong> is ready.
        </p>

        {/* Receipt summary card */}
        <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mt-6 text-left space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Session ID</span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-700 select-all font-semibold">
                {sessionId}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy session ID"
                className="text-slate-400 hover:text-slate-700 text-xs transition-colors"
              >
                {copied ? (
                  <span className="text-emerald-600 font-sans font-medium">Copied!</span>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Amount Paid</span>
            <span className="text-slate-900 font-semibold font-mono">
              {product.priceFormatted}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Payment Method</span>
            <span className="text-slate-700 font-medium flex items-center gap-1">
              <span>Card ending in</span>
              <span className="font-mono font-semibold">{cardLast4}</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Status</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Completed
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-4">
          A receipt and license key have been emailed to your account.
        </p>
      </div>

      <div className="w-full mt-6">
        <button
          type="button"
          onClick={onDone}
          className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-sm font-semibold tracking-wide transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
        >
          Done
        </button>
      </div>
    </div>
  );
};
