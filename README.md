# Dodo Checkout — Embeddable Checkout System

> A tiny, secure, framework-independent embeddable checkout system built with TypeScript, React, Vite, and Tailwind CSS.

---

## 1. Project Overview

**Dodo Checkout** is an embeddable payment checkout architecture designed for seamless merchant integration. It demonstrates production-grade frontend engineering, isolation boundaries, accessibility, strict message contracts, and UX resilience—all without any backend, database, or external payment processor.

The repository is organized as an **npm workspaces monorepo** consisting of three distinct packages:

1. **`packages/checkout-sdk`**: A lightweight (~2KB gzipped), framework-independent TypeScript SDK that orchestrates modal injection, lifecycle tracking, cross-origin communication, and cleanup.
2. **`apps/checkout`**: A standalone React 18 + Tailwind CSS checkout application loaded securely inside an isolated `<iframe>`. Contains the fake payment simulator, reactive validation, and multi-state UI.
3. **`apps/demo`**: A realistic merchant storefront demonstrating SDK integration, live callback telemetry, and simulator test card workflows.

```
dodo-checkout/
├── apps/
│   ├── demo/              # Merchant storefront (React + Vite, port 5173)
│   └── checkout/          # Sandboxed checkout modal app (React + Vite, port 5174)
├── packages/
│   └── checkout-sdk/      # Zero-dependency TypeScript checkout SDK
├── package.json           # npm workspaces root configuration
├── vitest.config.ts       # Vitest unit & integration test configuration
├── README.md              # Architectural & implementation guide
└── .gitignore
```

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ HOST / MERCHANT APPLICATION (apps/demo - http://localhost:5173) │
│                                                                 │
│   DodoCheckout.open({ productId: 'prod_123', ... })             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ CHECKOUT SDK (packages/checkout-sdk)                            │
│                                                                 │
│   1. Dynamically constructs DOM modal & loading spinner         │
│   2. Instantiates sandboxed <iframe> (http://localhost:5174)     │
│   3. Enforces strict window.postMessage origin & payload guards │
│   4. Translates valid messages into typed callbacks             │
└───────────────────────────────▲─────────────────────────────────┘
                                │ postMessage (Bidirectional Handshake)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ CHECKOUT APPLICATION (apps/checkout - http://localhost:5174)    │
│                                                                 │
│   1. Isolated inside <iframe> with restricted sandbox           │
│   2. Captures cardholder PAN, CVC, expiry (Client-side only)    │
│   3. Runs payment simulator (800–1500ms realistic delay)        │
│   4. Never leaks card numbers, CVVs, or keystrokes to host      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. How to Install

Ensure you have **Node.js (v18+)** and **npm (v9+)** installed.

```bash
# Clone the repository (or navigate to workspace)
cd dodo-checkout

# Install all workspace dependencies
npm install
```

---

## 4. How to Run Locally

You can run both the merchant demo store and checkout application simultaneously or independently:

### Option A: Run Both Together (Recommended)
```bash
npm run dev
```
* **Demo Store:** [http://localhost:5173](http://localhost:5173)
* **Checkout App:** [http://localhost:5174](http://localhost:5174)

### Option B: Run Individually
```bash
# Terminal 1: Start Checkout Application (Port 5174)
npm run dev:checkout

# Terminal 2: Start Demo Store (Port 5173)
npm run dev:demo
```

---

## 5. How to Build & Test

```bash
# Run all unit and integration tests (Vitest)
npm test

# Build all packages & applications for production
npm run build
```

Individual workspace build commands:
* `npm run build:sdk` — Compiles TypeScript definitions (`.d.ts`) and ESM output.
* `npm run build:checkout` — Type-checks and bundles checkout application with Vite.
* `npm run build:demo` — Type-checks and bundles demo merchant store with Vite.

---

## 5.1 Vercel Deployment Configuration

When deploying this npm-workspaces monorepo to Vercel, **keep the Root Directory set to the repository root (`./`)** in the Vercel project settings. This enables Vercel to install all workspace dependencies, link `@dodo/checkout-sdk`, and execute the builds properly.

### Checkout Application Project
* **Root Directory:** `./` (Repository root)
* **Framework Preset:** `Vite`
* **Build Command:** `npm run build --workspace=@dodo/checkout` (or `npm run build:checkout`)
* **Output Directory:** `apps/checkout/dist`
* **Install Command:** `npm install`

### Demo Store Application Project
* **Root Directory:** `./` (Repository root)
* **Framework Preset:** `Vite`
* **Build Command:** `npm run build --workspace=@dodo/demo` (or `npm run build:demo`)
* **Output Directory:** `apps/demo/dist`
* **Install Command:** `npm install`

*(Note: Pre-configured [`apps/checkout/vercel.json`](file:///C:/Users/golus/Desktop/dodo-checkout/apps/checkout/vercel.json) and [`apps/demo/vercel.json`](file:///C:/Users/golus/Desktop/dodo-checkout/apps/demo/vercel.json) files are included in the repository).*

---

## 6. How the Checkout SDK Works

The SDK (`@dodo/checkout-sdk`) provides a minimal, clean, and declarative API:

```typescript
import { DodoCheckout } from "@dodo/checkout-sdk";

// Open the checkout modal
DodoCheckout.open({
  productId: "prod_123",
  
  onSuccess: ({ sessionId }) => {
    console.log("Payment successful! Session ID:", sessionId);
  },

  onError: ({ code, message }) => {
    console.warn(`Payment failed [${code}]:`, message);
  },

  onClose: ({ reason }) => {
    console.log("Checkout closed by:", reason); // "user" | "success" | "error" | "unknown"
  },

  // Optional: Event stream observer for logging & analytics
  onEvent: (event) => {
    console.log("SDK Event:", event.type);
  },
});

// Programmatic close if needed
DodoCheckout.close();
```

### SDK Lifecycle & Guarantees:
1. **Singleton Concurrency Guard:** Prevents multiple checkout instances from opening concurrently. Consecutive calls to `open()` while an active session exists are safely ignored with a warning.
2. **Dynamic DOM Injection:** Modals, backdrop overlays, and accessible wrappers are injected with pure zero-dependency JavaScript.
3. **Graceful Loading:** A skeleton loader and spinner are rendered immediately; the iframe remains hidden until `checkout:ready` handshake completes.
4. **Idempotent Cleanup:** When closed (via close button, Escape key, backdrop click, or completion), the SDK destroys the iframe, removes DOM nodes, detaches event listeners, and resets internal state without memory leaks.

---

## 7. How Iframe Communication Works

Communication between the host merchant window and the checkout iframe happens strictly via the `window.postMessage` API using a structured handshake:

```
HOST (Demo / SDK)                                CHECKOUT IFRAME
      │                                                │
      │ ─── 1. Iframe loaded & mounted ──────────────> │
      │                                                │
      │ <── 2. "checkout:ready" ────────────────────── │
      │                                                │
      │ ─── 3. "checkout:init" { productId } ────────> │
      │                                                │
      │ <── 4. "checkout:payment_processing" ───────── │
      │                                                │
      │ <── 5. "checkout:success" { sessionId } ────── │
      │      OR "checkout:error" { code, message }     │
      │                                                │
      │ <── 6. "checkout:close" { reason } ─────────── │
```

---

## 8. How `postMessage` is Secured

Cross-origin `postMessage` vulnerabilities often arise from wildcard targets (`"*"`) or unverified event origins. Dodo Checkout enforces a multi-layer defense:

### 1. Explicit Target Origin (No Wildcards)
Neither the host SDK nor the checkout iframe ever broadcasts to `"*"`.
* The SDK calculates the expected origin from `CHECKOUT_URL` (e.g. `http://localhost:5174`) and passes this explicitly as `targetOrigin`.
* The checkout iframe extracts the parent's origin from `document.referrer` and locks it during the `checkout:init` handshake.

### 2. Strict Message Source & Window Verification
The SDK verifies `event.source === iframe.contentWindow`. Messages originating from third-party tabs, extensions, or popup windows are rejected.

### 3. Payload Schema Validation
All incoming messages are checked through `validateCheckoutMessage`:
* Must be a non-null object with a valid event `type`.
* `checkout:success` requires a non-empty string `sessionId`.
* `checkout:error` requires an approved `code` (`PAYMENT_DECLINED`, `PAYMENT_FAILED`, `CHECKOUT_ERROR`, `INVALID_MESSAGE`) and `message`.
* `checkout:close` requires a valid `reason` (`user`, `success`, `error`, `unknown`).

### 4. Zero-Leak Sensitive Data Firewall
The SDK runs `containsSensitiveData(payload)` before parsing. Any message containing keys such as `cardNumber`, `pan`, `cvc`, `cvv`, or `expiry` is **immediately rejected and discarded**.

### What the Host CAN and CANNOT Know

| Information | Host Access | Mechanism |
| :--- | :---: | :--- |
| **Session ID** (`cs_demo_...`) | Allowed | Emitted upon payment completion |
| **Checkout Status** (Ready, Processing, Closed) | Allowed | Lifecycle events |
| **Sanitized Error Code** (`PAYMENT_DECLINED`, etc.) | Allowed | Public failure codes for UX display |
| **Close Reason** (`user`, `success`) | Allowed | Helps merchant decide whether to prompt abandonment recovery |
| **16-Digit Card PAN** | **Forbidden** | Sandboxed in iframe; never crosses boundary |
| **Card Expiry Date** | **Forbidden** | Sandboxed in iframe; never crosses boundary |
| **Card CVC / CVV** | **Forbidden** | Sandboxed in iframe; never crosses boundary |
| **Cardholder Keystrokes & Form Inputs** | **Forbidden** | Isolated DOM prevents parent DOM access |

---

## 9. Payment Test Cards

The fake payment simulator runs purely client-side with a simulated 800–1500ms processing delay. Use any cardholder name, valid future expiry (e.g. `12 / 28`), and any 3-digit CVC (e.g. `123`).

| Card Number | Behavior | Expected Outcome | Callback Triggered |
| :--- | :--- | :--- | :--- |
| `4242 4242 4242 4242` | **Always Succeeds** | Payment processes, generates session ID, displays receipt screen. | `onSuccess({ sessionId })` |
| `4000 0000 0000 0002` | **Always Declined** | Simulates issuer card rejection. Shows retry banner. | `onError({ code: "PAYMENT_DECLINED" })` |
| `4000 0000 0000 0341` | **Fails Once, Then Succeeds** | Attempt 1: Network glitch / error.<br>Attempt 2 (Retry): Succeeds with session ID. | Attempt 1: `onError({ code: "PAYMENT_FAILED" })`<br>Attempt 2: `onSuccess({ sessionId })` |

*Note: The checkout UI includes **Quick-Fill Buttons** to instantly populate any of these test cards for swift testing.*

---

## 10. Edge Cases Handled

1. **User clicks "Buy" multiple times:** The SDK checks internal `isOpen` state and suppresses duplicate initialization attempts.
2. **User clicks "Pay" multiple times:** Pay button is instantly disabled, styled with a loading spinner, and the form locks during processing.
3. **Slow checkout loading:** The SDK displays a CSS loading spinner and message. If the iframe fails or times out (15s), an error callback is fired.
4. **Slow payment processing:** Explicit `processing` state with visual feedback prevents user frustration and accidental double-charging.
5. **Escape key pressed during payment processing:** Accidental dismissal is explicitly blocked while `isProcessing === true`. Once idle or errored, Escape closes the modal.
6. **Backdrop clicked during payment processing:** Clicks outside the modal during payment processing are ignored.
7. **Malformed postMessage:** Unknown formats, null values, or unexpected events from browser extensions are discarded.
8. **Untrusted postMessage origins:** Any message originating from an origin differing from `expectedOrigin` is rejected.
9. **Recoverable retry for temporary failures:** State persists for the `0341` card across retries within the same checkout session.
10. **Card data in URL parameters or storage:** Zero card credentials are stored in `localStorage`, `sessionStorage`, or passed in URL query strings.
11. **DOM cleanup verification:** Closing checkout removes all backdrop elements, wrapper containers, stylesheets, and global listeners.

---

## 11. Engineering & Product Decisions

### Decision 1: `<iframe>` vs Opening a New Window / Tab

* **Context:** Payment checkouts can either redirect the customer to a separate tab/window (e.g., PayPal Express / Stripe Checkout hosted page) or open an in-context modal using an `<iframe>` (e.g., Stripe Elements, Paddle, Dodo Checkout).
* **The Debate:** A new tab is trivial to implement and isolates browser security context completely without iframe cross-origin quirks. However, it severely degrades merchant conversion rates: users lose context of the purchase page, popup blockers frequently block new tabs on mobile browsers, and returning users after completion involves fragile redirect URLs or window opener communication.
* **Our Choice:** We chose an in-context `<iframe>` modal.
* **Reasoning:**
  1. **Conversion & User Trust:** Keeping the customer on the merchant's domain preserves visual continuity and trust.
  2. **Security Parity:** By running the checkout app on a completely different origin (`http://localhost:5174`) inside an `<iframe>` configured with `sandbox="allow-scripts allow-forms allow-same-origin"`, the merchant page cannot access the iframe DOM, inspect inputs, or read card data.
  3. **Mobile Resilience:** Modals do not trigger browser popup blockers on mobile devices.

### Decision 2: Whether Clicking the Backdrop Should Close Checkout During Payment Processing

* **Context:** Backdrop clicks (light dismiss) are standard UX for modal dialogs.
* **The Debate:** Should clicking the dimmed background always close the modal? What happens when a user clicks outside while their card is actively being authorized?
* **Our Choice:** Conditional backdrop closure:
  * When in `idle`, `declined`, `failed`, or `success` states: Clicking the backdrop closes the checkout (`reason: "user"`).
  * When in `processing` state: Clicking the backdrop is **strictly ignored**.
* **Reasoning:**
  1. **Preventing Ambiguous Payment States:** In real payment processing, severing a client-side session while an authorization request is inflight creates "phantom charges"—where the card is debited on the processor side but the customer and merchant believe the order was cancelled.
  2. **Preventing Accidental Double Charges:** If a user accidentally closes an inflight modal and immediately clicks "Buy" again, they risk being charged twice.
  3. **Visual Feedback:** When the user clicks outside during processing, the modal remains anchored and visually indicates that payment is actively underway.

---

## 12. What I Would Explore Next

In a full commercial production environment, the following enhancements would be prioritized:

1. **Server-Created Checkout Sessions:** Implement signed session tokens created by the merchant's backend API (`POST /v1/checkout/sessions`), preventing client-side price tampering.
2. **Idempotency Keys:** Include a client-generated UUID idempotency key with every payment authorization request to guarantee transactions cannot be double-processed even under network retries.
3. **Strict Content Security Policy (CSP):** Configure `frame-ancestors` HTTP response headers on the checkout server to whitelist only authenticated merchant domains.
4. **End-to-End Automated Testing:** Set up Playwright test suites covering cross-origin postMessage flows, keyboard focus navigation, and mobile viewports.
5. **Real Payment Gateway Integration:** Adapter layer supporting Stripe, Adyen, or Dodo Payments webhook reconciliation.
6. **SDK Versioning & CDN Distribution:** Publish versioned bundles to a high-speed CDN (e.g., `https://js.dodopayments.com/v1.js`) with SRI (Subresource Integrity) hashes.
7. **Accessibility Auditing (WCAG 2.1 AA):** Complete screen-reader testing (NVDA/VoiceOver) and automated Axe-core checks.

---

## 13. Known Limitations

* **Frontend-Only Scope:** There is no persistent database or backend server. Session IDs and authorization states exist purely in memory during the browser session.
* **Localhost Origin Resolution:** In local development, the demo store defaults to port 5173 and checkout to port 5174. In production, these would be configured via production domain environment variables (`CHECKOUT_URL`).
* **Focus Trap Complexity across Iframes:** Native browser keyboard focus trapping within an iframe modal requires coordinating `tab` key events across cross-origin iframe boundaries. The current implementation captures the `Escape` key and top-level navigation, but full cross-boundary tab trapping in pure vanilla iframes requires additional message coordinates.
