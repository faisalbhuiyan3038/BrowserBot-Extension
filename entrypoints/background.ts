import { streamChatWithAI, checkChromeAIStatus, downloadChromeAIModel, ChatMessage } from '../utils/askPageAI';
import { AppStorage, ConversationStorage, AIProviderType } from '../utils/storage';

export default defineBackground(() => {
  console.log('BrowserBot background ready', { id: browser.runtime.id });

  // ─── Keyboard command handler ───────────────────────
  browser.commands.onCommand.addListener((command) => {
    if (command === 'toggle_ask_page') {
      handleToggleAskPage({});
    }
  });

  // ─── Auto-clean old conversations on startup ──────────────
  (async () => {
    try {
      const state = await AppStorage.get();
      if (state.askPageAutoDeleteDays > 0) {
        const removed = await ConversationStorage.clearOld(state.askPageAutoDeleteDays);
        if (removed > 0) console.log(`Cleaned ${removed} old conversations`);
      }
    } catch (_) {}
  })();

  // ─── Message Router ────────────────────────────────────────
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'OPEN_CHAT_TAB') {
      browser.tabs.create({ url: browser.runtime.getURL('/chat.html' as any) })
        .then(() => sendResponse({ success: true }))
        .catch(err => sendResponse({ error: err.message }));
      return true;
    }

    if (message.type === 'TOGGLE_ASK_PAGE') {
      handleToggleAskPage(message);
      return false;
    }

    // ─── Chat streaming endpoints ───
    if (message.type === 'ASK_PAGE_CHAT') {
      handleAskPageChat(message, sender);
      return false;
    }

    if (message.type === 'ASK_PAGE_CHAT_ABORT') {
      // Handled within handleAskPageChat via abortListener
      return false;
    }

    if (message.type === 'GET_TAB_LIST') {
      handleGetTabList().then(sendResponse);
      return true;
    }

    if (message.type === 'GET_TAB_CONTENT') {
      handleGetTabContent(message.tabId).then(sendResponse);
      return true;
    }

    if (message.type === 'SAVE_PANEL_WIDTH') {
      AppStorage.set({ askPagePanelWidth: message.width });
      return false;
    }

    // ─── Chat persistence (session-based for cross-tab sync) ───
    if (message.type === 'SAVE_CHAT') {
      browser.storage.session.set({ askPageChat: message.messages }).then(() => {
        // Broadcast update to all tabs except sender
        broadcastToTabs('CHAT_UPDATED', { messages: message.messages }, sender.tab?.id);
      });
      return false;
    }

    if (message.type === 'LOAD_CHAT') {
      browser.storage.session.get('askPageChat').then((data: any) => {
        sendResponse(data.askPageChat || []);
      }).catch(() => sendResponse([]));
      return true;
    }

    if (message.type === 'CLEAR_CHAT') {
      browser.storage.session.remove('askPageChat');
      broadcastToTabs('CHAT_UPDATED', { messages: [] }, sender.tab?.id);
      return false;
    }

    // ─── Conversation history CRUD ───
    if (message.type === 'SAVE_CONVERSATION') {
      ConversationStorage.save(message.conversation).then(() => sendResponse(true)).catch(() => sendResponse(false));
      return true;
    }

    if (message.type === 'LOAD_CONVERSATIONS') {
      ConversationStorage.loadAll().then(sendResponse).catch(() => sendResponse([]));
      return true;
    }

    if (message.type === 'DELETE_CONVERSATION') {
      ConversationStorage.delete(message.id).then(() => sendResponse(true)).catch(() => sendResponse(false));
      return true;
    }

    // ─── Chrome AI status & download ───
    if (message.type === 'CHECK_CHROME_AI') {
      checkChromeAIStatus().then(sendResponse);
      return true;
    }

    if (message.type === 'DOWNLOAD_CHROME_AI') {
      handleDownloadChromeAI(sender).then(sendResponse).catch(err => sendResponse({ error: err.message }));
      return true;
    }

    // ─── DevTools Chat ──────────────────────────────────────────
    if (message.type === 'OPEN_DEVTOOLS_CHAT_TAB') {
      handleOpenDevtoolsChatTab().then(sendResponse).catch(err => sendResponse({ error: err.message }));
      return true;
    }

    if (message.type === 'GET_ACTIVE_TAB_INFO') {
      handleGetActiveTabInfo().then(sendResponse).catch(() => sendResponse(null));
      return true;
    }

    if (message.type === 'COLLECT_DEVTOOLS_DATA') {
      handleCollectDevtoolsData(message).then(sendResponse).catch(err => sendResponse({ error: err.message }));
      return true;
    }

    return false;
  });

  // ─── Broadcast message to all tabs (except excludeTabId) ──
  async function broadcastToTabs(type: string, data: any, excludeTabId?: number) {
    try {
      const tabs = await browser.tabs.query({});
      for (const tab of tabs) {
        if (tab.id && tab.id !== excludeTabId) {
          browser.tabs.sendMessage(tab.id, { type, ...data }).catch(() => {});
        }
      }
    } catch (_) {}
  }

  // ─── Toggle Ask Page overlay on active tab ─────────────────
  async function handleToggleAskPage(message: any) {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    try {
      await browser.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_ASK_PAGE',
        pageTitle: tab.title || '',
        pageUrl: tab.url || ''
      });
    } catch (_) {
      console.warn('Could not send TOGGLE_ASK_PAGE to tab', tab.id);
    }
  }

  // ─── Stream chat to content script ────────────────────────
  async function handleAskPageChat(message: any, sender: any) {
    const tabId = sender.tab?.id;
    const isExtensionPage = sender.url?.startsWith('chrome-extension://') || sender.url?.startsWith('moz-extension://');
    if (!tabId && !isExtensionPage) return;

    const messages: ChatMessage[] = message.messages;
    const providerType: AIProviderType | undefined = message.providerType;
    const openaiProviderId: string | undefined = message.openaiProviderId;

    const abortController = new AbortController();

    const abortListener = (msg: any, abortSender: any) => {
      // Abort either matching tabId, or matching extension page session
      if (msg.type === 'ASK_PAGE_CHAT_ABORT') {
        if (isExtensionPage && msg.sessionId === message.sessionId) abortController.abort();
        else if (!isExtensionPage && abortSender.tab?.id === tabId) abortController.abort();
      }
    };
    browser.runtime.onMessage.addListener(abortListener);

    const dispatchChunk = (payload: any) => {
      if (isExtensionPage) {
        browser.runtime.sendMessage(payload).catch(() => {});
      } else if (tabId) {
        browser.tabs.sendMessage(tabId, payload).catch(() => {});
      }
    };

    try {
      await streamChatWithAI(messages, {
        providerType,
        openaiProviderId,
        signal: abortController.signal,
        onChunk: (chunk: string) => {
          dispatchChunk({ type: 'ASK_PAGE_CHAT_CHUNK', chunk, sessionId: message.sessionId });
        },
        onThinkingChunk: (chunk: string) => {
          dispatchChunk({ type: 'ASK_PAGE_CHAT_THINKING', chunk, sessionId: message.sessionId });
        }
      });

      dispatchChunk({ type: 'ASK_PAGE_CHAT_DONE', sessionId: message.sessionId });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        dispatchChunk({ type: 'ASK_PAGE_CHAT_ERROR', error: err.message || 'Unknown error', sessionId: message.sessionId });
      }
    } finally {
      browser.runtime.onMessage.removeListener(abortListener);
    }
  }

  // ─── Chrome AI Model Download ─────────────────────────────
  async function handleDownloadChromeAI(sender: any) {
    const tabId = sender.tab?.id;
    await downloadChromeAIModel((progress) => {
      if (tabId) {
        browser.tabs.sendMessage(tabId, {
          type: 'CHROME_AI_DOWNLOAD_PROGRESS',
          progress
        }).catch(() => {});
      }
    });
    return { success: true };
  }

  // ─── Return list of open tabs ──────────────────────────────
  async function handleGetTabList() {
    const tabs = await browser.tabs.query({});
    return tabs
      .filter(t => t.id != null && t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('about:') && !t.url.startsWith('chrome-extension://') && !t.url.startsWith('moz-extension://'))
      .map(t => ({
        id: t.id!,
        title: t.title || '',
        url: t.url || '',
        favIconUrl: t.favIconUrl || ''
      }));
  }

  // ─── Extract content from a tab via content script message ──
  async function handleGetTabContent(tabId: number) {
    try {
      const tab = await browser.tabs.get(tabId);
      const state = await AppStorage.get();
      const algorithm = state.pageExtractionAlgorithm || 1;

      // Send extraction request to the content script in that tab
      try {
        const result = await browser.tabs.sendMessage(tabId, {
          type: 'EXTRACT_PAGE_CONTENT',
          algorithm
        });
        if (result && result.content) {
          return {
            tabId,
            title: tab.title || '',
            url: tab.url || '',
            content: `[Tab: ${tab.title}]\nURL: ${tab.url}\n\n${result.content}`
          };
        }
      } catch (_) {
        // Content script might not be injected in this tab. Try direct script injection fallback.
        try {
          const textResult = await browser.scripting.executeScript({
            target: { tabId },
            func: () => document.body ? document.body.innerText.substring(0, 20000) : ''
          });
          
          if (textResult && textResult[0] && textResult[0].result) {
            return {
              tabId,
              title: tab.title || '',
              url: tab.url || '',
              content: `[Tab: ${tab.title}]\nURL: ${tab.url}\n\n${textResult[0].result}`
            };
          }
        } catch (injectErr) {
          // Injection also failed (e.g., chrome:// url)
        }
      }

      // Final fallback: return basic info with clear failure message
      return {
        tabId,
        title: tab.title || '',
        url: tab.url || '',
        content: `[Tab: ${tab.title}]\nURL: ${tab.url}\n\n(Could not extract content — page may not support extraction)`
      };
    } catch (err: any) {
      return {
        tabId,
        title: 'Unknown',
        url: '',
        content: `(Could not extract content: ${err.message})`
      };
    }
  }

  // ─── DevTools Handlers ──────────────────────────────────────────────
  async function handleOpenDevtoolsChatTab() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tabId = tabs[0]?.id;
    const title = tabs[0]?.title || '';
    const url = tabs[0]?.url || '';
    const urlParams = new URLSearchParams();
    if (tabId) urlParams.set('tabId', tabId.toString());
    if (title) urlParams.set('title', title);
    if (url) urlParams.set('url', url);
    
    await browser.tabs.create({ url: browser.runtime.getURL('/devtools-chat.html?' + urlParams.toString() as any) });
    return { success: true };
  }

  async function handleGetActiveTabInfo() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    return tabs[0] ? { tabId: tabs[0].id, title: tabs[0].title, url: tabs[0].url } : null;
  }

  async function handleCollectDevtoolsData(message: any) {
    const { tabId, config } = message;
    if (!tabId) throw new Error('No tabId provided');

    const debuggee = { tabId };
    
    try {
      await chrome.debugger.attach(debuggee, '1.3');
    } catch (err: any) {
      if (err.message?.includes('Another debugger is already attached')) {
        throw new Error('DEVTOOLS_OPEN');
      }
      throw err;
    }

    try {
      const data: any = {};
      
      // Enable domains
      await chrome.debugger.sendCommand(debuggee, 'Runtime.enable');
      if (config.network) await chrome.debugger.sendCommand(debuggee, 'Network.enable');
      if (config.console) await chrome.debugger.sendCommand(debuggee, 'Console.enable');

      // Execute script to gather DOM, performance, and buffered monkey-patch data
      const evalRes = await chrome.debugger.sendCommand(debuggee, 'Runtime.evaluate', {
        expression: `
          (() => {
            try {
              const res = {};
              if (${!!config.performance}) {
                const nav = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');
                res.performance = {
                  navTiming: nav ? JSON.parse(JSON.stringify(nav)) : null,
                  paintTiming: paint ? JSON.parse(JSON.stringify(paint)) : null,
                  memory: (performance as any).memory ? {
                    jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
                    totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
                    usedJSHeapSize: (performance as any).memory.usedJSHeapSize
                  } : null
                };
              }
              if (${!!config.dom}) {
                const el = document.querySelector(${JSON.stringify(config.domSelector || 'body')});
                if (el) {
                  const rect = el.getBoundingClientRect();
                  res.dom = {
                    tag: el.tagName,
                    id: el.id,
                    className: el.className,
                    text: el.textContent?.slice(0, 500) || '',
                    attributes: Array.from(el.attributes).map(a => ({name: a.name, value: a.value})),
                    rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
                  };
                } else {
                  res.dom = null;
                }
              }
              res.logs = window.__browserbotLogs || [];
              res.network = window.__browserbotNetwork || [];
              return JSON.stringify(res);
            } catch (e) {
              return JSON.stringify({ logs: [], network: [], error: String(e) });
            }
          })()
        `,
        returnByValue: true
      }) as any;

      let pageData: any = {};
      try {
        if (evalRes.result?.value) {
          pageData = JSON.parse(evalRes.result.value);
        }
      } catch (e) {
        console.error("Failed to parse pageData", e);
      }

      if (config.performance) data.performance = pageData.performance;
      if (config.dom) data.dom = pageData.dom;
      if (config.console) data.logs = pageData.logs;
      if (config.network) data.network = pageData.network;

      // Event listeners for DOM node if requested (requires resolving the node)
      if (config.dom && config.domIncludeListeners) {
        try {
          const doc = await chrome.debugger.sendCommand(debuggee, 'DOM.getDocument', { depth: -1 }) as any;
          const nodeRes = await chrome.debugger.sendCommand(debuggee, 'DOM.querySelector', {
            nodeId: doc.root.nodeId,
            selector: config.domSelector || 'body'
          }) as any;
          if (nodeRes.nodeId) {
            const resolved = await chrome.debugger.sendCommand(debuggee, 'DOM.resolveNode', { nodeId: nodeRes.nodeId }) as any;
            if (resolved.object?.objectId) {
              const listeners = await chrome.debugger.sendCommand(debuggee, 'DOMDebugger.getEventListeners', {
                objectId: resolved.object.objectId
              }) as any;
              data.domListeners = listeners.listeners;
            }
          }
        } catch (e) {
          console.warn("Could not get event listeners", e);
        }
      }

      return data;
    } finally {
      await chrome.debugger.detach(debuggee).catch(() => {});
    }
  }
});
