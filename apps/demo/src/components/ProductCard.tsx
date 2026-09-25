import React from "react";
import { DODO_PRODUCT_PRO } from "@dodo/checkout-sdk";

interface ProductCardProps {
  onBuy: () => void;
  isCheckoutOpen: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  onBuy,
  isCheckoutOpen,
}) => {
  const features = [
    "Full access to cloud-scale infrastructure",
    "Unlimited webhooks and live event streaming",
    "Zero transaction fees during preview",
    "Priority 24/7 engineering support",
    "Automatic SSL and dedicated reverse proxy",
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 mb-3">
            Popular Developer Tier
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {DODO_PRODUCT_PRO.name}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl leading-relaxed">
            {DODO_PRODUCT_PRO.description}
          </p>
        </div>

        <div className="sm:text-right flex-shrink-0">
          <div className="flex items-baseline sm:justify-end gap-1">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              $49.00
            </span>
            <span className="text-xs font-bold text-slate-400">/mo</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Billed annually ($588/yr)</p>
        </div>
      </div>

      <div className="my-6 border-t border-slate-100"></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-2.5 text-xs text-slate-700">
            <svg
              className="w-4 h-4 text-emerald-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          type="button"
          onClick={onBuy}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-semibold text-sm tracking-wide shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 flex items-center justify-center gap-2"
        >
          <span>Buy Pro — $49</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>

        {isCheckoutOpen && (
          <span className="text-xs font-medium text-amber-600 flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Checkout modal currently open
          </span>
        )}
      </div>
    </div>
  );
};
