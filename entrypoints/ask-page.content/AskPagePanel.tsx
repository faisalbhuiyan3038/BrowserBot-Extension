import { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import { AppStorage, SystemPrompt, OpenAIProvider, AIProviderType, ExtractionAlgorithm, Conversation, ChatMsg, generateId } from '../../utils/storage';
import { extractPageContent } from '../../utils/extractor';

// Hardcoded instruction always appended to Ask Page system prompts
const MARKDOWN_FORMAT_INSTRUCTION = '\n\nIMPORTANT: Always format your responses using markdown. Use headings, bullet points, code blocks, bold, italic, and other markdown features to make your responses well-structured and readable.';

interface AskPagePanelProps {
  pageTitle: string;
  pageUrl: string;
  onClose: () => void;
  onRegisterShow?: (cb: () => void) => void;
  isFullScreen?: boolean;
}

interface AttachedTab {
  id: number;
  title: string;
  url: string;
  content: string;
}

// Configure marked for safe rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function AskPagePanel({ pageTitle, pageUrl, onClose, onRegisterShow, isFullScreen = false }: AskPagePanelProps) {
  // ─── State ──────────────────────────────────────────
  const [closing, setClosing] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [panelWidth, setPanelWidth] = useState(420);
  const [persistChat, setPersistChat] = useState(false);
  const [currentTabAttached, setCurrentTabAttached] = useState(false);
  const [extractionAlgorithm, setExtractionAlgorithm] = useState<ExtractionAlgorithm>(1);

  // Provider state
  const [providerType, setProviderType] = useState<AIProviderType>('openai');
  const [openaiProviders, setOpenaiProviders] = useState<OpenAIProvider[]>([]);
  const [selectedOpenAIId, setSelectedOpenAIId] = useState('');
  const [ollamaModel, setOllamaModel] = useState('');

  // System prompt (always active) + Quick prompts
  const [systemPrompt, setSystemPrompt] = useState('');
  const [quickPrompts, setQuickPrompts] = useState<SystemPrompt[]>([]);

  // Thinking/reasoning
  const [thinkingContent, setThinkingContent] = useState('');
  const [thinkingExpanded, setThinkingExpanded] = useState(false);

  // Chat history
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [historySearch, setHistorySearch] = useState('');

  // Tabs
  const [attachedTabs, setAttachedTabs] = useState<AttachedTab[]>([]);
  const [showTabPicker, setShowTabPicker] = useState(false);
  const [availableTabs, setAvailableTabs] = useState<any[]>([]);
  const [tabSearch, setTabSearch] = useState('');
  const [selectedPickerTabs, setSelectedPickerTabs] = useState<number[]>([]);

  // ─── Slash-command menu (/model, /prompt, /page, /tab) ───
  type SlashMode = 'root' | 'model' | 'prompt' | 'tab';
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashMode, setSlashMode] = useState<SlashMode>('root');
  const [slashQuery, setSlashQuery] = useState('');
  const [slashIndex, setSlashIndex] = useState(0);
  const slashMenuRef = useRef<HTMLDivElement>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const streamingContentRef = useRef('');
  const streamingThinkingRef = useRef('');
  const isResizingRef = useRef(false);
  const userScrolledUpRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Mobile keyboard viewport adjustment ────────────
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      // Debounce slightly to prevent intermediate state glitches on Firefox Android
      timeoutId = setTimeout(() => {
        // Only apply the visual viewport constraint if it's significantly smaller
        // than the window height (indicating the keyboard is open).
        if (vv.height < window.innerHeight - 50) {
          setViewportHeight(vv.height);
        } else {
          setViewportHeight(null);
        }
      }, 50);
    };

    vv.addEventListener('resize', handleResize);
    // Removed 'scroll' listener: it caused severe re-render glitches on Firefox 
    // Android because typing triggers auto-scroll to the caret.
    return () => {
      clearTimeout(timeoutId);
      vv.removeEventListener('resize', handleResize);
    };
  }, []);

  // ─── Load storage state ─────────────────────────────
  useEffect(() => {
    AppStorage.get().then(state => {
      setProviderType(state.activeProvider);
      setOpenaiProviders(state.openaiProviders);
      setSelectedOpenAIId(state.activeOpenAIProviderId);
      setOllamaModel(state.ollamaModel);
      setSystemPrompt(state.askPageSystemPrompt);
      setQuickPrompts(state.askPagePrompts);
      setPanelWidth(state.askPagePanelWidth || 420);
      setPersistChat(state.askPagePersistChat || false);
      setExtractionAlgorithm(state.pageExtractionAlgorithm || 1);

      // Load persisted chat if enabled
      if (state.askPagePersistChat) {
        browser.runtime.sendMessage({ type: 'LOAD_CHAT' }).then((data: any) => {
          if (data && Array.isArray(data) && data.length > 0) {
            setMessages(data);
          }
        }).catch(() => {});
      }
    });

    // Listen for storage changes to sync settings instantly
    const handleStorageChange = (changes: any, area: string) => {
      if (area === 'local' && changes.appState?.newValue) {
        const state = changes.appState.newValue;
        setProviderType(state.activeProvider);
        setOpenaiProviders(state.openaiProviders);
        setSelectedOpenAIId(state.activeOpenAIProviderId);
        setOllamaModel(state.ollamaModel);
        setSystemPrompt(state.askPageSystemPrompt);
        setQuickPrompts(state.askPagePrompts);
        setPanelWidth(state.askPagePanelWidth || 420);
        setPersistChat(state.askPagePersistChat || false);
        setExtractionAlgorithm(state.pageExtractionAlgorithm || 1);
      }
    };
    browser.storage.onChanged.addListener(handleStorageChange);

    // Load conversation history
    loadConversations();

    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const loadConversations = () => {
    browser.runtime.sendMessage({ type: 'LOAD_CONVERSATIONS' }).then((data: any) => {
      if (Array.isArray(data)) setConversations(data);
    }).catch(() => {});
  };

  // ─── Persist chat to session storage (via background) ───
  useEffect(() => {
    if (persistChat && messages.length > 0 && !isStreaming) {
      browser.runtime.sendMessage({ type: 'SAVE_CHAT', messages }).catch(() => {});
    }
  }, [messages, persistChat, isStreaming]);

  // ─── Auto-save conversation with debounce ───────────
  useEffect(() => {
    if (messages.length === 0 || isStreaming) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveCurrentConversation();
    }, 1000);
  }, [messages, isStreaming]);

  const saveCurrentConversation = async () => {
    if (messages.length === 0) return;

    // Generate title from first user message
    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg?.content.slice(0, 80) || 'New Chat';

    const conversation: Conversation = {
      id: activeConversationId || generateId(),
      title,
      createdAt: activeConversationId ? (conversations.find(c => c.id === activeConversationId)?.createdAt || Date.now()) : Date.now(),
      updatedAt: Date.now(),
      pageUrl,
      pageTitle,
      messages: messages
    };

    if (!activeConversationId) {
      setActiveConversationId(conversation.id);
    }

    browser.runtime.sendMessage({ type: 'SAVE_CONVERSATION', conversation }).catch(() => {});
    // Refresh history
    loadConversations();
  };

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    window.dispatchEvent(new CustomEvent('browserbot-ask-page-state', { detail: { open: false } }));
    setTimeout(() => {
      onClose();
    }, 220);
  };

  // ─── Register toggle callback & announce mount ──────
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('browserbot-ask-page-state', { detail: { open: true } }));
  }, []);

  useEffect(() => {
    if (onRegisterShow) {
      onRegisterShow(() => {
        handleClose();
      });
    }
  }, [onRegisterShow, closing]);

  const sessionIdRef = useRef<string>('');
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = crypto.randomUUID();
    }
  }, []);

  // ─── Listen for streaming chunks + sync ─────────────
  useEffect(() => {
    const listener = (message: any) => {
      if (message.sessionId && message.sessionId !== sessionIdRef.current) return;
      
      if (message.type === 'ASK_PAGE_CHAT_CHUNK') {
        streamingContentRef.current += message.chunk;
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = { ...updated[lastIdx], content: streamingContentRef.current };
          }
          return updated;
        });
      } else if (message.type === 'ASK_PAGE_CHAT_THINKING') {
        streamingThinkingRef.current += message.chunk;
        setThinkingContent(streamingThinkingRef.current);
        setThinkingExpanded(true);
      } else if (message.type === 'ASK_PAGE_CHAT_DONE') {
        // Capture thinking before clearing refs (prevents race condition)
        const savedThinking = streamingThinkingRef.current;
        if (savedThinking) {
          setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
              updated[lastIdx] = { ...updated[lastIdx], thinking: savedThinking };
            }
            return updated;
          });
        }
        setIsStreaming(false);
        setThinkingExpanded(false);
        streamingContentRef.current = '';
        streamingThinkingRef.current = '';
        setThinkingContent('');
      } else if (message.type === 'ASK_PAGE_CHAT_ERROR') {
        setIsStreaming(false);
        streamingContentRef.current = '';
        streamingThinkingRef.current = '';
        setThinkingContent('');
        setMessages(prev => [...prev, { role: 'error', content: message.error }]);
      } else if (message.type === 'CHAT_UPDATED') {
        // Real-time sync from other tabs
        if (persistChat && message.messages && !isStreaming) {
          setMessages(message.messages);
        }
      }
    };

    browser.runtime.onMessage.addListener(listener);
    return () => browser.runtime.onMessage.removeListener(listener);
  }, [persistChat]);

  // ─── Smart auto-scroll (only if user is near bottom) ──
  const scrollToBottom = useCallback(() => {
    if (!userScrolledUpRef.current) {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinkingContent, scrollToBottom]);

  const handleMessagesScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    // User is "near bottom" if within 80px of the end
    const nearBottom = scrollHeight - scrollTop - Math.ceil(clientHeight) < 80;
    userScrolledUpRef.current = !nearBottom;
  }, []);

  // ─── Resize handling ────────────────────────────────
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    const startX = e.clientX;
    const startWidth = panelWidth;

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const delta = startX - e.clientX;
      const newWidth = Math.max(320, Math.min(800, startWidth + delta));
      setPanelWidth(newWidth);
    };

    const onMouseUp = () => {
      isResizingRef.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp, { once: true });
  }, [panelWidth]);

  // Save width when it changes
  const widthSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (widthSaveTimeoutRef.current) clearTimeout(widthSaveTimeoutRef.current);
    widthSaveTimeoutRef.current = setTimeout(() => {
      browser.runtime.sendMessage({ type: 'SAVE_PANEL_WIDTH', width: panelWidth });
    }, 300);
  }, [panelWidth]);

  // ─── Send message ───────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (isStreaming || !text) return;
    setSlashOpen(false);
    setSlashMode('root');
    setSlashQuery('');
    setSlashIndex(0);

    // Reset scroll tracking for new message
    userScrolledUpRef.current = false;

    // Build system prompt
    let sysContent = systemPrompt
      .replaceAll('{pageTitle}', pageTitle)
      .replaceAll('{pageUrl}', pageUrl)
      .replaceAll('{selectedText}', window.getSelection()?.toString() || '');

    // Extract page content ONLY if explicitly used in prompt
    if (sysContent.includes('{pageContent}')) {
      let pageContent = '(Could not extract page content)';
      try {
        const result = await extractPageContent(extractionAlgorithm);
        pageContent = result.content;
      } catch (_) { /* */ }
      sysContent = sysContent.replaceAll('{pageContent}', pageContent);
    }

    // Pass tab contexts via {tabContext} or append at the end
    const attachedTabsContext = getAllAttachedTabs().map(t => t.content).join('\n\n---\n\n');
    if (attachedTabsContext) {
      if (sysContent.includes('{tabContext}')) {
        sysContent = sysContent.replaceAll('{tabContext}', attachedTabsContext);
      } else {
        sysContent += '\n\nContext from attached tabs:\n' + attachedTabsContext;
      }
    } else {
      sysContent = sysContent.replaceAll('{tabContext}', ''); // clear if present but empty
    }

    // Always append markdown instruction
    sysContent += MARKDOWN_FORMAT_INSTRUCTION;

    // Build message history
    const chatMessages: { role: string; content: string }[] = [
      { role: 'system', content: sysContent },
    ];

    // Add tab context
    const allAttached = getAllAttachedTabs();
    if (allAttached.length > 0) {
      chatMessages.push({
        role: 'system',
        content: `Additional context from attached tabs:\n\n${allAttached.map(t => `--- Context from tab: ${t.title} (${t.url}) ---\n${t.content}`).join('\n\n')}`
      });
    }

    // Add conversation history
    for (const msg of messages) {
      if (msg.role === 'error') continue;
      chatMessages.push({ role: msg.role, content: msg.content });
    }

    chatMessages.push({ role: 'user', content: text });

    console.groupCollapsed('BrowserBot: Sending AI Prompt');
    console.log('Provider:', providerType);
    console.log('Extraction Algorithm (1=Text, 2=Optimized, 3=Full):', extractionAlgorithm);
    console.log('Complete Prompt Messages:', JSON.parse(JSON.stringify(chatMessages)));
    if (currentTabAttached) {
      console.log('Current Page Content Context Size:', currentTabContent.length);
      console.log('Current Page Content Snippet:', currentTabContent.substring(0, 500) + '...');
    }
    console.groupEnd();

    // Update UI
    setMessages(prev => [
      ...prev,
      { role: 'user', content: text },
      { role: 'assistant', content: '' }
    ]);
    setInput('');
    setIsStreaming(true);
    streamingContentRef.current = '';
    streamingThinkingRef.current = '';
    setThinkingContent('');

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    browser.runtime.sendMessage({
      type: 'ASK_PAGE_CHAT',
      messages: chatMessages,
      providerType,
      openaiProviderId: selectedOpenAIId,
      sessionId: sessionIdRef.current
    });
  };

  // ─── Auto-resize textarea + slash detection ─────
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setInput(next);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    detectSlash(next, ta.selectionStart ?? next.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (slashOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashIndex(prev => (slashOptions.length ? (prev + 1) % slashOptions.length : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashIndex(prev => (slashOptions.length ? (prev - 1 + slashOptions.length) % slashOptions.length : 0));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        if (slashOptions.length > 0) {
          e.preventDefault();
          selectSlashOption(slashOptions[Math.min(slashIndex, slashOptions.length - 1)]);
          return;
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (slashMode !== 'root') {
          setSlashMode('root');
          setSlashQuery('');
          setSlashIndex(0);
        } else {
          closeSlash();
        }
        return;
      }
      // Backspace on empty query in submenu → back to root
      if (e.key === 'Backspace' && slashMode !== 'root' && slashQuery === '') {
        e.preventDefault();
        setSlashMode('root');
        setSlashIndex(0);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    // "/" opens the menu immediately (before input event fires)
    if (e.key === '/' && !slashOpen) {
      requestAnimationFrame(() => {
        const ta = inputRef.current;
        if (ta) detectSlash(ta.value, ta.selectionStart ?? ta.value.length);
      });
    }
  };

  const stopPropagation = (e: React.UIEvent) => e.stopPropagation();

  // ─── Quick prompt selection ─────────────────────────
  const handleQuickPromptSelect = (id: string) => {
    if (!id) return;
    const prompt = quickPrompts.find(p => p.id === id);
    if (prompt) {
      setInput(prompt.prompt);
      // Focus and resize textarea
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.style.height = 'auto';
          inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
        }
      });
    }
  };

  // ─── Tab picker ─────────────────────────────────────
  const openTabPicker = async () => {
    const tabs = await browser.runtime.sendMessage({ type: 'GET_TAB_LIST' });
    setAvailableTabs(tabs || []);
    setSelectedPickerTabs([]);
    setTabSearch('');
    setShowTabPicker(true);
  };

  const confirmTabSelection = async () => {
    console.log('BrowserBot: confirmTabSelection triggered', { selectedPickerTabs, attachedTabs });
    for (const tabId of selectedPickerTabs) {
      console.log('BrowserBot: Processing tabId:', tabId);
      if (attachedTabs.some(t => t.id === tabId)) {
        console.log('BrowserBot: Tab already attached, skipping', tabId);
        continue;
      }
      try {
        console.log('BrowserBot: Sending GET_TAB_CONTENT for tabId', tabId);
        const result = await browser.runtime.sendMessage({ type: 'GET_TAB_CONTENT', tabId });
        console.log('BrowserBot: Received response for GET_TAB_CONTENT', tabId, { result });
        if (result) {
          setAttachedTabs(prev => {
            const newAttached = [...prev, {
              id: result.tabId,
              title: result.title,
              url: result.url,
              content: result.content
            }];
            console.log('BrowserBot: Updated attachedTabs state', newAttached);
            return newAttached;
          });
        }
      } catch (err) {
        console.error('BrowserBot: Error getting tab content for tabId', tabId, err);
      }
    }
    console.log('BrowserBot: Closing tab picker');
    setShowTabPicker(false);
  };

  const removeTab = (tabId: number) => {
    if (tabId === -1) {
      setCurrentTabAttached(false);
    } else {
      setAttachedTabs(prev => prev.filter(t => t.id !== tabId));
    }
  };

  const toggleCurrentTab = () => setCurrentTabAttached(prev => !prev);

  const getAllAttachedTabs = (): AttachedTab[] => {
    const tabs = [...attachedTabs];
    if (currentTabAttached) {
      tabs.unshift({
        id: -1,
        title: pageTitle,
        url: pageUrl,
        content: currentTabContent || `[Current Page: ${pageTitle}]\nURL: ${pageUrl}`
      });
    }
    return tabs;
  };

  // Extract current tab content when attached
  const [currentTabContent, setCurrentTabContent] = useState<string>('');
  useEffect(() => {
    if (currentTabAttached) {
      extractPageContent(extractionAlgorithm).then(result => {
        setCurrentTabContent(`[Current Page: ${pageTitle}]\nURL: ${pageUrl}\n\n${result.content}`);
      }).catch(() => {
        setCurrentTabContent(`[Current Page: ${pageTitle}]\nURL: ${pageUrl}\n\n(Extraction failed)`);
      });
    } else {
      setCurrentTabContent('');
    }
  }, [currentTabAttached, extractionAlgorithm, pageTitle, pageUrl]);

  const attachedTabIds = new Set(attachedTabs.map(t => t.id));
  const filteredTabs = availableTabs.filter(t => {
    if (attachedTabIds.has(t.id)) return false;
    const q = tabSearch.toLowerCase();
    return !q || t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q);
  });

  // ─── Slash menu helpers ───────────────────────────
  const getDomain = (url: string) => {
    try { return new URL(url).hostname; } catch { return url; }
  };

  const getCurrentModelLabel = () => {
    if (providerType === 'openai') {
      const p = openaiProviders.find(pr => pr.id === selectedOpenAIId);
      return p ? `${p.name} (${p.model})` : 'Select model';
    }
    if (providerType === 'ollama') return `Ollama (${ollamaModel || 'default'})`;
    return 'Chrome AI';
  };

  const getCurrentModelShort = () => {
    if (providerType === 'openai') {
      const p = openaiProviders.find(pr => pr.id === selectedOpenAIId);
      return p ? p.model : 'openai';
    }
    if (providerType === 'ollama') return ollamaModel || 'ollama';
    return 'chrome-ai';
  };

  interface SlashOption {
    key: string;
    title: string;
    desc: string;
    hint?: string;
    active?: boolean;
  }

  const getSlashOptions = (): SlashOption[] => {
    const q = slashQuery.toLowerCase();
    const match = (s: string) => !q || s.toLowerCase().includes(q);

    if (slashMode === 'model') {
      const opts: SlashOption[] = [
        ...openaiProviders.map(p => ({
          key: `openai:${p.id}`,
          title: p.name,
          desc: p.model,
          hint: 'OpenAI-compatible',
          active: providerType === 'openai' && selectedOpenAIId === p.id,
        })),
        {
          key: 'ollama',
          title: 'Ollama',
          desc: ollamaModel || 'local model',
          hint: 'Local',
          active: providerType === 'ollama',
        },
        {
          key: 'chrome_ai',
          title: 'Chrome AI',
          desc: 'Built-in Gemini Nano',
          hint: 'On-device',
          active: providerType === 'chrome_ai',
        },
      ];
      return opts.filter(o => match(o.title) || match(o.desc));
    }

    if (slashMode === 'prompt') {
      return quickPrompts
        .filter(p => match(p.name) || match(p.prompt))
        .map(p => ({
          key: p.id,
          title: p.name,
          desc: p.prompt.slice(0, 80) + (p.prompt.length > 80 ? '…' : ''),
        }));
    }

    if (slashMode === 'tab') {
      return availableTabs
        .filter(t => !attachedTabIds.has(t.id))
        .filter(t => !q || t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q))
        .slice(0, 20)
        .map(t => ({
          key: String(t.id),
          title: t.title?.slice(0, 60) || 'Untitled',
          desc: getDomain(t.url || ''),
        }));
    }

    // root
    const root: SlashOption[] = [
      { key: 'model', title: '/model', desc: 'Switch AI model', hint: getCurrentModelShort() },
      { key: 'prompt', title: '/prompt', desc: 'Insert a quick prompt', hint: `${quickPrompts.length}` },
      {
        key: 'page',
        title: '/page',
        desc: currentTabAttached ? 'Remove This Page from context' : 'Add This Page to context',
        hint: currentTabAttached ? 'attached ✓' : 'page',
      },
      { key: 'tab', title: '/tab', desc: 'Attach another open tab', hint: attachedTabs.length ? `${attachedTabs.length} attached` : 'tabs' },
    ];
    return root.filter(o => match(o.title) || match(o.desc));
  };

  const slashOptions = getSlashOptions();

  const closeSlash = () => {
    setSlashOpen(false);
    setSlashMode('root');
    setSlashQuery('');
    setSlashIndex(0);
  };

  const openSlash = (mode: SlashMode = 'root') => {
    setSlashMode(mode);
    setSlashQuery('');
    setSlashIndex(0);
    setSlashOpen(true);
    if (mode === 'tab') {
      browser.runtime.sendMessage({ type: 'GET_TAB_LIST' }).then((tabs: any) => {
        setAvailableTabs(tabs || []);
      }).catch(() => {});
    }
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // Remove the "/query" token before the cursor, optionally replacing with text
  const replaceSlashToken = (replacement: string) => {
    const ta = inputRef.current;
    const cursor = ta?.selectionStart ?? input.length;
    const before = input.slice(0, cursor);
    const after = input.slice(cursor);
    const m = /(^|\s)\/(\w*)$/.exec(before);
    let next: string;
    if (m) {
      const tokenStart = m.index + m[1].length;
      next = before.slice(0, tokenStart) + replacement + after;
    } else {
      next = replacement + input;
    }
    setInput(next);
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const pos = m ? (m.index + m[1].length + replacement.length) : replacement.length;
        try { inputRef.current.setSelectionRange(pos, pos); } catch {}
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
      }
    });
  };

  const selectModelOption = (key: string) => {
    if (key.startsWith('openai:')) {
      setProviderType('openai');
      setSelectedOpenAIId(key.replace('openai:', ''));
    } else if (key === 'ollama' || key === 'chrome_ai') {
      setProviderType(key as AIProviderType);
    }
    replaceSlashToken('');
    closeSlash();
  };

  const selectPromptOption = (id: string) => {
    const prompt = quickPrompts.find(p => p.id === id);
    if (!prompt) return;
    replaceSlashToken(prompt.prompt + ' ');
    closeSlash();
  };

  const attachTabById = async (tabId: number) => {
    if (attachedTabs.some(t => t.id === tabId)) return;
    try {
      const result = await browser.runtime.sendMessage({ type: 'GET_TAB_CONTENT', tabId });
      if (result) {
        setAttachedTabs(prev => [...prev, {
          id: result.tabId,
          title: result.title,
          url: result.url,
          content: result.content
        }]);
      }
    } catch {}
  };

  const selectTabOption = async (key: string) => {
    const tabId = Number(key);
    if (!Number.isNaN(tabId)) await attachTabById(tabId);
    replaceSlashToken('');
    closeSlash();
  };

  const selectSlashOption = (opt: SlashOption) => {
    if (slashMode === 'root') {
      if (opt.key === 'model' || opt.key === 'prompt' || opt.key === 'tab') {
        setSlashMode(opt.key as SlashMode);
        setSlashQuery('');
        setSlashIndex(0);
        if (opt.key === 'tab') {
          browser.runtime.sendMessage({ type: 'GET_TAB_LIST' }).then((tabs: any) => {
            setAvailableTabs(tabs || []);
          }).catch(() => {});
        }
        return;
      }
      if (opt.key === 'page') {
        toggleCurrentTab();
        replaceSlashToken('');
        closeSlash();
        return;
      }
    }
    if (slashMode === 'model') { selectModelOption(opt.key); return; }
    if (slashMode === 'prompt') { selectPromptOption(opt.key); return; }
    if (slashMode === 'tab') { void selectTabOption(opt.key); return; }
  };

  const detectSlash = (value: string, cursorPos: number) => {
    const before = value.slice(0, cursorPos);
    // In a submenu the "/" token was already consumed by selection, so filter
    // by the trailing word (with or without a leading slash).
    if (slashOpen && slashMode !== 'root') {
      const mSub = /(?:^|\s)\/?(\w*)$/.exec(before);
      const nextQ = mSub ? (mSub[1] || '') : '';
      if (nextQ !== slashQuery) setSlashQuery(nextQ);
      return;
    }
    const m = /(^|\s)\/(\w*)$/.exec(before);
    if (m) {
      const nextQ = m[2] || '';
      if (!slashOpen) {
        // Fresh open only — index reset belongs here, not on every keystroke,
        // otherwise ArrowDown/Up navigation snaps back on the following keyup.
        setSlashMode('root');
        setSlashQuery(nextQ);
        setSlashOpen(true);
        setSlashIndex(0);
      } else if (nextQ !== slashQuery) {
        setSlashQuery(nextQ);
      }
    } else if (slashOpen && slashMode === 'root') {
      // Only auto-close root menu when slash token disappears.
      // Keep submenu open so keyboard still works after selecting /model etc.
      setSlashOpen(false);
      setSlashQuery('');
      setSlashIndex(0);
    }
  };

  // Reset slash index when the filter changes (NOT on navigation)
  useEffect(() => {
    setSlashIndex(0);
  }, [slashQuery, slashMode]);

  // Clamp highlight when options shrink (e.g. tab list loads) without
  // touching it otherwise, so ArrowUp/Down position is preserved.
  useEffect(() => {
    if (slashIndex >= slashOptions.length) setSlashIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slashOptions.length]);

  // Scroll active slash option into view
  useEffect(() => {
    if (!slashOpen) return;
    slashMenuRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [slashIndex, slashOpen]);

  // ─── Chat history ──────────────────────────────────
  const startNewChat = () => {
    setMessages([]);
    setActiveConversationId(null);
    streamingContentRef.current = '';
    setShowHistory(false);
    if (persistChat) {
      browser.runtime.sendMessage({ type: 'CLEAR_CHAT' }).catch(() => {});
    }
  };

  const loadConversation = (conv: Conversation) => {
    setMessages(conv.messages);
    setActiveConversationId(conv.id);
    setShowHistory(false);
  };

  const deleteConversation = async (id: string) => {
    await browser.runtime.sendMessage({ type: 'DELETE_CONVERSATION', id });
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      startNewChat();
    }
  };

  const filteredConversations = conversations.filter(c => {
    if (!historySearch) return true;
    const q = historySearch.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.pageTitle.toLowerCase().includes(q);
  });

  // ─── Clear current conversation ─────────────────────
  const clearConversation = () => {
    setMessages([]);
    setActiveConversationId(null);
    streamingContentRef.current = '';
    if (persistChat) {
      browser.runtime.sendMessage({ type: 'CLEAR_CHAT' }).catch(() => {});
    }
  };

  // ─── Render markdown safely ─────────────────────────
  const renderMarkdown = (content: string) => {
    if (!content) return '';
    try {
      let html = marked.parse(content) as string;
      html = html.replace(/<pre><code([^>]*)>/g, (_match, attrs) => {
        return `<div class="askpage-code-wrapper"><button class="askpage-copy-btn" onclick="(function(btn){var code=btn.parentElement.querySelector('code');navigator.clipboard.writeText(code.innerText).then(function(){btn.textContent='Copied!';setTimeout(function(){btn.textContent='Copy'},1500)});})(this)">Copy</button><pre><code${attrs}>`;
      });
      html = html.replace(/<\/code><\/pre>/g, '</code></pre></div>');
      return html;
    } catch {
      return content;
    }
  };

  // ─── Abort streaming ────────────────────────────────
  const abortStream = () => {
    browser.runtime.sendMessage({ type: 'ASK_PAGE_CHAT_ABORT' });
    setIsStreaming(false);
    streamingContentRef.current = '';
    streamingThinkingRef.current = '';
    setThinkingContent('');
  };

  // ─── Format date helper ─────────────────────────────
  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  // ─── Main panel ─────────────────────────────────────
  return (
    <div 
      ref={panelRef}
      className={`askpage-panel ${isFullScreen ? 'fullscreen' : ''} ${closing ? 'closing' : ''}`} 
      style={isFullScreen 
        ? { width: '100%', height: '100%', borderRadius: 0, border: 'none', right: 0, bottom: 0 } 
        : { 
            width: panelWidth,
            // On mobile, constrain panel height to the visual viewport so the
            // input stays visible when the on-screen keyboard opens
            ...(viewportHeight != null ? { height: viewportHeight + 'px', bottom: 'auto', top: (window.visualViewport?.offsetTop ?? 0) + 'px' } : {})
          }
      } 
      data-panel-width={panelWidth}
    >
      {/* Resize handle */}
      {!isFullScreen && (
        <div
          className={`askpage-resize-handle ${isResizingRef.current ? 'dragging' : ''}`}
          onMouseDown={handleResizeStart}
        />
      )}



      {/* History sidebar */}
      {showHistory && (
        <div className="askpage-history-sidebar">
          <div className="askpage-history-header">
            <h4>Chat History</h4>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="askpage-history-new" onClick={startNewChat}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                New
              </button>
              <button className="askpage-history-close" onClick={() => setShowHistory(false)} title="Close">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
          <input
            className="askpage-history-search"
            placeholder="Search conversations…"
            value={historySearch}
            onChange={e => setHistorySearch(e.target.value)}
          />
          <div className="askpage-history-list">
            {filteredConversations.map(conv => (
              <div
                key={conv.id}
                className={`askpage-history-item ${activeConversationId === conv.id ? 'active' : ''}`}
              >
                <button className="askpage-history-item-main" onClick={() => loadConversation(conv)}>
                  <div className="askpage-history-item-title">{conv.title}</div>
                  <div className="askpage-history-item-meta">
                    {formatDate(conv.updatedAt)} · {conv.messages.filter(m => m.role === 'user').length} msgs
                  </div>
                </button>
                <button
                  className="askpage-history-item-delete"
                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                  title="Delete"
                >×</button>
              </div>
            ))}
            {filteredConversations.length === 0 && (
              <div className="askpage-history-empty">
                {historySearch ? 'No matching conversations' : 'No conversations yet'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header — matches prototype: brand + minimal actions */}
      <div className="askpage-header">
        <div className="askpage-brand">
          <svg className="askpage-logo" viewBox="0 0 24 24" fill="none" stroke="none">
            <rect width="24" height="24" rx="7" fill="currentColor" stroke="none" />
            <path d="M6.5 9.5A2.5 2.5 0 0 1 9 7h6a2.5 2.5 0 0 1 2.5 2.5v3A2.5 2.5 0 0 1 15 15h-3l-3 2.5V15a2.5 2.5 0 0 1-2.5-2.5z" fill="#fff" stroke="none" />
            <circle cx="10" cy="11" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="14" cy="11" r="1.1" fill="currentColor" stroke="none" />
          </svg>
          <span className="askpage-header-title"><b>BrowserBot</b></span>
        </div>
        <div className="askpage-acts">
          <button
            className={`askpage-header-btn ${showHistory ? 'active' : ''}`}
            onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadConversations(); }}
            title="Chat History"
            aria-label="Chat history"
          >
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16h.01" /></svg>
          </button>
          {messages.length > 0 && (
            <button className="askpage-header-btn" onClick={clearConversation} title="New conversation" aria-label="New conversation">
              <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            </button>
          )}
          {!isFullScreen && (
            <button className="askpage-header-btn" onClick={handleClose} title="Close" aria-label="Close">
              <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* Context bar — matches prototype .ctx: favicon + title + domain */}
      <div className="askpage-ctx" title={`${pageTitle}\n${pageUrl}`}>
        <svg className="askpage-fav" viewBox="0 0 24 24" fill="none" stroke="none">
          <rect x="2" y="2" width="20" height="20" rx="5" fill="currentColor" stroke="none" />
          <path d="M13 6l-5 7h4l-1 5 5-7h-4z" fill="#fff" stroke="none" />
        </svg>
        <b>{pageTitle || 'This page'}</b>
        <span>{getDomain(pageUrl)}</span>
      </div>

      {/* Chat Messages — lined-paper area, matches prototype #v */}
      <div className="askpage-messages" ref={messagesContainerRef} onScroll={handleMessagesScroll}>
        {messages.length === 0 ? (
          <div className="askpage-welcome">
            <svg className="askpage-welcome-logo" viewBox="0 0 24 24" fill="none" stroke="none">
              <rect width="24" height="24" rx="7" fill="currentColor" stroke="none" />
              <path d="M6.5 9.5A2.5 2.5 0 0 1 9 7h6a2.5 2.5 0 0 1 2.5 2.5v3A2.5 2.5 0 0 1 15 15h-3l-3 2.5V15a2.5 2.5 0 0 1-2.5-2.5z" fill="#fff" stroke="none" />
              <circle cx="10" cy="11" r="1.1" fill="currentColor" stroke="none" />
              <circle cx="14" cy="11" r="1.1" fill="currentColor" stroke="none" />
            </svg>
            <h2>Hi, I'm BrowserBot</h2>
            <p>I can read this page and your selection. Ask me anything about it.</p>
            <span className="askpage-welcome-pick">
              try one of these
              <svg viewBox="0 0 40 30"><path d="M4 4c14 0 26 6 28 20M32 24l-6-5M32 24l5-6" /></svg>
            </span>
            <div className="askpage-welcome-prompts">
              {(quickPrompts.length > 0 ? quickPrompts.slice(0, 4).map(p => ({ id: p.id, label: p.name })) : [
                { id: 'summarize', label: 'Summarize this page' },
                { id: 'explain', label: 'Explain the highlighted text' },
                { id: 'extract', label: 'Extract the checklist' },
                { id: 'code', label: 'What does this code do?' },
              ]).map(item => (
                <button
                  key={item.id}
                  className="askpage-welcome-prompt-btn"
                  onClick={() => {
                    const found = quickPrompts.find(p => p.id === item.id);
                    if (found) handleQuickPromptSelect(found.id);
                    else { setInput(item.label); inputRef.current?.focus(); }
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isLastMessage = i === messages.length - 1;
              const isCurrentlyStreaming = isStreaming && isLastMessage && msg.role === 'assistant';
              const showLiveThinking = isCurrentlyStreaming && thinkingContent;

              if (msg.role === 'user') {
                return (
                  <div key={i} className="askpage-m user">
                    <div className="askpage-b">{msg.content}</div>
                  </div>
                );
              }

              if (msg.role === 'error') {
                return (
                  <div key={i} className="askpage-err" role="alert">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16h.01" /></svg>
                    <div>
                      <b>Couldn't read this page's content</b>
                      <p>{msg.content}</p>
                      <button className="askpage-retry" onClick={() => { const lastUser = [...messages].reverse().find(m => m.role === 'user'); if (lastUser) { setInput(lastUser.content); } }}>Retry</button>
                    </div>
                  </div>
                );
              }

              // assistant
              return (
                <div key={i} className="askpage-m ai">
                  <svg className="askpage-av" viewBox="0 0 24 24" fill="none" stroke="none">
                    <rect width="24" height="24" rx="7" fill="currentColor" stroke="none" />
                    <path d="M6.5 9.5A2.5 2.5 0 0 1 9 7h6a2.5 2.5 0 0 1 2.5 2.5v3A2.5 2.5 0 0 1 15 15h-3l-3 2.5V15a2.5 2.5 0 0 1-2.5-2.5z" fill="#fff" stroke="none" />
                    <circle cx="10" cy="11" r="1.1" fill="currentColor" stroke="none" />
                    <circle cx="14" cy="11" r="1.1" fill="currentColor" stroke="none" />
                  </svg>
                  <div className="askpage-ans">
                    {(msg.thinking || showLiveThinking) && (
                      <details className="askpage-thinking-block" open={showLiveThinking ? thinkingExpanded : undefined}>
                        <summary
                          className="askpage-thinking-summary"
                          onClick={showLiveThinking ? (e) => { e.preventDefault(); setThinkingExpanded(!thinkingExpanded); } : undefined}
                        >
                          {showLiveThinking ? 'Thinking…' : 'Thinking process'}
                        </summary>
                        <div
                          className="askpage-thinking-content"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown((showLiveThinking ? thinkingContent : msg.thinking) as string) }}
                        />
                      </details>
                    )}
                    <div
                      className="askpage-b"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) || '<span style="opacity:0.3">Thinking…</span>' }}
                    />
                  </div>
                </div>
              );
            })}

            {isStreaming && !thinkingContent && messages[messages.length - 1]?.content === '' && (
              <div className="askpage-m ai">
                <svg className="askpage-av" viewBox="0 0 24 24" fill="none" stroke="none">
                  <rect width="24" height="24" rx="7" fill="currentColor" stroke="none" />
                  <path d="M6.5 9.5A2.5 2.5 0 0 1 9 7h6a2.5 2.5 0 0 1 2.5 2.5v3A2.5 2.5 0 0 1 15 15h-3l-3 2.5V15a2.5 2.5 0 0 1-2.5-2.5z" fill="#fff" stroke="none" />
                  <circle cx="10" cy="11" r="1.1" fill="currentColor" stroke="none" />
                  <circle cx="14" cy="11" r="1.1" fill="currentColor" stroke="none" />
                </svg>
                <div className="askpage-ans">
                  <div className="askpage-b askpage-dots">
                    <svg className="askpage-scr" viewBox="0 0 64 16"><path pathLength={1} d="M2 8q5-12 10 0t10 0 10 0 10 0 10 0 10 0" /></svg>
                    <span>Skimming the page…</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Composer — matches prototype footer .cmp */}
      <div className="askpage-footer" onKeyDown={stopPropagation} onKeyUp={stopPropagation} onKeyPress={stopPropagation}>
        <div className="askpage-cmp">
          {(currentTabAttached || attachedTabs.length > 0) && (
            <div className="askpage-context-pills">
              {currentTabAttached && (
                <span className="askpage-pill active" title={pageUrl}>
                  <svg viewBox="0 0 24 24"><path d="M20 11.5l-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.7 17.2a1.7 1.7 0 0 1-2.4-2.4L15 7" /></svg>
                  This Page
                  <button onClick={() => setCurrentTabAttached(false)} aria-label="Remove this page">×</button>
                </span>
              )}
              {attachedTabs.map(tab => (
                <span key={tab.id} className="askpage-pill" title={tab.url}>
                  {tab.title.slice(0, 24)}{tab.title.length > 24 ? '…' : ''}
                  <button onClick={() => removeTab(tab.id)} aria-label="Remove tab">×</button>
                </span>
              ))}
              <span className="askpage-pill model" title={`Model: ${getCurrentModelLabel()} — type /model to switch`} onClick={() => openSlash('model')}>
                {getCurrentModelShort()}
              </span>
            </div>
          )}
          <textarea
            ref={inputRef}
            className="askpage-input"
            style={{ resize: 'none' }}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onClick={() => {
              const ta = inputRef.current;
              if (ta) detectSlash(ta.value, ta.selectionStart ?? ta.value.length);
            }}
            onKeyUp={e => {
              // Navigation/selection keys must not re-run slash detection:
              // keydown already moved the highlight and a detectSlash() here
              // would reset slashIndex back to 0 (snap-back bug).
              if (['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape'].includes(e.key)) return;
              const ta = e.currentTarget;
              detectSlash(ta.value, ta.selectionStart ?? ta.value.length);
            }}
            onFocus={() => {
              setTimeout(() => {
                inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }, 300);
            }}
            placeholder="Ask about this page…"
            rows={1}
            disabled={isStreaming}
            aria-label="Message BrowserBot"
          />
          <div className="askpage-row">
            <button
              className={`askpage-att ${currentTabAttached ? 'active' : ''}`}
              onClick={() => {
                // Prototype behavior: toggle page context; slash menu also available via "/"
                if (!currentTabAttached && attachedTabs.length === 0 && !input.includes('/')) {
                  openSlash('root');
                  return;
                }
                toggleCurrentTab();
              }}
              title={currentTabAttached ? 'Page attached — click to remove (or type / for more options)' : 'Attach page context (or type / for models, prompts, tabs)'}
            >
              <svg viewBox="0 0 24 24"><path d="M20 11.5l-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.7 17.2a1.7 1.7 0 0 1-2.4-2.4L15 7" /></svg>
              Page + selection
            </button>
            {isStreaming ? (
              <button className="askpage-send" onClick={abortStream} title="Stop" aria-label="Stop">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="5" y="5" width="14" height="14" rx="2" stroke="none" /></svg>
              </button>
            ) : (
              <button
                className="askpage-send"
                onClick={() => { closeSlash(); sendMessage(); }}
                disabled={!input.trim()}
                title="Send"
                aria-label="Send"
              >
                <svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
              </button>
            )}
          </div>

          {slashOpen && (
            <div className="askpage-slash" ref={slashMenuRef} role="listbox" aria-label="Commands">
              <div className="askpage-slash-head">
                {slashMode === 'root' ? 'Commands — type to filter, ↑↓ + Enter' : (
                  <button className="askpage-slash-back" onClick={() => { setSlashMode('root'); setSlashQuery(''); setSlashIndex(0); }}>
                    ← {slashMode}
                  </button>
                )}
                <span className="askpage-slash-model">{getCurrentModelShort()}</span>
              </div>
              {slashOptions.length === 0 && (
                <div className="askpage-slash-empty">No matches — Esc to close</div>
              )}
              {slashOptions.map((opt, idx) => (
                <button
                  key={opt.key}
                  role="option"
                  aria-selected={idx === slashIndex}
                  data-active={idx === slashIndex}
                  className={`askpage-slash-item ${idx === slashIndex ? 'active' : ''}`}
                  onMouseEnter={() => setSlashIndex(idx)}
                  onClick={() => selectSlashOption(opt)}
                >
                  <span className="askpage-slash-title">{opt.title}{opt.active ? ' ✓' : ''}</span>
                  <span className="askpage-slash-desc">{opt.desc}</span>
                  {opt.hint && <span className="askpage-slash-hint">{opt.hint}</span>}
                </button>
              ))}
              <div className="askpage-slash-foot">/model · /prompt · /page · /tab — Esc to close</div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Picker Modal */}
      {showTabPicker && (
        <div className="askpage-tab-picker-overlay" onClick={() => setShowTabPicker(false)}>
          <div className="askpage-tab-picker" onClick={e => e.stopPropagation()}>
            <h4>Add Tab Context</h4>
            <input
              className="askpage-tab-picker-search"
              placeholder="Search tabs…"
              value={tabSearch}
              onChange={e => setTabSearch(e.target.value)}
              autoFocus
            />
            <div className="askpage-tab-picker-list">
              {filteredTabs.map(tab => (
                <button
                  key={tab.id}
                  className={`askpage-tab-picker-item ${selectedPickerTabs.includes(tab.id) ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedPickerTabs(prev =>
                      prev.includes(tab.id)
                        ? prev.filter(id => id !== tab.id)
                        : [...prev, tab.id]
                    );
                  }}
                >
                  {tab.favIconUrl && (
                    <img className="askpage-tab-picker-favicon" src={tab.favIconUrl} alt="" />
                  )}
                  <div className="askpage-tab-picker-info">
                    <div className="askpage-tab-picker-title">{tab.title}</div>
                    <div className="askpage-tab-picker-url">{tab.url}</div>
                  </div>
                </button>
              ))}
              {filteredTabs.length === 0 && (
                <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                  No tabs found
                </div>
              )}
            </div>
            <div className="askpage-tab-picker-actions">
              <button className="askpage-tab-picker-btn cancel" onClick={() => setShowTabPicker(false)}>Cancel</button>
              <button
                className="askpage-tab-picker-btn confirm"
                onClick={confirmTabSelection}
                disabled={selectedPickerTabs.length === 0}
              >
                Add {selectedPickerTabs.length > 0 ? `(${selectedPickerTabs.length})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
