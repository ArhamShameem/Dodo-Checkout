export interface PaymentDetails {
  email: string;
  cardNumber: string; // digits only
  expiry: string;     // MM/YY
  cvc: string;        // 3-4 digits
}

export type PaymentSimulationResult =
  | {
      status: "success";
      sessionId: string;
    }
  | {
      status: "declined";
      code: "PAYMENT_DECLINED";
      message: string;
    }
  | {
      status: "failed";
      code: "PAYMENT_FAILED";
      message: string;
    };

export interface TestCardInfo {
  number: string;
  formatted: string;
  label: string;
  description: string;
  expectedOutcome: "SUCCESS" | "DECLINED" | "FAIL_THEN_SUCCESS";
}

export const TEST_CARDS: readonly TestCardInfo[] = [
  {
    number: "4242424242424242",
    formatted: "4242 4242 4242 4242",
    label: "Always Succeeds",
    description: "Successful payment resulting in instant confirmation",
    expectedOutcome: "SUCCESS",
  },
  {
    number: "4000000000000002",
    formatted: "4000 0000 0000 0002",
    label: "Always Declined",
    description: "Simulates an issuer-declined transaction with retry prompt",
    expectedOutcome: "DECLINED",
  },
  {
    number: "4000000000000341",
    formatted: "4000 0000 0000 0341",
    label: "Fails Once, Then Succeeds",
    description: "Simulates network glitch on 1st try, succeeds on 2nd try",
    expectedOutcome: "FAIL_THEN_SUCCESS",
  },
];

// Persistent state for the fail-once card within the checkout session
let failOnceCardAttemptCount = 0;

export function resetPaymentSimulatorState(): void {
  failOnceCardAttemptCount = 0;
}

export function getFailOnceAttemptCount(): number {
  return failOnceCardAttemptCount;
}

function generateSessionId(): string {
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now().toString(36);
  return `cs_demo_${randomSuffix}${timestamp}`;
}

/**
 * Sanitizes input string to contain only numeric digits
 */
export function sanitizeDigits(input: string): string {
  return input.replace(/\D/g, "");
}

/**
 * Simulates a realistic card payment transaction with 800-1500ms delay.
 * Security notice: This function runs entirely client-side for simulation;
 * card credentials are never saved, logged, or emitted to the host.
 */
export async function simulatePayment(
  details: PaymentDetails,
  customDelayMs?: number
): Promise<PaymentSimulationResult> {
  const sanitizedCardNumber = sanitizeDigits(details.cardNumber);

  // Realistic network/gateway latency: 800ms - 1400ms
  const delay = customDelayMs ?? Math.floor(Math.random() * 600) + 800;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // 1. Success Card: 4242 4242 4242 4242
  if (sanitizedCardNumber === "4242424242424242") {
    return {
      status: "success",
      sessionId: generateSessionId(),
    };
  }

  // 2. Declined Card: 4000 0000 0000 0002
  if (sanitizedCardNumber === "4000000000000002") {
    return {
      status: "declined",
      code: "PAYMENT_DECLINED",
      message: "Your card was declined. Please check your details or try another card.",
    };
  }

  // 3. Fail-once Card: 4000 0000 0000 0341
  if (sanitizedCardNumber === "4000000000000341") {
    if (failOnceCardAttemptCount === 0) {
      failOnceCardAttemptCount += 1;
      return {
        status: "failed",
        code: "PAYMENT_FAILED",
        message: "Something went wrong while processing your payment. Please try again.",
      };
    } else {
      return {
        status: "success",
        sessionId: generateSessionId(),
      };
    }
  }

  // Fallback for any other valid 16-digit card in demo
  return {
    status: "declined",
    code: "PAYMENT_DECLINED",
    message: "Card not recognized in demo environment. Please use one of the test cards.",
  };
}
