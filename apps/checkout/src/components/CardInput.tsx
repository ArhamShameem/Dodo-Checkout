import React from "react";
import { TEST_CARDS } from "../simulator.js";

interface CardInputProps {
  cardNumber: string;
  expiry: string;
  cvc: string;
  onCardNumberChange: (value: string) => void;
  onExpiryChange: (value: string) => void;
  onCvcChange: (value: string) => void;
  onQuickFill: (num: string) => void;
  disabled: boolean;
  errors: {
    cardNumber?: string;
    expiry?: string;
    cvc?: string;
  };
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.substring(i, i + 4));
  }
  return parts.join(" ");
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  }
  return digits;
}

export const CardInput: React.FC<CardInputProps> = ({
  cardNumber,
  expiry,
  cvc,
  onCardNumberChange,
  onExpiryChange,
  onCvcChange,
  onQuickFill,
  disabled,
  errors,
}) => {
  const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    onCardNumberChange(formatted);
  };

  const handleExpiryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatExpiry(raw);
    onExpiryChange(formatted);
  };

  const handleCvcInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    onCvcChange(digits);
  };

  // Card brand detection (Visa starts with 4, Mastercard with 5)
  const isVisa = cardNumber.replace(/\D/g, "").startsWith("4");

  return (
    <div className="space-y-4">
      {/* Test Card Quick Fill Pills */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Payment Method
          </label>
          <span className="text-[11px] text-slate-400">Card details are never logged</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {TEST_CARDS.map((tc) => (
            <button
              key={tc.number}
              type="button"
              disabled={disabled}
              onClick={() => onQuickFill(tc.formatted)}
              className="text-[11px] font-medium px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition-colors disabled:opacity-50"
              title={tc.description}
            >
              Fill: {tc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card Number Field */}
      <div>
        <label htmlFor="card-number" className="block text-xs font-medium text-slate-700 mb-1">
          Card number
        </label>
        <div className="relative">
          <input
            id="card-number"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            value={cardNumber}
            onChange={handleCardInput}
            disabled={disabled}
            placeholder="4242 4242 4242 4242"
            maxLength={19}
            aria-invalid={!!errors.cardNumber}
            aria-describedby={errors.cardNumber ? "card-number-error" : undefined}
            className={`w-full font-mono text-sm py-2.5 pl-3.5 pr-14 rounded-xl border bg-white transition-all shadow-sm focus:outline-none focus:ring-2 ${
              errors.cardNumber
                ? "border-rose-400 focus:ring-rose-200 focus:border-rose-500"
                : "border-slate-300 focus:ring-slate-200 focus:border-slate-800"
            } disabled:bg-slate-50 disabled:text-slate-400`}
          />

          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            {isVisa ? (
              <span className="text-xs font-extrabold tracking-wider text-blue-700 font-sans italic">
                VISA
              </span>
            ) : (
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z"
                />
              </svg>
            )}
          </div>
        </div>
        {errors.cardNumber && (
          <p id="card-number-error" className="text-xs text-rose-600 mt-1">
            {errors.cardNumber}
          </p>
        )}
      </div>

      {/* Expiry and CVC grid */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="card-expiry" className="block text-xs font-medium text-slate-700 mb-1">
            Expiration
          </label>
          <input
            id="card-expiry"
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            value={expiry}
            onChange={handleExpiryInput}
            disabled={disabled}
            placeholder="MM / YY"
            maxLength={7}
            aria-invalid={!!errors.expiry}
            aria-describedby={errors.expiry ? "card-expiry-error" : undefined}
            className={`w-full font-mono text-sm py-2.5 px-3.5 rounded-xl border bg-white transition-all shadow-sm focus:outline-none focus:ring-2 ${
              errors.expiry
                ? "border-rose-400 focus:ring-rose-200 focus:border-rose-500"
                : "border-slate-300 focus:ring-slate-200 focus:border-slate-800"
            } disabled:bg-slate-50 disabled:text-slate-400`}
          />
          {errors.expiry && (
            <p id="card-expiry-error" className="text-xs text-rose-600 mt-1">
              {errors.expiry}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="card-cvc" className="block text-xs font-medium text-slate-700 mb-1">
            CVC
          </label>
          <div className="relative">
            <input
              id="card-cvc"
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              value={cvc}
              onChange={handleCvcInput}
              disabled={disabled}
              placeholder="123"
              maxLength={4}
              aria-invalid={!!errors.cvc}
              aria-describedby={errors.cvc ? "card-cvc-error" : undefined}
              className={`w-full font-mono text-sm py-2.5 pl-3.5 pr-8 rounded-xl border bg-white transition-all shadow-sm focus:outline-none focus:ring-2 ${
                errors.cvc
                  ? "border-rose-400 focus:ring-rose-200 focus:border-rose-500"
                  : "border-slate-300 focus:ring-slate-200 focus:border-slate-800"
              } disabled:bg-slate-50 disabled:text-slate-400`}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
          </div>
          {errors.cvc && (
            <p id="card-cvc-error" className="text-xs text-rose-600 mt-1">
              {errors.cvc}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
