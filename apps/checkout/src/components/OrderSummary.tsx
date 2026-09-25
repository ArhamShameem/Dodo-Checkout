import React from "react";
import { ProductDetails } from "@dodo/checkout-sdk";

interface OrderSummaryProps {
  product: ProductDetails;
  onClose: () => void;
  isProcessing: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  product,
  onClose,
  isProcessing,
}) => {
  return (
    <header className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Demo Checkout
            </span>
            <span className="text-xs text-slate-400 font-mono">256-bit SSL</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {product.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            {product.description}
          </p>
        </div>

        {/* Accessible Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          aria-label="Close checkout modal"
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-baseline justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Total Due Today
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            $49.00
          </span>
          <span className="text-xs font-semibold text-slate-500">USD</span>
        </div>
      </div>
    </header>
  );
};
