import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { DodoCheckout } from "../src/index.js";
import { DOM_IDS } from "../src/constants.js";

describe("DodoCheckout SDK", () => {
  beforeEach(() => {
    // Ensure clean state before each test
    if (DodoCheckout.isOpen()) {
      DodoCheckout.close("unknown");
    }
    document.body.innerHTML = "";
  });

  afterEach(() => {
    if (DodoCheckout.isOpen()) {
      DodoCheckout.close("unknown");
    }
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("opens checkout modal and attaches DOM elements", () => {
    DodoCheckout.open({
      productId: "prod_123",
      checkoutUrl: "http://localhost:5174",
    });

    expect(DodoCheckout.isOpen()).toBe(true);

    const container = document.getElementById(DOM_IDS.CONTAINER);
    const iframe = document.getElementById(DOM_IDS.IFRAME) as HTMLIFrameElement;
    const backdrop = document.getElementById(DOM_IDS.BACKDROP);
    const loader = document.getElementById(DOM_IDS.LOADER);

    expect(container).not.toBeNull();
    expect(iframe).not.toBeNull();
    expect(backdrop).not.toBeNull();
    expect(loader).not.toBeNull();
    expect(iframe.src).toContain("http://localhost:5174");
    expect(iframe.src).toContain("productId=prod_123");
  });

  it("prevents duplicate checkout instances from opening simultaneously", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    DodoCheckout.open({
      productId: "prod_123",
      checkoutUrl: "http://localhost:5174",
    });

    expect(DodoCheckout.isOpen()).toBe(true);

    // Attempt second open
    DodoCheckout.open({
      productId: "prod_456",
      checkoutUrl: "http://localhost:5174",
    });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Checkout is already open")
    );

    // Only one container should exist
    const containers = document.querySelectorAll(`#${DOM_IDS.CONTAINER}`);
    expect(containers.length).toBe(1);
  });

  it("handles close() programmatically and triggers onClose callback", () => {
    const onClose = vi.fn();

    DodoCheckout.open({
      productId: "prod_123",
      checkoutUrl: "http://localhost:5174",
      onClose,
    });

    expect(DodoCheckout.isOpen()).toBe(true);

    DodoCheckout.close("user");

    expect(DodoCheckout.isOpen()).toBe(false);
    expect(onClose).toHaveBeenCalledWith({ reason: "user" });
  });

  it("handles checkout:success postMessage from iframe", () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    DodoCheckout.open({
      productId: "prod_123",
      checkoutUrl: "http://localhost:5174",
      onSuccess,
      onClose,
    });

    const iframe = document.getElementById(DOM_IDS.IFRAME) as HTMLIFrameElement;
    expect(iframe.contentWindow).not.toBeNull();

    // Dispatch checkout:success message from the iframe window
    const messageEvent = new MessageEvent("message", {
      data: {
        type: "checkout:success",
        payload: { sessionId: "cs_test_mock_1234" },
      },
      origin: "http://localhost:5174",
      source: iframe.contentWindow,
    });

    window.dispatchEvent(messageEvent);

    expect(onSuccess).toHaveBeenCalledWith({
      sessionId: "cs_test_mock_1234",
    });
  });

  it("handles checkout:error postMessage from iframe", () => {
    const onError = vi.fn();

    DodoCheckout.open({
      productId: "prod_123",
      checkoutUrl: "http://localhost:5174",
      onError,
    });

    const iframe = document.getElementById(DOM_IDS.IFRAME) as HTMLIFrameElement;

    const messageEvent = new MessageEvent("message", {
      data: {
        type: "checkout:error",
        payload: {
          code: "PAYMENT_DECLINED",
          message: "Card was declined.",
        },
      },
      origin: "http://localhost:5174",
      source: iframe.contentWindow,
    });

    window.dispatchEvent(messageEvent);

    expect(onError).toHaveBeenCalledWith({
      code: "PAYMENT_DECLINED",
      message: "Card was declined.",
    });
  });

  it("rejects postMessage from an untrusted origin", () => {
    const onSuccess = vi.fn();

    DodoCheckout.open({
      productId: "prod_123",
      checkoutUrl: "http://localhost:5174",
      onSuccess,
    });

    const iframe = document.getElementById(DOM_IDS.IFRAME) as HTMLIFrameElement;

    // Send message from malicious origin
    const maliciousEvent = new MessageEvent("message", {
      data: {
        type: "checkout:success",
        payload: { sessionId: "cs_fake_session" },
      },
      origin: "https://evil-attacker.example.com",
      source: iframe.contentWindow,
    });

    window.dispatchEvent(maliciousEvent);

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("prevents closing via Escape key during payment processing", () => {
    const onClose = vi.fn();

    DodoCheckout.open({
      productId: "prod_123",
      checkoutUrl: "http://localhost:5174",
      onClose,
    });

    const iframe = document.getElementById(DOM_IDS.IFRAME) as HTMLIFrameElement;

    // Simulate payment_processing event
    const processingEvent = new MessageEvent("message", {
      data: { type: "checkout:payment_processing" },
      origin: "http://localhost:5174",
      source: iframe.contentWindow,
    });
    window.dispatchEvent(processingEvent);

    expect(DodoCheckout.isProcessing()).toBe(true);

    // Press Escape
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    // Should remain open because payment is in progress
    expect(DodoCheckout.isOpen()).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
  });
});
