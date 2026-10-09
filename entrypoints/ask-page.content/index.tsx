import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import AskPagePanel from './AskPagePanel';
import { extractPageContent } from '../../utils/extractor';
import { getStyles, getRoughFilterSVG, ensurePanelFonts } from '../../utils/chatStyles';
import { getStoredTheme, onThemeChange } from '../../utils/theme';

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'manual',

  async main(ctx) {
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
        const algorithm = message.algorithm || 4;
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

      // Register Caveat/Nunito at document level (FontFace API bypasses
      // host-page font-src CSP that blocks @font-face in shadow <style>).
      // Fire-and-forget: text swaps in automatically once loaded.
      void ensurePanelFonts();

      try {
        if (!document.getElementById('browserbot-rough-filter-global')) {
          const globalFilter = document.createElement('div');
          globalFilter.id = 'browserbot-rough-filter-global';
          globalFilter.style.position = 'absolute';
          globalFilter.style.width = '0';
          globalFilter.style.height = '0';
          globalFilter.style.overflow = 'hidden';
          globalFilter.style.pointerEvents = 'none';
          globalFilter.setAttribute('aria-hidden', 'true');
          globalFilter.innerHTML = getRoughFilterSVG();
          (document.body || document.documentElement).appendChild(globalFilter);
        }
      } catch { /* non-fatal */ }

      const initialTheme = await getStoredTheme();
      let unlistenTheme: (() => void) | null = null;

      const ui = await createShadowRootUi(ctx, {
        name: 'browserbot-ask-page',
        position: 'overlay',
        zIndex: 2147483646,
        css: '',
        onMount(container) {
          // Inject styles and rough filter into shadow root
          const style = document.createElement('style');
          style.textContent = getStyles();
          const shadowRoot = container.getRootNode() as ShadowRoot;
          shadowRoot.appendChild(style);

          const filterContainer = document.createElement('div');
          filterContainer.innerHTML = getRoughFilterSVG();
          shadowRoot.appendChild(filterContainer);

          // Apply theme to host container
          ui.uiContainer.setAttribute('data-theme', initialTheme);
          container.setAttribute('data-theme', initialTheme);

          // Create React root
          const wrapper = document.createElement('div');
          wrapper.id = 'browserbot-ask-page-root';
          wrapper.setAttribute('data-theme', initialTheme);
          container.appendChild(wrapper);

          unlistenTheme = onThemeChange((nextTheme) => {
            ui.uiContainer.setAttribute('data-theme', nextTheme);
            container.setAttribute('data-theme', nextTheme);
            wrapper.setAttribute('data-theme', nextTheme);
          });

          panelRoot = createRoot(wrapper);
          panelRoot.render(
            createElement(AskPagePanel, {
              pageTitle,
              pageUrl,
              onClose: () => {
                if (unlistenTheme) {
                  unlistenTheme();
                  unlistenTheme = null;
                }
                ui.remove();
                uiMounted = false;
                panelRoot = null;
                showCallback = null;
                window.dispatchEvent(new CustomEvent('browserbot-ask-page-state', { detail: { open: false } }));
              },
              onRegisterShow: (cb: () => void) => {
                showCallback = cb;
              }
            })
          );
        },
        onRemove() {
          if (unlistenTheme) {
            unlistenTheme();
            unlistenTheme = null;
          }
          panelRoot?.unmount();
          panelRoot = null;
          window.dispatchEvent(new CustomEvent('browserbot-ask-page-state', { detail: { open: false } }));
        }
      });

      ui.mount();
      window.dispatchEvent(new CustomEvent('browserbot-ask-page-state', { detail: { open: true } }));
    }
  }
});
