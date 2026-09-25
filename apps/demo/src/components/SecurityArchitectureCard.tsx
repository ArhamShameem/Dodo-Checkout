import React from "react";

export const SecurityArchitectureCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Security & Zero-Leak Isolation Boundary
          </h3>
          <p className="text-xs text-slate-500">
            Strict postMessage contract and origin isolation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span>What the Host CAN Know</span>
          </div>
          <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
            <li>Session ID upon completion (<code className="text-emerald-700 font-mono">cs_demo_...</code>)</li>
            <li>Checkout lifecycle events (open, processing, close)</li>
            <li>Sanitized error code (<code className="font-mono text-slate-700">PAYMENT_DECLINED</code>, etc.)</li>
            <li>Close reason (<code className="font-mono text-slate-700">"user" | "success"</code>)</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/40">
          <div className="flex items-center gap-1.5 font-bold text-rose-800 mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>What the Host CANNOT Know</span>
          </div>
          <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
            <li>Customer's 16-digit Primary Account Number (PAN)</li>
            <li>Card expiration date (MM / YY)</li>
            <li>Card Verification Value (CVV / CVC)</li>
            <li>Any keystrokes or input events inside the iframe</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
