import { DOM_IDS } from "./constants.js";

const STYLES = `
  #${DOM_IDS.CONTAINER} {
    position: fixed;
    inset: 0;
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    box-sizing: border-box;
    opacity: 0;
    transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  #${DOM_IDS.CONTAINER}.dodo-visible {
    opacity: 1;
  }

  #${DOM_IDS.BACKDROP} {
    position: absolute;
    inset: 0;
    background-color: rgba(15, 23, 42, 0.65);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  #${DOM_IDS.FRAME_WRAPPER} {
    position: relative;
    width: 100%;
    max-width: 480px;
    height: min(720px, 92vh);
    margin: 16px;
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1);
    overflow: hidden;
    transform: scale(0.96) translateY(8px);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
  }

  #${DOM_IDS.CONTAINER}.dodo-visible #${DOM_IDS.FRAME_WRAPPER} {
    transform: scale(1) translateY(0);
  }

  #${DOM_IDS.LOADER} {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    z-index: 2;
    transition: opacity 0.2s ease, visibility 0.2s ease;
    gap: 16px;
    color: #475569;
  }

  #${DOM_IDS.LOADER}.dodo-hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }

  .dodo-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid #e2e8f0;
    border-top-color: #0f172a;
    border-radius: 50%;
    animation: dodo-spin 0.8s linear infinite;
  }

  .dodo-loader-text {
    font-size: 14px;
    font-weight: 500;
    color: #64748b;
  }

  #${DOM_IDS.IFRAME} {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
    background: transparent;
  }

  @keyframes dodo-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 640px) {
    #${DOM_IDS.FRAME_WRAPPER} {
      margin: 0;
      max-width: 100%;
      height: 100%;
      border-radius: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    #${DOM_IDS.CONTAINER},
    #${DOM_IDS.FRAME_WRAPPER},
    #${DOM_IDS.LOADER} {
      transition: none !important;
      transform: none !important;
    }
    .dodo-spinner {
      animation-duration: 2s;
    }
  }
`;

export interface ModalElements {
  container: HTMLDivElement;
  backdrop: HTMLDivElement;
  wrapper: HTMLDivElement;
  iframe: HTMLIFrameElement;
  loader: HTMLDivElement;
}

export function injectStyles(): void {
  if (typeof document === "undefined") return;
  if (!document.getElementById(DOM_IDS.STYLE_TAG)) {
    const styleEl = document.createElement("style");
    styleEl.id = DOM_IDS.STYLE_TAG;
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);
  }
}

export function removeStyles(): void {
  if (typeof document === "undefined") return;
  const styleEl = document.getElementById(DOM_IDS.STYLE_TAG);
  if (styleEl) {
    styleEl.parentNode?.removeChild(styleEl);
  }
}

export function createModalElements(checkoutUrl: string): ModalElements {
  injectStyles();

  // Root container with accessible modal dialog attributes
  const container = document.createElement("div");
  container.id = DOM_IDS.CONTAINER;
  container.setAttribute("role", "dialog");
  container.setAttribute("aria-modal", "true");
  container.setAttribute("aria-label", "Dodo Checkout Payment Modal");

  // Backdrop
  const backdrop = document.createElement("div");
  backdrop.id = DOM_IDS.BACKDROP;
  container.appendChild(backdrop);

  // Wrapper
  const wrapper = document.createElement("div");
  wrapper.id = DOM_IDS.FRAME_WRAPPER;

  // Loading skeleton / spinner
  const loader = document.createElement("div");
  loader.id = DOM_IDS.LOADER;
  loader.innerHTML = `
    <div class="dodo-spinner" role="status" aria-label="Loading checkout"></div>
    <div class="dodo-loader-text">Loading secure checkout...</div>
  `;
  wrapper.appendChild(loader);

  // Iframe
  const iframe = document.createElement("iframe");
  iframe.id = DOM_IDS.IFRAME;
  iframe.title = "Dodo Checkout Payment Window";
  iframe.setAttribute("allow", "payment");
  // Set sandboxing if appropriate, allowing scripts, forms, and same-origin inside iframe
  iframe.setAttribute("sandbox", "allow-scripts allow-forms allow-same-origin");
  iframe.src = checkoutUrl;
  wrapper.appendChild(iframe);

  container.appendChild(wrapper);
  document.body.appendChild(container);

  // Trigger smooth fade in on next animation frame
  requestAnimationFrame(() => {
    container.classList.add("dodo-visible");
  });

  return {
    container,
    backdrop,
    wrapper,
    iframe,
    loader,
  };
}

export function hideLoader(loaderEl: HTMLElement): void {
  loaderEl.classList.add("dodo-hidden");
}

export function removeModalElements(elements: ModalElements): void {
  elements.container.classList.remove("dodo-visible");
  
  // Wait for fade out transition or clean up immediately
  const cleanup = () => {
    if (elements.container.parentNode) {
      elements.container.parentNode.removeChild(elements.container);
    }
  };

  // Give 200ms for exit animation
  setTimeout(cleanup, 200);
}
