/**
 * Cross-browser compat layer for the DevTools AI Debugger panel.
 *
 * Verified against MDN (2026):
 * - Firefox DOES implement `devtools.inspectedWindow` (tabId, eval, reload)
 *   and `devtools.network` (getHAR, onRequestFinished, onNavigated).
 * - Firefox caveats handled here:
 *   (a) `inspectedWindow.eval` supports no `options` parameter;
 *   (b) `onRequestFinished` only fires after the user has opened the
 *       browser's Network panel at least once (so HAR may be empty);
 *   (c) Chrome-style callback signatures vs Firefox Promise returns.
 * - `getEventListeners()` is a DevTools *console* command-line helper. It is
 *   NOT defined in inspected-page context on any browser, so it must never be
 *   called from `inspectedWindow.eval` page scripts (see F-04). Event-listener
 *   counts are obtained via Chrome CDP (`DOMDebugger.getEventListeners`)
 *   through the background page instead.
 */

export function isChromeExtension(): boolean {
  try {
    return browser.runtime.getURL('').startsWith('chrome-extension://');
  } catch {
    return false;
  }
}

export function isFirefoxExtension(): boolean {
  try {
    return browser.runtime.getURL('').startsWith('moz-extension://');
  } catch {
    return false;
  }
}

/** Tab ID of the inspected window, when the devtools API exposes it. */
export function getInspectedTabId(): number | undefined {
  try {
    const tabId = (browser as any).devtools?.inspectedWindow?.tabId;
    return Number.isInteger(tabId) ? tabId : undefined;
  } catch {
    return undefined;
  }
}

export interface DevtoolsEvalResult<T = any> {
  result: T | null;
  exception: any | null;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

/**
 * Evaluate `expression` in the inspected window.
 * Handles Chrome callback-style and Firefox Promise-style signatures, plus a
 * timeout so a hung inspected page can never stall a capture indefinitely.
 */
export function devtoolsEval<T = any>(expression: string, timeoutMs = 15000): Promise<DevtoolsEvalResult<T>> {
  const inspectedWindow = (browser as any).devtools?.inspectedWindow;
  if (!inspectedWindow?.eval) {
    return Promise.resolve({ result: null, exception: { unsupported: true, message: 'devtools.inspectedWindow.eval is unavailable in this browser.' } });
  }
  const task = new Promise<DevtoolsEvalResult<T>>((resolve) => {
    let settled = false;
    const done = (result: T | null, exception: any | null) => {
      if (settled) return;
      settled = true;
      resolve({ result: result ?? null, exception: exception ?? null });
    };
    try {
      // NOTE: Firefox does not support the `options` argument — never pass one.
      const maybePromise = inspectedWindow.eval(expression, (result: any, exceptionInfo: any) => {
        if (exceptionInfo && (exceptionInfo.isException || exceptionInfo.code || exceptionInfo.value)) {
          done(null, exceptionInfo);
        } else {
          done(result ?? null, null);
        }
      });
      if (maybePromise && typeof maybePromise.then === 'function') {
        maybePromise.then(
          (result: any) => done(result ?? null, null),
          (err: any) => done(null, err ?? { isException: true })
        );
      }
    } catch (err: any) {
      done(null, err ?? { isException: true });
    }
  });
  return withTimeout(task, timeoutMs, 'inspectedWindow.eval').catch((err) => ({ result: null, exception: err }));
}

/**
 * Fetch the HAR log for the inspected window.
 * Handles callback-style (Chrome) and Promise-style (Firefox) signatures.
 * Returns `null` when unavailable (caller should fall back to the background
 * webRequest snapshot via `GET_DEVTOOLS_NETWORK_FALLBACK`).
 */
export function getDevtoolsHAR(timeoutMs = 15000): Promise<any | null> {
  const network = (browser as any).devtools?.network;
  if (!network?.getHAR) return Promise.resolve(null);
  const task = new Promise<any | null>((resolve) => {
    let settled = false;
    const done = (har: any) => {
      if (settled) return;
      settled = true;
      resolve(har ?? null);
    };
    try {
      const maybePromise = network.getHAR((har: any) => done(har));
      if (maybePromise && typeof maybePromise.then === 'function') {
        maybePromise.then((har: any) => done(har), () => done(null));
      }
    } catch {
      done(null);
    }
  });
  return withTimeout(task, timeoutMs, 'devtools.network.getHAR').catch(() => null);
}

/**
 * Reload the inspected window, optionally injecting an early script.
 * Falls back to a background `RELOAD_DEVTOOLS_TAB` message because the
 * `tabs` API is not exposed to DevTools extension pages directly.
 */
export async function reloadInspectedWindow(injectedScript?: string): Promise<void> {
  const inspectedWindow = (browser as any).devtools?.inspectedWindow;
  if (inspectedWindow?.reload) {
    try {
      const maybePromise = injectedScript ? inspectedWindow.reload({ injectedScript }) : inspectedWindow.reload();
      if (maybePromise && typeof maybePromise.then === 'function') await maybePromise;
      return;
    } catch {
      // Fall through to the background fallback below.
    }
  }
  const tabId = getInspectedTabId();
  await browser.runtime.sendMessage({ type: 'RELOAD_DEVTOOLS_TAB', tabId } as any);
}

/**
 * `getEventListeners()` is a DevTools console helper, unavailable in
 * inspected-page context on every browser. Always false — call sites must use
 * the background CDP path (`GET_DEVTOOLS_ELEMENT_CDP` with `eventListeners`).
 */
export function supportsPageGetEventListeners(): false {
  return false;
}
