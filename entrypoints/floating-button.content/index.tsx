import { getStyles, getRoughFilterSVG } from '../../utils/chatStyles';

interface FloatingBtnPos {
  left: number;
  top: number;
}

let memoryPos: FloatingBtnPos | null = null;

async function getSavedPosition(): Promise<FloatingBtnPos | null> {
  try {
    const res = await browser.storage.local.get('browserbot_float_btn_pos') as { browserbot_float_btn_pos?: FloatingBtnPos };
    if (res.browserbot_float_btn_pos && typeof res.browserbot_float_btn_pos.left === 'number') {
      return res.browserbot_float_btn_pos;
    }
  } catch (_) {}
  return memoryPos;
}

async function savePosition(pos: FloatingBtnPos): Promise<void> {
  memoryPos = pos;
  try {
    await browser.storage.local.set({ browserbot_float_btn_pos: pos });
  } catch (_) {}
}

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'manual',
  runAt: 'document_idle',

  async main(ctx) {
    let uiMounted = false;
    let floatingButton: HTMLElement | null = null;
    let enabled = true;
    let isPanelOpen = false;
    let btnCleanup: (() => void) | null = null;

    function updatePanelOpenState(open: boolean) {
      isPanelOpen = open;
      if (!floatingButton) return;
      if (open) {
        floatingButton.classList.add('panel-open');
      } else {
        floatingButton.classList.remove('panel-open');
        floatingButton.classList.remove('hidden');
      }
    }

    // Listen for custom event from Ask Page panel
    const onAskPageState = (e: any) => {
      updatePanelOpenState(Boolean(e.detail?.open));
    };
    window.addEventListener('browserbot-ask-page-state', onAskPageState);

    // Observer to detect Ask Page shadow root addition or removal
    const observer = new MutationObserver(() => {
      const exists = Boolean(document.querySelector('browserbot-ask-page'));
      if (exists !== isPanelOpen) {
        updatePanelOpenState(exists);
      }
    });

    if (document.body) {
      observer.observe(document.body, { childList: true });
    } else {
      const onDomReady = () => {
        if (document.body) observer.observe(document.body, { childList: true });
        document.removeEventListener('DOMContentLoaded', onDomReady);
      };
      document.addEventListener('DOMContentLoaded', onDomReady);
    }

    // Check if floating button is enabled
    const checkEnabled = async () => {
      try {
        const state = await browser.storage.local.get('appState') as { appState?: { askPageFloatingButton?: boolean } };
        if (!state.appState) return true;
        return state.appState.askPageFloatingButton !== false;
      } catch (_) {
        return true;
      }
    };

    enabled = await checkEnabled();

    // Listen for storage changes
    const onStorageChanged = (changes: any, area: string) => {
      if (area === 'local' && changes.appState?.newValue) {
        const newState = changes.appState.newValue as { askPageFloatingButton?: boolean };
        const wasEnabled = enabled;
        enabled = newState.askPageFloatingButton !== false;

        if (enabled && !wasEnabled) {
          mountUI();
        } else if (!enabled && wasEnabled) {
          removeUI();
        }
      }
    };
    browser.storage.onChanged.addListener(onStorageChanged);

    // Clean up on extension reload / context invalidation
    ctx.onInvalidated(() => {
      observer.disconnect();
      window.removeEventListener('browserbot-ask-page-state', onAskPageState);
      browser.storage.onChanged.removeListener(onStorageChanged);
      removeUI();
    });

    if (!enabled) return;

    async function mountUI() {
      if (uiMounted) return;
      uiMounted = true;

      const ui = await createShadowRootUi(ctx, {
        name: 'browserbot-floating-button',
        position: 'overlay',
        zIndex: 2147483645,
        css: '',
        onMount(container) {
          const style = document.createElement('style');
          style.textContent = getStyles();
          const shadowRoot = container.getRootNode() as ShadowRoot;
          shadowRoot.appendChild(style);

          const filterContainer = document.createElement('div');
          filterContainer.innerHTML = getRoughFilterSVG();
          shadowRoot.appendChild(filterContainer);

          const wrapper = document.createElement('div');
          wrapper.id = 'browserbot-floating-btn';
          const iconUrl = browser.runtime.getURL('/icon-alt.png' as any);
          wrapper.innerHTML = `<img src="${iconUrl}" alt="BrowserBot" style="width: 24px; height: 24px; object-fit: contain; display: block; pointer-events: none;" />`;
          if (isPanelOpen || Boolean(document.querySelector('browserbot-ask-page'))) {
            isPanelOpen = true;
            wrapper.classList.add('panel-open');
          }
          container.appendChild(wrapper);

          floatingButton = wrapper;
          setupButtonBehavior(wrapper);
        },
        onRemove() {
          removeUI();
        }
      });

      ui.mount();
    }

    function removeUI() {
      if (btnCleanup) {
        btnCleanup();
        btnCleanup = null;
      }
      if (floatingButton) {
        floatingButton.remove();
        floatingButton = null;
        uiMounted = false;
      }
    }

    function setupButtonBehavior(btn: HTMLElement) {
      let isDragging = false;
      let hasMoved = false;
      let startX = 0;
      let startY = 0;
      let initialLeft = 0;
      let initialTop = 0;
      let hideTimeout: ReturnType<typeof setTimeout> | null = null;
      let autoHideEnabled = false;

      // Position: bottom-right by default, or restore saved pos
      getSavedPosition().then((pos) => {
        if (pos && btn) {
          btn.style.right = 'auto';
          btn.style.left = pos.left + 'px';
          btn.style.top = pos.top + 'px';
          btn.style.bottom = 'auto';
        }
      });

      // Touch events on button
      btn.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        isDragging = true;
        hasMoved = false;
        startX = touch.clientX;
        startY = touch.clientY;

        const rect = btn.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        btn.classList.add('dragging');
        clearHideTimeout();
        showBtn();
      }, { passive: true });

      btn.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - startX);
        const dy = Math.abs(touch.clientY - startY);

        if (dx > 5 || dy > 5) {
          hasMoved = true;
        }

        if (hasMoved) {
          e.preventDefault();
          const newLeft = initialLeft + (touch.clientX - startX);
          const newTop = initialTop + (touch.clientY - startY);

          const clampedLeft = Math.max(0, Math.min(window.innerWidth - 48, newLeft));
          const clampedTop = Math.max(0, Math.min(window.innerHeight - 48, newTop));

          btn.style.right = 'auto';
          btn.style.left = clampedLeft + 'px';
          btn.style.top = clampedTop + 'px';
          btn.style.bottom = 'auto';
        }
      }, { passive: false });

      btn.addEventListener('touchend', () => {
        isDragging = false;
        btn.classList.remove('dragging');

        if (!hasMoved) {
          toggleAskPage();
        } else {
          const rect = btn.getBoundingClientRect();
          savePosition({ left: rect.left, top: rect.top });
          snapToEdge(btn);
          startAutoHide();
        }
      });

      // Mouse events on button
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
        hasMoved = false;
        startX = e.clientX;
        startY = e.clientY;

        const rect = btn.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        btn.classList.add('dragging');
        clearHideTimeout();
        showBtn();
      });

      const onDocMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const dx = Math.abs(e.clientX - startX);
        const dy = Math.abs(e.clientY - startY);

        if (dx > 5 || dy > 5) {
          hasMoved = true;
        }

        if (hasMoved) {
          const newLeft = initialLeft + (e.clientX - startX);
          const newTop = initialTop + (e.clientY - startY);

          const clampedLeft = Math.max(0, Math.min(window.innerWidth - 48, newLeft));
          const clampedTop = Math.max(0, Math.min(window.innerHeight - 48, newTop));

          btn.style.right = 'auto';
          btn.style.left = clampedLeft + 'px';
          btn.style.top = clampedTop + 'px';
          btn.style.bottom = 'auto';
        }
      };

      const onDocMouseUp = () => {
        if (!isDragging) return;
        isDragging = false;
        btn.classList.remove('dragging');

        if (!hasMoved) {
          toggleAskPage();
        } else {
          const rect = btn.getBoundingClientRect();
          savePosition({ left: rect.left, top: rect.top });
          snapToEdge(btn);
          startAutoHide();
        }
      };

      document.addEventListener('mousemove', onDocMouseMove);
      document.addEventListener('mouseup', onDocMouseUp);

      function snapToEdge(element: HTMLElement) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const viewportCenterX = window.innerWidth / 2;

        if (centerX < viewportCenterX) {
          element.style.left = '8px';
        } else {
          element.style.left = (window.innerWidth - 56) + 'px';
        }

        const clampedTop = Math.max(8, Math.min(window.innerHeight - 56, centerY - 24));
        element.style.top = clampedTop + 'px';

        savePosition({
          left: parseInt(element.style.left, 10),
          top: clampedTop
        });
      }

      function startAutoHide() {
        autoHideEnabled = true;
        scheduleHide();
      }

      function scheduleHide() {
        if (!autoHideEnabled) return;
        clearHideTimeout();
        hideTimeout = setTimeout(() => {
          hideBtn();
        }, 3000);
      }

      function clearHideTimeout() {
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }
      }

      function hideBtn() {
        btn.classList.add('hidden');
      }

      function showBtn() {
        if (isPanelOpen) return;
        btn.classList.remove('hidden');
        if (autoHideEnabled) {
          scheduleHide();
        }
      }

      // Show on scroll
      let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
      const onWinScroll = () => {
        if (isPanelOpen) return;
        showBtn();
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (autoHideEnabled) scheduleHide();
        }, 1000);
      };
      window.addEventListener('scroll', onWinScroll, { passive: true });

      // Show on touch near button
      const onDocTouchStart = (e: TouchEvent) => {
        if (isPanelOpen) return;
        const touch = e.touches[0];
        const rect = btn.getBoundingClientRect();
        const margin = 100;

        if (
          touch.clientX >= rect.left - margin &&
          touch.clientX <= rect.right + margin &&
          touch.clientY >= rect.top - margin &&
          touch.clientY <= rect.bottom + margin
        ) {
          showBtn();
        }
      };
      document.addEventListener('touchstart', onDocTouchStart, { passive: true });

      // Start auto-hide after 5 seconds of no interaction
      const initTimeout = setTimeout(() => {
        startAutoHide();
      }, 5000);

      btnCleanup = () => {
        document.removeEventListener('mousemove', onDocMouseMove);
        document.removeEventListener('mouseup', onDocMouseUp);
        window.removeEventListener('scroll', onWinScroll);
        document.removeEventListener('touchstart', onDocTouchStart);
        clearHideTimeout();
        if (scrollTimeout) clearTimeout(scrollTimeout);
        clearTimeout(initTimeout);
      };
    }

    async function toggleAskPage() {
      updatePanelOpenState(true);
      try {
        await browser.runtime.sendMessage({ type: 'TOGGLE_ASK_PAGE' });
      } catch (e) {
        try {
          await new Promise(r => setTimeout(r, 200));
          await browser.runtime.sendMessage({ type: 'TOGGLE_ASK_PAGE' });
        } catch (_) {
          console.warn('BrowserBot: Could not reach background script for TOGGLE_ASK_PAGE');
          updatePanelOpenState(false);
        }
      }
    }

    // Mount the UI
    mountUI();
  }
});
