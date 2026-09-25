import React, { useState } from "react";
import { ProductDetails } from "@dodo/checkout-sdk";
import { CardInput } from "./CardInput.js";
import { PaymentDetails } from "../simulator.js";

interface CheckoutFormProps {
  product: ProductDetails;
  onSubmit: (details: PaymentDetails) => void;
  isProcessing: boolean;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  product,
  onSubmit,
  isProcessing,
}) => {
  const [email, setEmail] = useState("alex@example.com");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12 / 28");
  const [cvc, setCvc] = useState("123");

  const [errors, setErrors] = useState<{
    email?: string;
    cardNumber?: string;
    expiry?: string;
    cvc?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    // Email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Card number validation (must have 16 digits)
    const digitsOnly = cardNumber.replace(/\D/g, "");
    if (digitsOnly.length !== 16) {
      newErrors.cardNumber = "Please enter a valid 16-digit card number.";
    }

    // Expiry validation (MM / YY)
    const expiryDigits = expiry.replace(/\D/g, "");
    if (expiryDigits.length !== 4) {
      newErrors.expiry = "Enter MM / YY.";
    } else {
      const month = parseInt(expiryDigits.slice(0, 2), 10);
      if (month < 1 || month > 12) {
        newErrors.expiry = "Invalid month.";
      }
    }

    // CVC validation (3 or 4 digits)
    if (cvc.length < 3 || cvc.length > 4) {
      newErrors.cvc = "Enter 3-4 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return; // Prevent multiple submissions

    if (validate()) {
      onSubmit({
        email: email.trim(),
        cardNumber: cardNumber.replace(/\D/g, ""),
        expiry: expiry.trim(),
        cvc: cvc.trim(),
      });
    }
  };

  const handleQuickFill = (cardFormatted: string) => {
    setCardNumber(cardFormatted);
    setExpiry("12 / 28");
    setCvc("123");
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5 fade-in" noValidate>
      {/* Email address */}
      <div>
        <label htmlFor="customer-email" className="block text-xs font-medium text-slate-700 mb-1">
          Email address
        </label>
        <input
          id="customer-email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          disabled={isProcessing}
          placeholder="name@domain.com"
          required
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={`w-full text-sm py-2.5 px-3.5 rounded-xl border bg-white transition-all shadow-sm focus:outline-none focus:ring-2 ${
            errors.email
              ? "border-rose-400 focus:ring-rose-200 focus:border-rose-500"
              : "border-slate-300 focus:ring-slate-200 focus:border-slate-800"
          } disabled:bg-slate-50 disabled:text-slate-400`}
        />
        {errors.email && (
          <p id="email-error" className="text-xs text-rose-600 mt-1">
            {errors.email}
          </p>
        )}
      </div>

      {/* Card Details */}
      <CardInput
        cardNumber={cardNumber}
        expiry={expiry}
        cvc={cvc}
        onCardNumberChange={(val) => {
          setCardNumber(val);
          if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: undefined }));
        }}
        onExpiryChange={(val) => {
          setExpiry(val);
          if (errors.expiry) setErrors((prev) => ({ ...prev, expiry: undefined }));
        }}
        onCvcChange={(val) => {
          setCvc(val);
          if (errors.cvc) setErrors((prev) => ({ ...prev, cvc: undefined }));
        }}
        onQuickFill={handleQuickFill}
        disabled={isProcessing}
        errors={errors}
      />

      {/* Pay Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isProcessing}
          className="relative w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-sm font-semibold tracking-wide transition-all duration-150 shadow-md disabled:bg-slate-700 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Processing payment...</span>
            </>
          ) : (
            <span>Pay {product.priceFormatted}</span>
          )}
        </button>
      </div>

      {/* Security badge footer */}
      <div className="pt-1 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>End-to-end encrypted · Isolated checkout frame</span>
        </div>
      </div>
    </form>
  );
};
