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
  onRegisterShow: (cb: () => void) => void;
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

export default function AskPagePanel({ pageTitle, pageUrl, onClose, onRegisterShow }: AskPagePanelProps) {
  // ─── State ──────────────────────────────────────────
  const [minimized, setMinimized] = useState(false);
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

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamingContentRef = useRef('');
  const streamingThinkingRef = useRef('');
  const isResizingRef = useRef(false);
  const userScrolledUpRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    // Load conversation history
    loadConversations();
  }, []);

  const loadConversations = () => {
    browser.runtime.sendMessage({ type: 'LOAD_CONVERSATIONS' }).then((data: any) => {
      if (Array.isArray(data)) setConversations(data);
    }).catch(() => {});
  };

  // ─── Persist chat to session storage (via background) ───
  useEffect(() => {
    if (persistChat && messages.length > 0) {
      browser.runtime.sendMessage({ type: 'SAVE_CHAT', messages }).catch(() => {});
    }
  }, [messages, persistChat]);

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

  // ─── Register show callback for toggle ──────────────
  useEffect(() => {
    onRegisterShow(() => {
      setMinimized(false);
    });
  }, [onRegisterShow]);

  // ─── Listen for streaming chunks + sync ─────────────
  useEffect(() => {
    const listener = (message: any) => {
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
        if (persistChat && message.messages) {
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
      openaiProviderId: selectedOpenAIId
    });
  };

  // ─── Auto-resize textarea ──────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
    for (const tabId of selectedPickerTabs) {
      if (attachedTabs.some(t => t.id === tabId)) continue;
      const result = await browser.runtime.sendMessage({ type: 'GET_TAB_CONTENT', tabId });
      if (result) {
        setAttachedTabs(prev => [...prev, {
          id: result.tabId,
          title: result.title,
          url: result.url,
          content: result.content
        }]);
      }
    }
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

  // ─── Minimized state ───────────────────────────────
  if (minimized) {
    return (
      <button
        className="askpage-minimized-tab"
        onClick={() => setMinimized(false)}
        title="Open Ask Page"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    );
  }

  // ─── Main panel ─────────────────────────────────────
  return (
    <div className="askpage-panel" style={{ width: panelWidth }} data-panel-width={panelWidth}>
      {/* Resize handle */}
      <div
        className={`askpage-resize-handle ${isResizingRef.current ? 'dragging' : ''}`}
        onMouseDown={handleResizeStart}
      />



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

      {/* Header */}
      <div className="askpage-header">
        <button
          className={`askpage-header-btn askpage-history-btn ${showHistory ? 'active' : ''}`}
          onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadConversations(); }}
          title="Chat History"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </button>
        <div className="askpage-header-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <span className="askpage-header-title">Ask Page</span>

        {messages.length > 0 && (
          <button className="askpage-header-btn" onClick={clearConversation} title="New conversation">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        )}
        <button className="askpage-header-btn" onClick={() => setMinimized(true)} title="Minimize">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14"/>
          </svg>
        </button>
        <button className="askpage-header-btn" onClick={onClose} title="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Provider & Quick Prompt Controls */}
      <div className="askpage-controls">
        <select
          className="askpage-select"
          value={providerType === 'openai' ? `openai:${selectedOpenAIId}` : providerType}
          onChange={e => {
            const val = e.target.value;
            if (val.startsWith('openai:')) {
              setProviderType('openai');
              setSelectedOpenAIId(val.replace('openai:', ''));
            } else {
              setProviderType(val as AIProviderType);
            }
          }}
          title="AI Provider"
        >
          {openaiProviders.map(p => (
            <option key={p.id} value={`openai:${p.id}`}>{p.name} ({p.model})</option>
          ))}
          <option value="ollama">Ollama ({ollamaModel})</option>
          <option value="chrome_ai">Chrome AI</option>
        </select>

        {quickPrompts.length > 0 && (
          <select
            className="askpage-select askpage-quick-prompt-select"
            value=""
            onChange={e => handleQuickPromptSelect(e.target.value)}
            title="Quick Prompts"
          >
            <option value="" disabled>Quick Prompts…</option>
            {quickPrompts.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Chat Messages */}
      {messages.length === 0 ? (
        <div className="askpage-welcome">
          <div className="askpage-welcome-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3>Ask about this page</h3>
          <p>Ask questions, get summaries, or explore the content of the current page with AI.</p>
          {quickPrompts.length > 0 && (
            <div className="askpage-welcome-prompts">
              {quickPrompts.slice(0, 4).map(p => (
                <button key={p.id} className="askpage-welcome-prompt-btn" onClick={() => handleQuickPromptSelect(p.id)}>
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="askpage-messages" ref={messagesContainerRef} onScroll={handleMessagesScroll}>
          {messages.map((msg, i) => (
            <div key={i}>
              {/* Show thinking block for assistant messages */}
              {msg.role === 'assistant' && msg.thinking && (
                <details className="askpage-thinking-block">
                  <summary className="askpage-thinking-summary">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
                      <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                    Thinking process
                  </summary>
                  <div className="askpage-thinking-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.thinking) }} />
                </details>
              )}
              <div
                className={`askpage-msg ${msg.role}`}
                {...(msg.role === 'assistant' ? {
                  dangerouslySetInnerHTML: { __html: renderMarkdown(msg.content) || '<span style="opacity:0.3">Thinking…</span>' }
                } : {})}
              >
                {msg.role !== 'assistant' ? msg.content : undefined}
              </div>
            </div>
          ))}

          {/* Live thinking display during streaming */}
          {isStreaming && thinkingContent && (
            <details className="askpage-thinking-block" open={thinkingExpanded}>
              <summary className="askpage-thinking-summary" onClick={(e) => { e.preventDefault(); setThinkingExpanded(!thinkingExpanded); }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="askpage-thinking-spinner">
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
                </svg>
                Thinking…
              </summary>
              <div className="askpage-thinking-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(thinkingContent) }} />
            </details>
          )}

          {isStreaming && !thinkingContent && messages[messages.length - 1]?.content === '' && (
            <div className="askpage-typing">
              <div className="askpage-typing-dot" />
              <div className="askpage-typing-dot" />
              <div className="askpage-typing-dot" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Tab Context Bar */}
      <div className="askpage-tabs-bar">
        <span className="askpage-tabs-label">Context</span>
        <button
          className={`askpage-current-tab-chip ${currentTabAttached ? 'active' : ''}`}
          onClick={toggleCurrentTab}
          title={currentTabAttached ? 'Remove current page context' : 'Add current page as context'}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
          </svg>
          This Page
          {currentTabAttached && <span className="askpage-tab-chip-check">✓</span>}
        </button>
        {attachedTabs.map(tab => (
          <div key={tab.id} className="askpage-tab-chip">
            <span className="askpage-tab-chip-title">{tab.title}</span>
            <button className="askpage-tab-chip-close" onClick={() => removeTab(tab.id)}>×</button>
          </div>
        ))}
        <button className="askpage-add-tab-btn" onClick={openTabPicker}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add Tab
        </button>
      </div>

      {/* Input Area */}
      <div className="askpage-input-area">
        <textarea
          ref={inputRef}
          className="askpage-input"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this page…"
          rows={1}
          disabled={isStreaming}
        />
        {isStreaming ? (
          <button className="askpage-send-btn" onClick={abortStream} title="Stop">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          </button>
        ) : (
          <button
            className="askpage-send-btn"
            onClick={sendMessage}
            disabled={!input.trim()}
            title="Send"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        )}
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
