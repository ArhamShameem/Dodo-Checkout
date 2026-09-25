You are a senior frontend engineer. Build the complete frontend assignment described below from scratch.

# PROJECT

Build a tiny embeddable checkout system called "Dodo Checkout".

This is a FRONTEND-ONLY assignment. There must be NO backend, database, real payment gateway, Express server, Prisma, or API server.

The project must contain three frontend pieces:

1. A framework-independent TypeScript checkout SDK.
2. A standalone React checkout application.
3. A React demo/merchant website that uses the SDK.

The goal is to demonstrate excellent frontend engineering, API design, UX, edge-case handling, security thinking, accessibility, and product polish.

Do not over-engineer the project. Keep the implementation small, clean, understandable, and production-minded.

# TECH STACK

Use:

* React
* TypeScript
* Vite
* Tailwind CSS
* npm workspaces
* Vitest for a few important unit tests

Do not introduce unnecessary dependencies.

Recommended structure:

dodo-checkout/
├── apps/
│   ├── demo/
│   └── checkout/
├── packages/
│   └── checkout-sdk/
├── package.json
├── README.md
└── .gitignore

Use npm workspaces.

# 1. CHECKOUT SDK

Create a small framework-independent TypeScript SDK.

The public API should look approximately like:

DodoCheckout.open({
productId: "prod_123",

onSuccess: ({ sessionId }) => {},

onClose: ({ reason }) => {},

onError: ({ code, message }) => {},
});

Also expose:

DodoCheckout.close();

The SDK must:

* Be framework independent.
* Not depend on React.
* Create the checkout modal dynamically.
* Render the checkout application inside an iframe.
* Prevent multiple checkout instances from opening simultaneously.
* Handle iframe loading.
* Communicate with the checkout using window.postMessage.
* Listen only for messages originating from its checkout iframe.
* Validate message structure.
* Clean up iframe, overlay, and event listeners correctly.
* Call the appropriate callbacks.
* Never expose card information to the merchant/demo page.
* Never send card number, expiry, or CVC through postMessage.
* Only send the minimum information required to the host.

Use strongly typed message contracts.

Suggested events:

checkout:ready
checkout:init
checkout:success
checkout:error
checkout:close

Suggested success payload:

{
sessionId: string;
}

Suggested close payload:

{
reason: "user" | "success" | "error" | "unknown";
}

Suggested error payload:

{
code:
| "PAYMENT_DECLINED"
| "PAYMENT_FAILED"
| "CHECKOUT_ERROR"
| "INVALID_MESSAGE";

message: string;
}

Do not blindly use "*" as the final postMessage target origin.

Use environment configuration for the checkout URL and derive/validate the expected origin appropriately.

Document the communication/security model in README.md.

# 2. CHECKOUT APPLICATION

Create a standalone React + TypeScript checkout application.

It should be visually polished and feel like a trustworthy payment experience.

The checkout must contain:

* Product name
* Product description
* Price
* Email field
* Card number
* Expiry
* CVC
* Pay button
* Close button

The UI should be responsive.

Design direction:

* Minimal
* Premium
* Clean
* Trustworthy
* Excellent spacing
* Strong typography hierarchy
* Subtle animations
* Clear focus states
* Accessible form controls
* Mobile friendly
* No excessive gradients or visual noise

Do not make it look like a generic template.

# PRODUCT

Use one fake product:

ID:
prod_123

Name:
Pro Developer Plan

Description:
Everything you need to build and ship faster.

Price:
$49.00 USD

# FAKE PAYMENT SYSTEM

There is NO backend.

Implement a frontend payment simulator.

The assignment requires exactly these cards:

1. 4242 4242 4242 4242

Result:
SUCCESS

2. 4000 0000 0000 0002

Result:
DECLINED

3. 4000 0000 0000 0341

First attempt:
FAIL

Second attempt:
SUCCESS

Simulate a realistic processing delay, approximately 800–1500ms.

The processing state must disable the Pay button so users cannot accidentally submit multiple payments.

The third card must persist its "failed once" state for the current checkout/payment flow.

# PAYMENT STATES

Implement explicit UI states:

* idle
* processing
* success
* declined
* failed

Success state:

Show a polished success screen.

Example:

Payment successful

Your Pro Developer Plan is ready.

Session ID:
cs_demo_xxxxx

