import React from "react";

interface ErrorBannerProps {
  type: "declined" | "failed";
  message: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ type, message }) => {
  const isDeclined = type === "declined";

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`p-3.5 rounded-xl border text-sm transition-all animate-fadeIn ${
        isDeclined
          ? "bg-rose-50/80 border-rose-200 text-rose-800"
          : "bg-amber-50/80 border-amber-200 text-amber-800"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <svg
          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            isDeclined ? "text-rose-600" : "text-amber-600"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          aria-hidden="true"
        >
          {isDeclined ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          )}
        </svg>

        <div className="flex-1">
          <p className="font-semibold text-xs uppercase tracking-wide">
            {isDeclined ? "Payment Declined" : "Payment Issue"}
          </p>
          <p className="text-xs mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
};
