import { getStyles } from '../../utils/chatStyles';

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  runAt: 'document_idle',

  async main(ctx) {
    let uiMounted = false;
    let floatingButton: HTMLElement | null = null;
    let enabled = true;

    // Check if floating button is enabled
    const checkEnabled = async () => {
      const state = await browser.storage.local.get('appState') as { appState?: { askPageFloatingButton?: boolean } };
      if (!state.appState) return true;
      return state.appState.askPageFloatingButton !== false;
    };

    enabled = await checkEnabled();

    // Listen for storage changes
    browser.storage.onChanged.addListener((changes, area) => {
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
    });

    if (!enabled) return;

    async function mountUI() {
      if (uiMounted) return;
      uiMounted = true;

      const ui = await createShadowRootUi(ctx, {
        name: 'browserbot-floating-button',
        position: 'overlay',
        zIndex: 2147483645,
        onMount(container) {
          const style = document.createElement('style');
          style.textContent = getStyles();
          const shadowRoot = container.getRootNode() as ShadowRoot;
          shadowRoot.appendChild(style);

          const wrapper = document.createElement('div');
          wrapper.id = 'browserbot-floating-btn';
          wrapper.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
          container.appendChild(wrapper);

          floatingButton = wrapper;
          setupButtonBehavior(wrapper);
        },
        onRemove() {
          floatingButton = null;
        }
      });

      ui.mount();
    }

    function removeUI() {
      if (floatingButton) {
        floatingButton.remove();
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

      // Position: bottom-right by default
      const savedPos = localStorage.getItem('browserbot-float-btn-pos');
      if (savedPos) {
        try {
          const pos = JSON.parse(savedPos);
          btn.style.right = 'auto';
          btn.style.left = pos.left + 'px';
          btn.style.top = pos.top + 'px';
          btn.style.bottom = 'auto';
        } catch (e) {
          // ignore
        }
      }

      // Touch events
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
          
          // Clamp within viewport
          const clampedLeft = Math.max(0, Math.min(window.innerWidth - 48, newLeft));
          const clampedTop = Math.max(0, Math.min(window.innerHeight - 48, newTop));
          
          btn.style.right = 'auto';
          btn.style.left = clampedLeft + 'px';
          btn.style.top = clampedTop + 'px';
          btn.style.bottom = 'auto';
        }
      }, { passive: false });

      btn.addEventListener('touchend', (e) => {
        isDragging = false;
        btn.classList.remove('dragging');
        
        if (!hasMoved) {
          // It's a tap - toggle ask page
          toggleAskPage();
        } else {
          // Save position
          const rect = btn.getBoundingClientRect();
          localStorage.setItem('browserbot-float-btn-pos', JSON.stringify({
            left: rect.left,
            top: rect.top
          }));
          
          // Snap to nearest edge
          snapToEdge(btn);
          
          // Start auto-hide
          startAutoHide();
        }
      });

      // Mouse events (for desktop testing)
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

      document.addEventListener('mousemove', (e) => {
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
      });

      document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        btn.classList.remove('dragging');
        
        if (!hasMoved) {
          toggleAskPage();
        } else {
          const rect = btn.getBoundingClientRect();
          localStorage.setItem('browserbot-float-btn-pos', JSON.stringify({
            left: rect.left,
            top: rect.top
          }));
          
          snapToEdge(btn);
          startAutoHide();
        }
      });

      function snapToEdge(element: HTMLElement) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const viewportCenterX = window.innerWidth / 2;
        
        // Snap to left or right edge
        if (centerX < viewportCenterX) {
          element.style.left = '8px';
        } else {
          element.style.left = (window.innerWidth - 56) + 'px';
        }
        
        // Clamp vertical
        const clampedTop = Math.max(8, Math.min(window.innerHeight - 56, centerY - 24));
        element.style.top = clampedTop + 'px';
        
        // Save snapped position
        localStorage.setItem('browserbot-float-btn-pos', JSON.stringify({
          left: parseInt(element.style.left),
          top: clampedTop
        }));
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
        btn.classList.remove('hidden');
        if (autoHideEnabled) {
          scheduleHide();
        }
      }

      // Show on scroll
      let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
      window.addEventListener('scroll', () => {
        showBtn();
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (autoHideEnabled) scheduleHide();
        }, 1000);
      }, { passive: true });

      // Show on touch near button
      document.addEventListener('touchstart', (e) => {
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
      }, { passive: true });

      // Start auto-hide after 5 seconds of no interaction
      setTimeout(() => {
        startAutoHide();
      }, 5000);
    }

    async function toggleAskPage() {
      try {
        await browser.runtime.sendMessage({ type: 'TOGGLE_ASK_PAGE' });
      } catch (e) {
        // Could not reach background script
      }
    }

    // Mount the UI
    mountUI();
  }
});
