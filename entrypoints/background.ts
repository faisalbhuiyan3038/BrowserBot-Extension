import { streamChatWithAI, checkChromeAIStatus, downloadChromeAIModel, ChatMessage } from '../utils/askPageAI';
import { AppStorage, ConversationStorage, SessionChatStorage, AIProviderType } from '../utils/storage';
import type { RuntimeMessage } from '../utils/messages';

export default defineBackground(() => {
  console.log('BrowserBot background ready', { id: browser.runtime.id });

  // ─── Set up CORS override for Ollama ─────────────────────────────
  // The only reliable cross-platform fix is to set the Origin header
  // to exactly match the request domain (e.g. http://127.0.0.1 or http://localhost)
  // because Ollama whitelists local origins by default.
  async function updateOllamaCorsRule() {
    try {
      const state = await AppStorage.get();
      const endpoint = state.ollamaEndpoint || 'http://localhost:11434';
      const url = new URL(endpoint);
      const domain = url.hostname;
      const fakeOrigin = `http://${domain}`;

      // 1. Chrome MV3 (DNR)
      if (browser.declarativeNetRequest && browser.declarativeNetRequest.updateDynamicRules) {
        await browser.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: [1],
          addRules: [
            {
              id: 1,
              priority: 1,
              action: {
                type: 'modifyHeaders',
                requestHeaders: [{ header: 'Origin', operation: 'set', value: fakeOrigin }]
              },
              condition: {
                requestDomains: [domain],
                resourceTypes: ['xmlhttprequest', 'other']
              }
            }
          ]
        });
        console.log('BrowserBot: Updated DNR rule for Ollama domain:', domain);
      }

      // 2. Firefox MV2 (webRequest)
      if (browser.webRequest && browser.webRequest.onBeforeSendHeaders) {
        // Remove existing listener if any
        if ((globalThis as any).ollamaWebRequestFallback) {
          browser.webRequest.onBeforeSendHeaders.removeListener((globalThis as any).ollamaWebRequestFallback);
        }
        
        const listener = (details: any) => {
          const reqUrl = details.url || '';
          if (!reqUrl.includes('/api/chat') && !reqUrl.includes('/api/generate') && !reqUrl.includes('/api/tags')) {
            return {};
          }
          // If Origin header exists, modify it; otherwise add it
          let modified = false;
          const requestHeaders = (details.requestHeaders || []).map((h: any) => {
            if (h.name.toLowerCase() === 'origin') {
              modified = true;
              return { ...h, value: fakeOrigin };
            }
            return h;
          });
          if (!modified) {
            requestHeaders.push({ name: 'Origin', value: fakeOrigin });
          }
          return { requestHeaders };
        };
        (globalThis as any).ollamaWebRequestFallback = listener;
        
        browser.webRequest.onBeforeSendHeaders.addListener(
          listener,
          { urls: ['<all_urls>'] },
          ['blocking', 'requestHeaders']
        );
        console.log('BrowserBot: Updated webRequest listener for Ollama domain:', domain);
      }
    } catch (e: any) {
      console.warn('BrowserBot: Failed to update Ollama CORS rule:', e.message);
    }
  }

  // Run on startup
  updateOllamaCorsRule();

  // Update on settings change
  if (browser.storage && browser.storage.local && browser.storage.local.onChanged) {
    browser.storage.local.onChanged.addListener((changes) => {
      if (changes.appState) {
        updateOllamaCorsRule();
      }
    });
  }

  // ─── Keyboard command handler ───────────────────────
  // Guard: browser.commands is not available on Firefox Android
  if (browser.commands?.onCommand) {
    browser.commands.onCommand.addListener((command) => {
      if (command === 'toggle_ask_page') {
        handleToggleAskPage({});
      }
    });
  }

  // ─── Auto-clean old conversations on startup ──────────────
  (async () => {
    try {
      const state = await AppStorage.get();
      if (state.askPageAutoDeleteDays > 0) {
        const removed = await ConversationStorage.clearOld(state.askPageAutoDeleteDays);
        if (removed > 0) console.log(`Cleaned ${removed} old conversations`);
      }
      if (!browser.storage?.session) {
        await SessionChatStorage.clearChat();
      }
    } catch (_) {}
  })();

  // ─── Message Router ────────────────────────────────────────
  browser.runtime.onMessage.addListener((message: RuntimeMessage, sender, sendResponse) => {
    if (message.type === 'TOGGLE_ASK_PAGE') {
      handleToggleAskPage(message, sender);
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
      handleGetTabList()
        .then(sendResponse)
        .catch(() => sendResponse([]));
      return true;
    }

    if (message.type === 'GET_TAB_CONTENT') {
      handleGetTabContent(message.tabId)
        .then(sendResponse)
        .catch(err => sendResponse({ tabId: message.tabId, title: 'Unknown', url: '', content: `(Error: ${err?.message || 'Failed'})` }));
      return true;
    }

    if (message.type === 'SAVE_PANEL_WIDTH') {
      AppStorage.set({ askPagePanelWidth: message.width });
      return false;
    }

    // ─── Chat persistence (session-based for cross-tab sync) ───
    if (message.type === 'SAVE_CHAT') {
      SessionChatStorage.saveChat(message.messages).then(() => {
        // Broadcast update to all tabs except sender
        broadcastToTabs('CHAT_UPDATED', { messages: message.messages }, sender.tab?.id);
      }).catch(() => {});
      return false;
    }

    if (message.type === 'LOAD_CHAT') {
      SessionChatStorage.loadChat().then((messages) => {
        sendResponse(messages);
      }).catch(() => sendResponse([]));
      return true;
    }

    if (message.type === 'CLEAR_CHAT') {
      SessionChatStorage.clearChat().then(() => {
        broadcastToTabs('CHAT_UPDATED', { messages: [] }, sender.tab?.id);
      }).catch(() => {});
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
      checkChromeAIStatus()
        .then(sendResponse)
        .catch(err => sendResponse({ available: 'no', error: err?.message || 'Check failed' }));
      return true;
    }

    if (message.type === 'DOWNLOAD_CHROME_AI') {
      handleDownloadChromeAI(sender).then(sendResponse).catch(err => sendResponse({ error: err.message }));
      return true;
    }

    if (message.type === 'GET_DEVTOOLS_COOKIES') {
      if (!sender.url?.startsWith(browser.runtime.getURL(''))) {
        sendResponse([]);
        return false;
      }
      const url = String((message as any).url || '');
      if (!/^https?:\/\//i.test(url) || !browser.cookies?.getAll) {
        sendResponse([]);
        return false;
      }
      browser.cookies.getAll({ url }).then((cookies: any[]) => sendResponse(cookies.slice(0, 100).map(c => ({
        name: c.name,
        domain: c.domain,
        path: c.path,
        secure: c.secure,
        httpOnly: c.httpOnly,
        sameSite: c.sameSite,
        session: c.session,
        expirationDate: c.expirationDate,
        value: (message as any).includeValues ? String(c.value || '').slice(0, 256) : undefined,
      })))).catch(() => sendResponse([]));
      return true;
    }

    if (message.type === 'CAPTURE_DEVTOOLS_SCREENSHOT') {
      if (!sender.url?.startsWith(browser.runtime.getURL(''))) {
        sendResponse({ error: 'Only extension pages can capture DevTools screenshots.' });
        return false;
      }
      captureDevtoolsScreenshot(Number((message as any).tabId)).then(sendResponse).catch(err => sendResponse({ error: err.message }));
      return true;
    }

    if (message.type === 'GET_DEVTOOLS_ELEMENT_CDP') {
      if (!sender.url?.startsWith(browser.runtime.getURL(''))) {
        sendResponse({ error: 'Only extension pages can request DevTools element data.' });
        return false;
      }
      captureDevtoolsElementCDP(message as any).then(sendResponse).catch(err => sendResponse({ error: err.message }));
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

  async function captureDevtoolsScreenshot(tabId: number) {
    if (!Number.isInteger(tabId) || tabId < 0) throw new Error('Invalid inspected tab');
    const tab = await browser.tabs.get(tabId);
    const [activeTab] = await browser.tabs.query({ active: true, windowId: tab.windowId });
    if (activeTab?.id === tabId) {
      return { dataUrl: await browser.tabs.captureVisibleTab(tab.windowId, { format: 'jpeg', quality: 65 }) };
    }
    // CDP is only available in Chrome and can capture an inspected tab that is
    // not the active tab. Firefox has no matching target-specific screenshot API.
    if (browser.runtime.getURL('').startsWith('chrome-extension://') && (browser as any).debugger?.attach) {
      const target = { tabId };
      let attachedHere = false;
      try {
        await (browser as any).debugger.attach(target, '1.3');
        attachedHere = true;
        const result = await (browser as any).debugger.sendCommand(target, 'Page.captureScreenshot', { format: 'jpeg', quality: 65, captureBeyondViewport: false });
        return { dataUrl: `data:image/jpeg;base64,${result.data}` };
      } finally {
        if (attachedHere) await (browser as any).debugger.detach(target).catch(() => {});
      }
    }
    throw new Error('Bring the inspected tab to the front before capturing a screenshot in Firefox.');
  }

  async function captureDevtoolsElementCDP(message: any) {
    if (!browser.runtime.getURL('').startsWith('chrome-extension://')) return { unsupported: 'Matched CSS and the full accessibility tree require Chrome CDP; Firefox includes computed styles and an ARIA approximation.' };
    const debuggerApi = (browser as any).debugger;
    if (!debuggerApi?.attach || !Number.isInteger(message.tabId) || typeof message.selector !== 'string' || message.selector.length > 2000) return { unsupported: 'Chrome debugger API or a valid selected-element selector is unavailable.' };
    const target = { tabId: message.tabId };
    let attached = false;
    try {
      await debuggerApi.attach(target, '1.3');
      attached = true;
      await debuggerApi.sendCommand(target, 'DOM.enable');
      const { root } = await debuggerApi.sendCommand(target, 'DOM.getDocument', { depth: 1, pierce: true });
      const { nodeId } = await debuggerApi.sendCommand(target, 'DOM.querySelector', { nodeId: root.nodeId, selector: message.selector });
      if (!nodeId) return { unsupported: 'Selected element was not found in the page document.' };
      const result: any = {};
      if (message.matchedStyles) {
        await debuggerApi.sendCommand(target, 'CSS.enable');
        const styles = await debuggerApi.sendCommand(target, 'CSS.getMatchedStylesForNode', { nodeId });
        result.matchedStyles = (styles.matchedCSSRules || []).slice(0, 20).map((item: any) => ({
          selector: item.rule?.selectorList?.text,
          origin: item.rule?.origin,
          declarations: (item.rule?.style?.cssProperties || []).filter((p: any) => p.name && p.value && !p.disabled).slice(0, 30).map((p: any) => ({ name: p.name, value: p.value, important: p.important || false })),
        }));
      }
      if (message.accessibilityTree) {
        const ax = await debuggerApi.sendCommand(target, 'Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
        result.accessibilityTree = (ax.nodes || []).slice(0, 20).map((n: any) => ({
          role: n.role?.value,
          name: n.name?.value,
          ignored: n.ignored,
          properties: (n.properties || []).filter((p: any) => ['focusable','focused','disabled','checked','expanded','selected','level','required'].includes(p.name)).map((p: any) => ({ name: p.name, value: p.value?.value })),
        }));
      }
      return result;
    } finally {
      if (attached) await debuggerApi.detach(target).catch(() => {});
    }
  }

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

  // Active streams tracking to prevent collisions and race conditions
  const activeChatStreams = new Map<string, AbortController>();

  // ─── Toggle Ask Page overlay on active tab ─────────────────
  async function handleToggleAskPage(message: any, sender?: any) {
    let tabId = sender?.tab?.id;
    let pageTitle = sender?.tab?.title || '';
    let pageUrl = sender?.tab?.url || '';

    if (!tabId) {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;
      tabId = tab.id;
      pageTitle = tab.title || '';
      pageUrl = tab.url || '';
    }

    const payload = {
      type: 'TOGGLE_ASK_PAGE',
      pageTitle,
      pageUrl
    };

    // Try sending the message to the content script
    try {
      await browser.tabs.sendMessage(tabId, payload);
    } catch (_) {
      // Content script is not reachable. Try injecting it dynamically.
      try {
        if (browser.scripting?.executeScript) {
          await browser.scripting.executeScript({
            target: { tabId },
            files: ['/content-scripts/ask-page.js']
          });
          // Wait briefly for content script to mount and register message listener
          await new Promise(r => setTimeout(r, 150));
          await browser.tabs.sendMessage(tabId, payload);
          return;
        }
      } catch (injectErr: any) {
        console.warn('BrowserBot: Programmatic injection fallback failed:', injectErr?.message);
      }

      // Retry once after a short delay
      try {
        await new Promise(r => setTimeout(r, 300));
        await browser.tabs.sendMessage(tabId, payload);
      } catch (_) {
        console.warn('BrowserBot: Content script not reachable for tab', tabId, '— cannot toggle Ask Page.');
      }
    }
  }

  // ─── Stream chat to content script ────────────────────────
  async function handleAskPageChat(message: any, sender: any) {
    const tabId = sender.tab?.id;
    const isExtensionPage = !tabId || Boolean(
      sender.url?.startsWith('chrome-extension://') ||
      sender.url?.startsWith('moz-extension://')
    );
    if (!tabId && !isExtensionPage) return;

    const messages: ChatMessage[] = message.messages;
    const providerType: AIProviderType | undefined = message.providerType;
    const openaiProviderId: string | undefined = message.openaiProviderId;

    // Abort any existing stream for this tab/session to avoid collisions
    const streamKey = isExtensionPage ? (message.sessionId || 'ext') : String(tabId);
    if (activeChatStreams.has(streamKey)) {
      activeChatStreams.get(streamKey)?.abort();
      activeChatStreams.delete(streamKey);
    }

    const abortController = new AbortController();
    activeChatStreams.set(streamKey, abortController);

    const abortListener = (msg: any, abortSender: any) => {
      if (msg.type === 'ASK_PAGE_CHAT_ABORT') {
        if (msg.sessionId === message.sessionId || (tabId && abortSender.tab?.id === tabId)) {
          abortController.abort();
        }
      }
    };
    browser.runtime.onMessage.addListener(abortListener);

    const dispatchChunk = (payload: any) => {
      // Don't dispatch if this stream was aborted
      if (abortController.signal.aborted) return;
      if (tabId) {
        browser.tabs.sendMessage(tabId, payload).catch(() => {});
      }
      if (isExtensionPage) {
        browser.runtime.sendMessage(payload).catch(() => {});
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

      if (!abortController.signal.aborted) {
        dispatchChunk({ type: 'ASK_PAGE_CHAT_DONE', sessionId: message.sessionId });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && !abortController.signal.aborted) {
        dispatchChunk({ type: 'ASK_PAGE_CHAT_ERROR', error: err.message || 'Unknown error', sessionId: message.sessionId });
      }
    } finally {
      browser.runtime.onMessage.removeListener(abortListener);
      if (activeChatStreams.get(streamKey) === abortController) {
        activeChatStreams.delete(streamKey);
      }
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
      const algorithm = state.pageExtractionAlgorithm || 4;

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
          if (browser.scripting?.executeScript) {
            await browser.scripting.executeScript({
              target: { tabId },
              files: ['/content-scripts/ask-page.js']
            });
            await new Promise(r => setTimeout(r, 150));
            const retryResult = await browser.tabs.sendMessage(tabId, {
              type: 'EXTRACT_PAGE_CONTENT',
              algorithm
            });
            if (retryResult && retryResult.content) {
              return {
                tabId,
                title: tab.title || '',
                url: tab.url || '',
                content: `[Tab: ${tab.title}]\nURL: ${tab.url}\n\n${retryResult.content}`
              };
            }
          }
        } catch (injectErr) {
          // Injection also failed (e.g., chrome:// url)
        }

        // Secondary fallback: raw body innerText if content script injection fails
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
        } catch (_) {}
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