Do not immediately close before the host has received the success event.

Declined state:

Show a clear error message and allow retry.

Example:

Payment declined

Your card was declined. Please check your details or try another card.

Failed state:

Show a recoverable error.

Example:

Something went wrong while processing your payment.

Try again.

The failed card must succeed when retried.

# CALLBACK BEHAVIOUR

The merchant must receive:

onSuccess({
sessionId
})

when payment succeeds.

The merchant must receive:

onError({
code: "PAYMENT_DECLINED",
message: "..."
})

for declined payments.

The merchant must receive:

onError({
code: "PAYMENT_FAILED",
message: "..."
})

for temporary failures.

The merchant must receive:

onClose({
reason: "user"
})

when the customer closes the checkout.

Do not send sensitive card information to the host.

# CLOSE BEHAVIOUR

Support:

* Close button
* Escape key
* SDK programmatic close

Avoid accidental closure while payment is processing.

Do not allow backdrop clicks to close the checkout while a payment is in progress.

When cleanup happens:

* Remove iframe.
* Remove overlay.
* Remove event listeners.
* Reset SDK state.
* Do not leave dangling DOM nodes.

# 3. DEMO / MERCHANT WEBSITE

Build a polished demo store that pretends to be a real website integrating Dodo Checkout.

The page should contain:

* Header
* Product section
* Product name
* Product description
* Price
* Buy button
* Checkout event log

Example:

DODO STORE

Pro Developer Plan

Build better products faster.

$49.00

[ Buy Pro — $49 ]

Below it:

Checkout Events

[16:42:01] checkout opened
[16:42:05] payment processing
[16:42:06] payment success
[16:42:06] session: cs_demo_123

The event log should visibly demonstrate that callbacks from the SDK are actually firing.

Use the SDK package from the workspace instead of duplicating its logic.

The demo should call:

DodoCheckout.open({
productId: "prod_123",
onSuccess,
onClose,
onError
});

Do not directly access the checkout iframe from the demo application.

# ARCHITECTURE

Implement this architecture:

Demo Website
|
| DodoCheckout.open()
v
Checkout SDK
|
| creates iframe
v
Checkout Application
|
| postMessage
v
Checkout SDK
|
| callbacks
v
Demo Website

The checkout must be isolated in an iframe.

The host/demo application should not be able to access card fields.

The SDK should be the only communication boundary.

# SECURITY

Treat this as a real checkout architecture even though payment is fake.

Implement:

* iframe isolation
* strict message validation
* message source validation
* expected origin validation
* no sensitive card data crossing the iframe boundary
* no card data in URL parameters
* no card data in localStorage
* no card data in console.log
* no unnecessary data exposed to host
* cleanup of event listeners

Add comments where security-sensitive decisions are made.

In README.md explain:

"What the host can know"

and

"What the host cannot know"

# ACCESSIBILITY

Implement reasonable accessibility:

* Semantic HTML
* Proper labels
* Keyboard navigation
* Visible focus states
* Escape closes checkout
* Buttons have accessible names
* Error messages are understandable
* Do not rely solely on color for error/success states
* Inputs should have autocomplete attributes where appropriate

Implement a basic focus trap inside the checkout modal if practical.

# RESPONSIVE DESIGN

The checkout must work well on:

* Desktop
* Tablet
* Mobile

The iframe should have sensible dimensions and not overflow the viewport.

The modal should remain usable on smaller screens.

# ANIMATIONS

Add subtle animations for:

* Modal opening
* Loading/processing
* Success
* Error transitions

Do not overdo animations.

Respect prefers-reduced-motion where practical.

# ERROR / EDGE CASES

Handle:

1. User clicks Buy twice.
2. User clicks Pay multiple times.
3. Checkout takes time to load.
4. Payment takes time.
5. Payment fails.
6. Payment is declined.
7. Payment succeeds.
8. User closes checkout.
9. User presses Escape.
10. SDK receives malformed postMessage data.
11. SDK receives an unexpected message source.
12. Checkout iframe fails to load.
13. User retries after a failed payment.
14. User retries after a declined payment.
15. SDK is opened while another checkout is already open.

The host page should always receive a truthful callback/state.

# SDK API DESIGN

Keep the SDK API very small and predictable.

Avoid exposing internal implementation details.

Do not expose:

