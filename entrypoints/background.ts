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

    // ─── Removed legacy DevTools Chat handling ──────────────────────────

    // ─── Bookmarks ──────────────────────────────────────────────
    if (message.type === 'GET_BOOKMARKS') {
      browser.bookmarks.getTree().then(tree => {
        sendResponse({ tree });
      }).catch(err => sendResponse({ error: err.message }));
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

  // ─── End Handlers ──────────────────────────────────────────────
});
