import { describe, it, expect, beforeEach } from "vitest";
import {
  simulatePayment,
  resetPaymentSimulatorState,
  getFailOnceAttemptCount,
} from "../simulator.js";

describe("Payment Simulator", () => {
  beforeEach(() => {
    resetPaymentSimulatorState();
  });

  it("handles successful card 4242 4242 4242 4242", async () => {
    const result = await simulatePayment(
      {
        email: "alex@example.com",
        cardNumber: "4242 4242 4242 4242",
        expiry: "12/28",
        cvc: "123",
      },
      10 // fast delay for unit test
    );

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.sessionId).toMatch(/^cs_demo_[a-z0-9]+/);
    }
  });

  it("handles declined card 4000 0000 0000 0002", async () => {
    const result = await simulatePayment(
      {
        email: "alex@example.com",
        cardNumber: "4000 0000 0000 0002",
        expiry: "12/28",
        cvc: "123",
      },
      10
    );

    expect(result.status).toBe("declined");
    if (result.status === "declined") {
      expect(result.code).toBe("PAYMENT_DECLINED");
      expect(result.message).toContain("declined");
    }
  });

  it("handles fail-once card 4000 0000 0000 0341: fails first, succeeds second", async () => {
    expect(getFailOnceAttemptCount()).toBe(0);

    // Attempt 1: Should fail
    const result1 = await simulatePayment(
      {
        email: "alex@example.com",
        cardNumber: "4000 0000 0000 0341",
        expiry: "12/28",
        cvc: "123",
      },
      10
    );

    expect(result1.status).toBe("failed");
    if (result1.status === "failed") {
      expect(result1.code).toBe("PAYMENT_FAILED");
      expect(result1.message).toContain("went wrong");
    }
    expect(getFailOnceAttemptCount()).toBe(1);

    // Attempt 2: Should succeed
    const result2 = await simulatePayment(
      {
        email: "alex@example.com",
        cardNumber: "4000 0000 0000 0341",
        expiry: "12/28",
        cvc: "123",
      },
      10
    );

    expect(result2.status).toBe("success");
    if (result2.status === "success") {
      expect(result2.sessionId).toMatch(/^cs_demo_[a-z0-9]+/);
    }
  });

  it("declines unlisted test card numbers", async () => {
    const result = await simulatePayment(
      {
        email: "alex@example.com",
        cardNumber: "4111 1111 1111 1111",
        expiry: "12/28",
        cvc: "123",
      },
      10
    );

    expect(result.status).toBe("declined");
  });
});
