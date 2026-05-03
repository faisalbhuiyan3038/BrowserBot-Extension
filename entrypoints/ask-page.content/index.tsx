import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import AskPagePanel from './AskPagePanel';
import { extractPageContent } from '../../utils/extractor';
import { getStyles } from '../../utils/chatStyles';

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    // ── Passive DevTools data capture ──────────────────────────────────────
    // Monkey-patch console.* to capture logs with stack traces
    (() => {
      const w = window as any;
      if (w.__browserbotPatched) return;
      w.__browserbotPatched = true;
      w.__browserbotLogs = [];
      w.__browserbotNetwork = [];

      const LEVELS = ['log', 'info', 'warn', 'error', 'debug'] as const;
      for (const level of LEVELS) {
        const orig = (console as any)[level].bind(console);
        (console as any)[level] = (...args: any[]) => {
          const stack = new Error().stack?.split('\n').slice(2).join('\n') || '';
          const text = args.map(a => {
            try { return typeof a === 'object' ? JSON.stringify(a) : String(a); }
            catch { return String(a); }
          }).join(' ');
          w.__browserbotLogs.push({ level, ts: Date.now(), text, stack });
          if (w.__browserbotLogs.length > 500) w.__browserbotLogs.shift();
          orig(...args);
        };
      }

      // Monkey-patch fetch
      const origFetch = window.fetch.bind(window);
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
        const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
        const reqHeaders: Record<string, string> = {};
        if (init?.headers) {
          new Headers(init.headers as any).forEach((v: string, k: string) => { reqHeaders[k] = v; });
        }
        const reqBody = typeof init?.body === 'string' ? init.body.slice(0, 1000) : (init?.body ? '[binary]' : null);
        const start = Date.now();
        const entry: any = { type: 'fetch', url, method, requestHeaders: reqHeaders, requestBody: reqBody, startTime: start };
        try {
          const res = await origFetch(input, init);
          const resHeaders: Record<string, string> = {};
          res.headers.forEach((v: string, k: string) => { resHeaders[k] = v; });
          entry.status = res.status;
          entry.responseHeaders = resHeaders;
          entry.duration = Date.now() - start;
          const clone = res.clone();
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('text') || ct.includes('json')) {
            clone.text().then(t => { entry.responseBody = t.slice(0, 2000); }).catch(() => {});
          }
          w.__browserbotNetwork.push(entry);
          if (w.__browserbotNetwork.length > 200) w.__browserbotNetwork.shift();
          return res;
        } catch (err: any) {
          entry.status = 0; entry.error = err.message; entry.duration = Date.now() - start;
          w.__browserbotNetwork.push(entry);
          if (w.__browserbotNetwork.length > 200) w.__browserbotNetwork.shift();
          throw err;
        }
      };

      // Monkey-patch XHR
      const OrigXHR = window.XMLHttpRequest;
      function PatchedXHR(this: any) {
        const xhr = new OrigXHR();
        let _method = 'GET', _url = '', _reqHeaders: Record<string, string> = {}, _start = 0, _body: any = null;
        const entry: any = { type: 'xhr' };

        xhr.addEventListener('loadend', () => {
          const resHeaders: Record<string, string> = {};
          xhr.getAllResponseHeaders().split('\r\n').forEach((line: string) => {
            const idx = line.indexOf(': ');
            if (idx > 0) resHeaders[line.slice(0, idx)] = line.slice(idx + 2);
          });
          entry.url = _url; entry.method = _method; entry.requestHeaders = _reqHeaders;
          entry.requestBody = typeof _body === 'string' ? _body.slice(0, 1000) : (_body ? '[binary]' : null);
          entry.status = xhr.status; entry.responseHeaders = resHeaders;
          entry.duration = Date.now() - _start; entry.startTime = _start;
          const ct = xhr.getResponseHeader('content-type') || '';
          if (ct.includes('text') || ct.includes('json')) entry.responseBody = xhr.responseText?.slice(0, 2000);
          w.__browserbotNetwork.push(entry);
          if (w.__browserbotNetwork.length > 200) w.__browserbotNetwork.shift();
        });

        return new Proxy(xhr, {
          get(t, prop) {
            if (prop === 'open') return (m: string, u: string, ...rest: any[]) => { _method = m; _url = u; _start = Date.now(); return t.open(m, u, ...rest); };
            if (prop === 'setRequestHeader') return (k: string, v: string) => { _reqHeaders[k] = v; return t.setRequestHeader(k, v); };
            if (prop === 'send') return (body?: any) => { _body = body; return t.send(body); };
            const val = (t as any)[prop];
            return typeof val === 'function' ? val.bind(t) : val;
          },
          set(t, prop, val) { (t as any)[prop] = val; return true; }
        });
      }
      PatchedXHR.prototype = OrigXHR.prototype;
      (window as any).XMLHttpRequest = PatchedXHR;
    })();
    // ── End DevTools capture setup ──────────────────────────────────────────
    let uiMounted = false;
    let panelRoot: ReturnType<typeof createRoot> | null = null;
    let showCallback: (() => void) | null = null;

    // Listen for toggle messages from background
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'TOGGLE_ASK_PAGE') {
        if (!uiMounted) {
          mountUI(message.pageTitle || document.title, message.pageUrl || location.href);
        } else if (showCallback) {
          showCallback();
        }
      }

      // Handle content extraction requests from background
      if (message.type === 'EXTRACT_PAGE_CONTENT') {
        const algorithm = message.algorithm || 1;
        extractPageContent(algorithm).then(result => {
          sendResponse({
            content: result.content,
            originalLength: result.originalLength,
            truncatedLength: result.truncatedLength,
            algorithm: result.algorithm
          });
        }).catch(err => {
          sendResponse({
            content: '',
            error: err.message
          });
        });
        return true; // Keep message channel open for async response
      }
    });

    async function mountUI(pageTitle: string, pageUrl: string) {
      if (uiMounted) return;
      uiMounted = true;

      const ui = await createShadowRootUi(ctx, {
        name: 'browserbot-ask-page',
        position: 'overlay',
        zIndex: 2147483646,
        onMount(container) {
          // Inject styles into shadow root
          const style = document.createElement('style');
          style.textContent = getStyles();
          const shadowRoot = container.getRootNode() as ShadowRoot;
          shadowRoot.appendChild(style);

          // Create React root
          const wrapper = document.createElement('div');
          wrapper.id = 'browserbot-ask-page-root';
          container.appendChild(wrapper);
          panelRoot = createRoot(wrapper);
          panelRoot.render(
            createElement(AskPagePanel, {
              pageTitle,
              pageUrl,
              onClose: () => {
                ui.remove();
                uiMounted = false;
                panelRoot = null;
                showCallback = null;
              },
              onRegisterShow: (cb: () => void) => {
                showCallback = cb;
              }
            })
          );
        },
        onRemove() {
          panelRoot?.unmount();
          panelRoot = null;
        }
      });

      ui.mount();
    }
  }
});

