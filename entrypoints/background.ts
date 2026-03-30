import { streamChatWithAI, ChatMessage } from '../utils/askPageAI';
import { AppStorage, AIProviderType } from '../utils/storage';

export default defineBackground(() => {
  console.log('BrowserBot background ready', { id: browser.runtime.id });

  // ─── Message Router ────────────────────────────────────────
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_ASK_PAGE') {
      handleToggleAskPage(message);
      return false;
    }

    if (message.type === 'ASK_PAGE_CHAT') {
      handleAskPageChat(message, sender);
      return false; // we respond via streaming port, not sendResponse
    }

    if (message.type === 'GET_TAB_LIST') {
      handleGetTabList().then(sendResponse);
      return true; // async sendResponse
    }

    if (message.type === 'GET_TAB_CONTENT') {
      handleGetTabContent(message.tabId).then(sendResponse);
      return true;
    }

    if (message.type === 'SAVE_PANEL_WIDTH') {
      AppStorage.set({ askPagePanelWidth: message.width });
      return false;
    }

    return false;
  });

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
      // Content script might not be injected yet
      console.warn('Could not send TOGGLE_ASK_PAGE to tab', tab.id);
    }
  }

  // ─── Stream chat to content script via port ────────────────
  async function handleAskPageChat(message: any, sender: browser.Runtime.MessageSender) {
    const tabId = sender.tab?.id;
    if (!tabId) return;

    const messages: ChatMessage[] = message.messages;
    const providerType: AIProviderType | undefined = message.providerType;
    const openaiProviderId: string | undefined = message.openaiProviderId;

    const abortController = new AbortController();

    // Listen for abort from content script
    const abortListener = (msg: any, abortSender: browser.Runtime.MessageSender) => {
      if (msg.type === 'ASK_PAGE_CHAT_ABORT' && abortSender.tab?.id === tabId) {
        abortController.abort();
      }
    };
    browser.runtime.onMessage.addListener(abortListener);

    try {
      await streamChatWithAI(messages, {
        providerType,
        openaiProviderId,
        signal: abortController.signal,
        onChunk: (chunk: string) => {
          browser.tabs.sendMessage(tabId, {
            type: 'ASK_PAGE_CHAT_CHUNK',
            chunk
          }).catch(() => {});
        }
      });

      await browser.tabs.sendMessage(tabId, {
        type: 'ASK_PAGE_CHAT_DONE'
      }).catch(() => {});
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        await browser.tabs.sendMessage(tabId, {
          type: 'ASK_PAGE_CHAT_ERROR',
          error: err.message || 'Unknown error'
        }).catch(() => {});
      }
    } finally {
      browser.runtime.onMessage.removeListener(abortListener);
    }
  }

  // ─── Return list of open tabs ──────────────────────────────
  async function handleGetTabList() {
    const tabs = await browser.tabs.query({ currentWindow: true });
    return tabs
      .filter(t => t.id != null && t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://'))
      .map(t => ({
        id: t.id!,
        title: t.title || '',
        url: t.url || '',
        favIconUrl: t.favIconUrl || ''
      }));
  }

  // ─── Extract content from a tab (placeholder) ─────────────
  async function handleGetTabContent(tabId: number) {
    // Placeholder: just return basic tab info
    // User will provide proper extraction logic later
    try {
      const tab = await browser.tabs.get(tabId);
      return {
        tabId,
        title: tab.title || '',
        url: tab.url || '',
        content: `[Tab: ${tab.title}]\nURL: ${tab.url}\n\n(Full content extraction not yet implemented)`
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
});
