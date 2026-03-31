import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import AskPagePanel from './AskPagePanel';
import { extractPageContent } from '../../utils/extractor';

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

function getStyles(): string {
  return `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

:host {
  all: initial;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

#browserbot-ask-page-root {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2147483646;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ─── Panel Container ──────────────────────────────── */

.askpage-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: #13141a;
  color: #f3f4f6;
  border-left: 1px solid rgba(255,255,255,0.08);
  box-shadow: -8px 0 40px rgba(0,0,0,0.35);
  animation: slideInPanel 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.askpage-panel.minimized {
  animation: slideOutPanel 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideInPanel {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutPanel {
  from { transform: translateX(0); opacity: 1; }
  to   { transform: translateX(100%); opacity: 0; }
}

/* ─── Resize Handle ────────────────────────────────── */

.askpage-resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 5px;
  cursor: col-resize;
  background: transparent;
  z-index: 10;
  transition: background 0.15s;
}

.askpage-resize-handle:hover,
.askpage-resize-handle.dragging {
  background: rgba(167, 139, 250, 0.5);
}

/* ─── Header ───────────────────────────────────────── */

.askpage-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  flex-shrink: 0;
}

.askpage-header-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6c5ce7, #a78bfa);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.askpage-header-icon svg {
  color: #fff;
}

.askpage-header-title {
  font-size: 14px;
  font-weight: 700;
  flex: 1;
}

.askpage-header-btn {
  background: rgba(255,255,255,0.06);
  border: none;
  color: #9ca3af;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.askpage-header-btn:hover {
  background: rgba(255,255,255,0.12);
  color: #f3f4f6;
}

/* ─── Provider / Prompt Selector Row ───────────────── */

.askpage-controls {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.askpage-select {
  flex: 1;
  padding: 7px 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  color: #f3f4f6;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.15s;
  appearance: auto;
}

.askpage-select:focus {
  outline: none;
  border-color: #a78bfa;
}

.askpage-select option {
  background: #1c1e2a;
  color: #f3f4f6;
}

/* ─── Quick Prompt Select ──────────────────────── */

.askpage-quick-prompt-select {
  max-width: 140px;
  min-width: 110px;
  flex: 0 0 auto !important;
}

/* ─── Chat Messages ────────────────────────────────── */

.askpage-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.askpage-messages::-webkit-scrollbar {
  width: 5px;
}

.askpage-messages::-webkit-scrollbar-track {
  background: transparent;
}

.askpage-messages::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
}

.askpage-msg {
  max-width: 90%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.55;
  word-break: break-word;
  animation: fadeInMsg 0.2s ease;
}

@keyframes fadeInMsg {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.askpage-msg.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #6c5ce7, #a78bfa);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.askpage-msg.assistant {
  align-self: flex-start;
  background: rgba(255,255,255,0.06);
  color: #e5e7eb;
  border-bottom-left-radius: 4px;
}

.askpage-msg.error {
  align-self: flex-start;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

/* ─── Markdown Rendering ───────────────────────────── */

.askpage-msg.assistant h1,
.askpage-msg.assistant h2,
.askpage-msg.assistant h3,
.askpage-msg.assistant h4 {
  margin: 12px 0 6px;
  font-weight: 700;
  line-height: 1.3;
}

.askpage-msg.assistant h1 { font-size: 17px; }
.askpage-msg.assistant h2 { font-size: 15px; }
.askpage-msg.assistant h3 { font-size: 14px; }
.askpage-msg.assistant h4 { font-size: 13px; }

.askpage-msg.assistant h1:first-child,
.askpage-msg.assistant h2:first-child,
.askpage-msg.assistant h3:first-child {
  margin-top: 0;
}

.askpage-msg.assistant p {
  margin: 6px 0;
}

.askpage-msg.assistant p:first-child { margin-top: 0; }
.askpage-msg.assistant p:last-child { margin-bottom: 0; }

.askpage-msg.assistant ul,
.askpage-msg.assistant ol {
  margin: 6px 0;
  padding-left: 20px;
}

.askpage-msg.assistant li {
  margin: 3px 0;
}

.askpage-msg.assistant code {
  background: rgba(167, 139, 250, 0.12);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
}

.askpage-msg.assistant pre {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0;
  overflow-x: auto;
  scrollbar-width: thin;
}

.askpage-msg.assistant pre code {
  background: none;
  padding: 0;
  border-radius: 0;
  font-size: 12px;
  line-height: 1.5;
}

.askpage-msg.assistant blockquote {
  border-left: 3px solid #a78bfa;
  padding-left: 12px;
  margin: 8px 0;
  color: #9ca3af;
}

.askpage-msg.assistant table {
  border-collapse: collapse;
  margin: 8px 0;
  width: 100%;
  font-size: 12px;
}

.askpage-msg.assistant th,
.askpage-msg.assistant td {
  border: 1px solid rgba(255,255,255,0.1);
  padding: 6px 10px;
  text-align: left;
}

.askpage-msg.assistant th {
  background: rgba(255,255,255,0.06);
  font-weight: 600;
}

.askpage-msg.assistant a {
  color: #a78bfa;
  text-decoration: underline;
}

.askpage-msg.assistant strong { font-weight: 700; }
.askpage-msg.assistant em { font-style: italic; }

.askpage-msg.assistant hr {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.1);
  margin: 12px 0;
}

/* ─── Typing Indicator ─────────────────────────────── */

.askpage-typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  align-self: flex-start;
}

.askpage-typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #a78bfa;
  animation: typingBounce 1.4s infinite ease-in-out;
}

.askpage-typing-dot:nth-child(2) { animation-delay: 0.2s; }
.askpage-typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* ─── Tab Context Bar ──────────────────────────────── */

.askpage-tabs-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  flex-wrap: wrap;
  flex-shrink: 0;
}

.askpage-tabs-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6b7280;
  margin-right: 4px;
}

.askpage-tab-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 6px;
  font-size: 11px;
  color: #6ee7b7;
  max-width: 160px;
}

.askpage-tab-chip-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.askpage-tab-chip-close {
  background: none;
  border: none;
  color: #6ee7b7;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  line-height: 1;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.askpage-tab-chip-close:hover {
  opacity: 1;
}

.askpage-add-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(255,255,255,0.06);
  border: 1px dashed rgba(255,255,255,0.15);
  border-radius: 6px;
  color: #9ca3af;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.askpage-add-tab-btn:hover {
  background: rgba(167, 139, 250, 0.1);
  border-color: rgba(167, 139, 250, 0.3);
  color: #a78bfa;
}

/* ─── Tab Picker Modal ─────────────────────────────── */

.askpage-tab-picker-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.askpage-tab-picker {
  background: #1c1e2a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 16px;
  width: calc(100% - 32px);
  max-width: 360px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: scaleIn 0.2s ease;
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.askpage-tab-picker h4 {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
}

.askpage-tab-picker-search {
  padding: 8px 12px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #f3f4f6;
  font-family: inherit;
  font-size: 13px;
  width: 100%;
}

.askpage-tab-picker-search:focus {
  outline: none;
  border-color: #a78bfa;
}

.askpage-tab-picker-search::placeholder {
  color: #6b7280;
}

.askpage-tab-picker-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 260px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.askpage-tab-picker-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: rgba(255,255,255,0.03);
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  color: #e5e7eb;
  text-align: left;
  width: 100%;
}

.askpage-tab-picker-item:hover {
  background: rgba(167, 139, 250, 0.08);
  border-color: rgba(167, 139, 250, 0.2);
}

.askpage-tab-picker-item.selected {
  background: rgba(167, 139, 250, 0.12);
  border-color: #a78bfa;
}

.askpage-tab-picker-favicon {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
}

.askpage-tab-picker-info {
  flex: 1;
  overflow: hidden;
}

.askpage-tab-picker-title {
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.askpage-tab-picker-url {
  font-size: 10px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.askpage-tab-picker-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.askpage-tab-picker-btn {
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  border: none;
  transition: all 0.15s;
}

.askpage-tab-picker-btn.cancel {
  background: rgba(255,255,255,0.06);
  color: #9ca3af;
}

.askpage-tab-picker-btn.cancel:hover {
  background: rgba(255,255,255,0.1);
}

.askpage-tab-picker-btn.confirm {
  background: #a78bfa;
  color: #fff;
}

.askpage-tab-picker-btn.confirm:hover {
  background: #c4b5fd;
}

/* ─── Input Area ───────────────────────────────────── */

.askpage-input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  flex-shrink: 0;
}

.askpage-input {
  flex: 1;
  padding: 10px 14px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #f3f4f6;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.45;
  resize: none;
  max-height: 120px;
  scrollbar-width: thin;
  transition: border-color 0.15s;
}

.askpage-input:focus {
  outline: none;
  border-color: #a78bfa;
}

.askpage-input::placeholder {
  color: #6b7280;
}

.askpage-send-btn {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #6c5ce7, #a78bfa);
  border: none;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}

.askpage-send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(108, 92, 231, 0.35);
}

.askpage-send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ─── Minimized Floating Tab ───────────────────────── */

.askpage-minimized-tab {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 40px;
  height: 48px;
  background: linear-gradient(135deg, #6c5ce7, #a78bfa);
  border: none;
  border-radius: 10px 0 0 10px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -4px 0 16px rgba(108, 92, 231, 0.3);
  z-index: 2147483646;
  animation: fadeInTab 0.3s ease;
  transition: all 0.15s;
}

.askpage-minimized-tab:hover {
  width: 48px;
  box-shadow: -6px 0 24px rgba(108, 92, 231, 0.5);
}

@keyframes fadeInTab {
  from { opacity: 0; transform: translateY(-50%) translateX(20px); }
  to   { opacity: 1; transform: translateY(-50%) translateX(0); }
}

/* ─── Welcome Message ──────────────────────────────── */

.askpage-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 12px;
  text-align: center;
  padding: 40px 20px;
}

.askpage-welcome-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(108, 92, 231, 0.15), rgba(167, 139, 250, 0.15));
  display: flex;
  align-items: center;
  justify-content: center;
}

.askpage-welcome-icon svg {
  color: #a78bfa;
}

.askpage-welcome h3 {
  font-size: 16px;
  font-weight: 700;
  color: #f3f4f6;
  margin: 0;
}

.askpage-welcome p {
  font-size: 13px;
  color: #6b7280;
  max-width: 260px;
  line-height: 1.5;
  margin: 0;
}

/* ─── Code Copy Button ─────────────────────────────── */

.askpage-code-wrapper {
  position: relative;
  margin: 8px 0;
}

.askpage-copy-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 3px 10px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 5px;
  color: #9ca3af;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  z-index: 2;
}

.askpage-copy-btn:hover {
  background: rgba(167, 139, 250, 0.2);
  border-color: rgba(167, 139, 250, 0.4);
  color: #a78bfa;
}

.askpage-code-wrapper pre {
  margin: 0 !important;
}

/* ─── Current Tab Chip ─────────────────────────────── */

.askpage-current-tab-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 6px;
  color: #9ca3af;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}

.askpage-current-tab-chip:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
  color: #a78bfa;
}

.askpage-current-tab-chip.active {
  background: rgba(99, 102, 241, 0.15);
  border-color: #a78bfa;
  color: #a78bfa;
}

.askpage-tab-chip-check {
  font-size: 11px;
  font-weight: 700;
}

/* ─── History Header Button ──────────────────── */

.askpage-history-btn {
  margin-right: 2px;
}

.askpage-history-btn.active {
  background: rgba(167, 139, 250, 0.2) !important;
  color: #a78bfa !important;
}

/* ─── History Sidebar Close Button ────────────── */

.askpage-history-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.askpage-history-close:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* ─── History Sidebar ────────────────────────── */

.askpage-history-sidebar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 260px;
  background: #181a22;
  border-right: 1px solid rgba(255,255,255,0.08);
  z-index: 20;
  display: flex;
  flex-direction: column;
  animation: slideInHistory 0.2s ease;
}

@keyframes slideInHistory {
  from { transform: translateX(-100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}

.askpage-history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 12px 8px;
}

.askpage-history-header h4 {
  font-size: 13px;
  font-weight: 700;
  margin: 0;
  color: #f3f4f6;
}

.askpage-history-new {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(167, 139, 250, 0.12);
  border: 1px solid rgba(167, 139, 250, 0.25);
  border-radius: 6px;
  color: #a78bfa;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.askpage-history-new:hover {
  background: rgba(167, 139, 250, 0.2);
}

.askpage-history-search {
  margin: 4px 12px 8px;
  padding: 7px 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  color: #f3f4f6;
  font-family: inherit;
  font-size: 12px;
}

.askpage-history-search:focus { outline: none; border-color: #a78bfa; }
.askpage-history-search::placeholder { color: #6b7280; }

.askpage-history-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.askpage-history-item {
  display: flex;
  align-items: stretch;
  border-radius: 8px;
  margin-bottom: 2px;
  transition: background 0.12s;
}

.askpage-history-item:hover {
  background: rgba(255,255,255,0.04);
}

.askpage-history-item.active {
  background: rgba(167, 139, 250, 0.1);
}

.askpage-history-item-main {
  flex: 1;
  padding: 8px 8px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  color: #e5e7eb;
  min-width: 0;
}

.askpage-history-item-title {
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.askpage-history-item-meta {
  font-size: 10px;
  color: #6b7280;
  margin-top: 2px;
}

.askpage-history-item-delete {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 16px;
  opacity: 0;
  transition: all 0.12s;
  display: flex;
  align-items: center;
}

.askpage-history-item:hover .askpage-history-item-delete {
  opacity: 0.6;
}

.askpage-history-item-delete:hover {
  opacity: 1 !important;
  color: #ef4444;
}

.askpage-history-empty {
  padding: 24px 16px;
  text-align: center;
  color: #6b7280;
  font-size: 12px;
}

/* ─── Thinking Block ─────────────────────────── */

.askpage-thinking-block {
  align-self: flex-start;
  max-width: 90%;
  margin-bottom: 4px;
  border-radius: 10px;
  background: rgba(167, 139, 250, 0.06);
  border: 1px solid rgba(167, 139, 250, 0.12);
  overflow: hidden;
  animation: fadeInMsg 0.2s ease;
}

.askpage-thinking-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #a78bfa;
  cursor: pointer;
  list-style: none;
  user-select: none;
}

.askpage-thinking-summary::-webkit-details-marker { display: none; }

.askpage-thinking-summary::before {
  content: '▶';
  font-size: 8px;
  transition: transform 0.15s;
}

details[open] > .askpage-thinking-summary::before {
  transform: rotate(90deg);
}

.askpage-thinking-content {
  padding: 8px 12px;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.5;
  border-top: 1px solid rgba(167, 139, 250, 0.1);
  font-style: italic;
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.askpage-thinking-content p { margin: 4px 0; }
.askpage-thinking-content code {
  background: rgba(167, 139, 250, 0.1);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 11px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.askpage-thinking-spinner {
  animation: spin 1.5s linear infinite;
}

/* ─── Welcome Prompt Buttons ──────────────────── */

.askpage-welcome-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
  justify-content: center;
}

.askpage-welcome-prompt-btn {
  padding: 6px 14px;
  background: rgba(167, 139, 250, 0.1);
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 20px;
  color: #a78bfa;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.askpage-welcome-prompt-btn:hover {
  background: rgba(167, 139, 250, 0.2);
  border-color: rgba(167, 139, 250, 0.4);
  transform: translateY(-1px);
}
`;
}
