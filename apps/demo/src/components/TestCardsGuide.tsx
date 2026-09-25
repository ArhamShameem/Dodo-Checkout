import React, { useState } from "react";

interface TestCardRow {
  number: string;
  name: string;
  expectedResult: string;
  behavior: string;
  badgeClass: string;
}

export const TestCardsGuide: React.FC = () => {
  const [copiedCard, setCopiedCard] = useState<string | null>(null);

  const testCards: TestCardRow[] = [
    {
      number: "4242 4242 4242 4242",
      name: "Success Card",
      expectedResult: "SUCCESS",
      behavior: "Immediate simulated authorization and generates a session ID.",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      number: "4000 0000 0000 0002",
      name: "Declined Card",
      expectedResult: "DECLINED",
      behavior: "Simulates an issuer rejection (PAYMENT_DECLINED). Allows retry.",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    },
    {
      number: "4000 0000 0000 0341",
      name: "Fail-Once Card",
      expectedResult: "FAIL → SUCCESS",
      behavior: "Fails 1st attempt (PAYMENT_FAILED). Retrying same card succeeds.",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ];

  const handleCopy = (card: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(card.replace(/\s+/g, ""));
      setCopiedCard(card);
      setTimeout(() => setCopiedCard(null), 1800);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Required Simulator Test Cards
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Use any expiry (e.g. 12/28) and any 3-digit CVC (e.g. 123)
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">Zero backend needed</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {testCards.map((card) => (
          <div
            key={card.number}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between hover:bg-slate-50 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">{card.name}</span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${card.badgeClass}`}
                >
                  {card.expectedResult}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                {card.behavior}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <code className="text-xs font-mono font-semibold text-slate-800 select-all">
                {card.number}
              </code>
              <button
                type="button"
                onClick={() => handleCopy(card.number)}
                className="text-[11px] text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded bg-white border border-slate-200 shadow-2xs hover:bg-slate-100 transition-colors"
              >
                {copiedCard === card.number ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
