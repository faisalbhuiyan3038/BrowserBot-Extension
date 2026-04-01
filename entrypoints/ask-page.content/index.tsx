import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import AskPagePanel from './AskPagePanel';
import { extractPageContent } from '../../utils/extractor';
import { getStyles } from '../../utils/chatStyles';

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',

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

