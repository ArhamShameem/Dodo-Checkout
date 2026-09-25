import { describe, it, expect } from "vitest";
import {
  containsSensitiveData,
  getOriginFromUrl,
  validateCheckoutMessage,
} from "../src/validator.js";

describe("SDK Validator", () => {
  describe("getOriginFromUrl", () => {
    it("extracts origin from standard http/https URLs", () => {
      expect(getOriginFromUrl("http://localhost:5174")).toBe("http://localhost:5174");
      expect(getOriginFromUrl("https://checkout.dodo.test:8080/pay")).toBe(
        "https://checkout.dodo.test:8080"
      );
    });

    it("returns empty string for invalid URLs", () => {
      expect(getOriginFromUrl(":::invalid-url")).toBe("");
    });
  });

  describe("containsSensitiveData", () => {
    it("detects card numbers, CVC, expiry keys", () => {
      expect(containsSensitiveData({ cardNumber: "4242424242424242" })).toBe(true);
      expect(containsSensitiveData({ cvc: "123" })).toBe(true);
      expect(containsSensitiveData({ cvv: "456" })).toBe(true);
      expect(containsSensitiveData({ expiry: "12/28" })).toBe(true);
      expect(containsSensitiveData({ nested: { pan: "4242" } })).toBe(true);
    });

    it("allows non-sensitive payloads", () => {
      expect(containsSensitiveData({ sessionId: "cs_demo_123" })).toBe(false);
      expect(containsSensitiveData({ code: "PAYMENT_DECLINED", message: "Declined" })).toBe(false);
      expect(containsSensitiveData({ reason: "user" })).toBe(false);
    });
  });

  describe("validateCheckoutMessage", () => {
    it("validates checkout:ready", () => {
      const msg = validateCheckoutMessage({ type: "checkout:ready" });
      expect(msg).toEqual({ type: "checkout:ready" });
    });

    it("validates checkout:payment_processing", () => {
      const msg = validateCheckoutMessage({ type: "checkout:payment_processing" });
      expect(msg).toEqual({ type: "checkout:payment_processing" });
    });

    it("validates checkout:success with valid sessionId", () => {
      const msg = validateCheckoutMessage({
        type: "checkout:success",
        payload: { sessionId: "cs_demo_12345" },
      });
      expect(msg).toEqual({
        type: "checkout:success",
        payload: { sessionId: "cs_demo_12345" },
      });
    });

    it("rejects checkout:success with missing or empty sessionId", () => {
      expect(validateCheckoutMessage({ type: "checkout:success", payload: { sessionId: "" } })).toBeNull();
      expect(validateCheckoutMessage({ type: "checkout:success", payload: {} })).toBeNull();
    });

    it("validates checkout:error with valid error code", () => {
      const msg = validateCheckoutMessage({
        type: "checkout:error",
        payload: { code: "PAYMENT_DECLINED", message: "Card declined" },
      });
      expect(msg).toEqual({
        type: "checkout:error",
        payload: { code: "PAYMENT_DECLINED", message: "Card declined" },
      });
    });

    it("rejects checkout:error with invalid error code", () => {
      const msg = validateCheckoutMessage({
        type: "checkout:error",
        payload: { code: "INVALID_CODE_XYZ", message: "Error" },
      });
      expect(msg).toBeNull();
    });

    it("validates checkout:close with valid reason", () => {
      const msg = validateCheckoutMessage({
        type: "checkout:close",
        payload: { reason: "user" },
      });
      expect(msg).toEqual({
        type: "checkout:close",
        payload: { reason: "user" },
      });
    });

    it("rejects messages containing sensitive card data", () => {
      const msg = validateCheckoutMessage({
        type: "checkout:success",
        payload: { sessionId: "cs_123", cardNumber: "4242424242424242" },
      });
      expect(msg).toBeNull();
    });

    it("rejects non-object or malformed input", () => {
      expect(validateCheckoutMessage(null)).toBeNull();
      expect(validateCheckoutMessage(undefined)).toBeNull();
      expect(validateCheckoutMessage("string")).toBeNull();
      expect(validateCheckoutMessage(12345)).toBeNull();
      expect(validateCheckoutMessage([])).toBeNull();
      expect(validateCheckoutMessage({})).toBeNull();
    });
  });
});