* iframe element
* payment fields
* internal React state
* card information
* internal DOM nodes

Only expose:

DodoCheckout.open(...)
DodoCheckout.close()

# TYPES

Create shared TypeScript types for:

* SDK options
* callback payloads
* message events
* payment results
* product

Avoid `any`.

Use strict TypeScript.

Enable strict mode.

# TESTING

Use Vitest.

Write useful tests rather than many meaningless tests.

At minimum test:

1. Successful payment card.
2. Declined payment card.
3. Fail-once card.
4. SDK message validation.
5. Duplicate checkout prevention.
6. Correct callback payloads.

# CODE QUALITY

Follow these principles:

* Small components
* Small functions
* Clear naming
* No giant components if avoidable
* No duplicated logic
* No unnecessary abstractions
* Strict TypeScript
* No `any`
* No unused code
* No console debugging left in final code
* Accessible UI
* Clean formatting

Run:

npm run build

and make sure all workspaces build successfully.

Run tests before finishing.

# ENVIRONMENT

Use environment variables for the checkout URL.

For local development, use something like:

Demo:
http://localhost:5173

Checkout:
http://localhost:5174

The SDK should read the checkout URL from:

CHECKOUT_URL

Do not hardcode production URLs.

# DEVELOPMENT

Make it possible to run:

npm run dev:demo

and:

npm run dev:checkout

from the root.

Also provide:

npm run build

and:

npm test

if practical.

# README

Create a professional README.md.

Include:

1. Project overview.
2. Architecture.
3. How to install.
4. How to run.
5. How to build.
6. How the SDK works.
7. How iframe communication works.
8. How postMessage is secured.
9. Payment test cards.
10. Edge cases handled.
11. Two engineering/product decisions that were debated.
12. What I would explore next.
13. Known limitations.

For the two decisions, discuss:

Decision 1:
iframe vs opening a new window/tab.

Decision 2:
whether clicking the backdrop should close the checkout, especially during payment processing.

Explain the reasoning rather than simply stating the choice.

For "What I'd explore next", mention realistic future work such as:

* Real payment provider integration
* Server-created checkout sessions
* Idempotency
* Stronger CSP/security headers
* Automated E2E tests
* SDK versioning
* Analytics
* Accessibility testing
* Cross-browser testing

# IMPORTANT PRODUCT DIRECTION

The assignment specifically values judgment and taste.

Do NOT create a huge dashboard or unnecessary features.

Focus on making one flow excellent:

Demo store
→ Buy
→ Checkout opens
→ Customer enters information
→ Payment processes
→ Success/error
→ Callback appears in demo event log

The final result should feel like something an engineer intentionally designed and shipped, not a generic coding exercise.

# FINAL ACCEPTANCE CHECKLIST

Before considering the task complete, verify all of the following:

[ ] Demo app works.
[ ] Checkout app works.
[ ] SDK works.
[ ] Demo opens checkout using DodoCheckout.open().
[ ] Checkout is inside an iframe.
[ ] No backend exists.
[ ] No database exists.
[ ] No real payment API exists.
[ ] 4242 card succeeds.
[ ] 0002 card declines.
[ ] 0341 card fails once and succeeds on retry.
[ ] onSuccess fires.
[ ] onError fires.
[ ] onClose fires.
[ ] Duplicate Buy clicks are handled.
[ ] Duplicate Pay clicks are prevented.
[ ] Escape works.
[ ] Checkout cleanup works.
[ ] postMessage messages are validated.
[ ] Card data never crosses iframe boundary.
[ ] Responsive UI works.
[ ] Keyboard navigation works.
[ ] Loading/processing/error/success states are polished.
[ ] README is complete.
[ ] Tests pass.
[ ] Production build passes.

# EXECUTION INSTRUCTIONS

Do not just describe what you would build.

Actually create and implement the entire project.

Start by inspecting the current directory.

If it is empty, initialize the project.

If files already exist, preserve useful work and integrate with it rather than blindly overwriting everything.

After implementation:

1. Run type checking/build.
2. Run tests.
3. Fix all errors.
4. Inspect the final project structure.
5. Give me a concise summary of what was implemented.
6. Give me the exact commands to run the demo and checkout locally.
7. List any remaining limitations.

Do not stop after scaffolding. Finish the complete working implementation.
npm 