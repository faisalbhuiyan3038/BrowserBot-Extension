import { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import { AppStorage, SystemPrompt, OpenAIProvider, AIProviderType } from '../../utils/storage';

interface AskPagePanelProps {
  pageTitle: string;
  pageUrl: string;
  onClose: () => void;
  onRegisterShow: (cb: () => void) => void;
}

interface ChatMsg {
  role: 'user' | 'assistant' | 'error';
  content: string;
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

  // Provider state
  const [providerType, setProviderType] = useState<AIProviderType>('openai');
  const [openaiProviders, setOpenaiProviders] = useState<OpenAIProvider[]>([]);
  const [selectedOpenAIId, setSelectedOpenAIId] = useState('');
  const [ollamaEndpoint, setOllamaEndpoint] = useState('');
  const [ollamaModel, setOllamaModel] = useState('');

  // Prompts
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [activePromptId, setActivePromptId] = useState('');

  // Tabs
  const [attachedTabs, setAttachedTabs] = useState<AttachedTab[]>([]);
  const [showTabPicker, setShowTabPicker] = useState(false);
  const [availableTabs, setAvailableTabs] = useState<any[]>([]);
  const [tabSearch, setTabSearch] = useState('');
  const [selectedPickerTabs, setSelectedPickerTabs] = useState<number[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamingContentRef = useRef('');
  const isResizingRef = useRef(false);

  // ─── Load storage state ─────────────────────────────
  useEffect(() => {
    AppStorage.get().then(state => {
      setProviderType(state.activeProvider);
      setOpenaiProviders(state.openaiProviders);
      setSelectedOpenAIId(state.activeOpenAIProviderId);
      setOllamaEndpoint(state.ollamaEndpoint);
      setOllamaModel(state.ollamaModel);
      setPrompts(state.askPagePrompts);
      setActivePromptId(state.activeAskPagePromptId);
      setPanelWidth(state.askPagePanelWidth || 420);
    });
  }, []);

  // ─── Register show callback for toggle ──────────────
  useEffect(() => {
    onRegisterShow(() => {
      setMinimized(false);
    });
  }, [onRegisterShow]);

  // ─── Listen for streaming chunks ────────────────────
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
      } else if (message.type === 'ASK_PAGE_CHAT_DONE') {
        setIsStreaming(false);
        streamingContentRef.current = '';
      } else if (message.type === 'ASK_PAGE_CHAT_ERROR') {
        setIsStreaming(false);
        streamingContentRef.current = '';
        setMessages(prev => [...prev, { role: 'error', content: message.error }]);
      }
    };

    browser.runtime.onMessage.addListener(listener);
    return () => browser.runtime.onMessage.removeListener(listener);
  }, []);

  // ─── Auto-scroll to bottom ──────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      // Save to storage
      AppStorage.get().then(state => {
        const currentWidth = Math.max(320, Math.min(800, startWidth + (startX - (window as any).__lastResizeX)));
        browser.runtime.sendMessage({ type: 'SAVE_PANEL_WIDTH', width: currentWidth });
      });
    };

    // Track final position for save
    const trackMove = (e: MouseEvent) => {
      (window as any).__lastResizeX = e.clientX;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousemove', trackMove);
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', trackMove);
      onMouseUp();
      // Clean save — use final panelWidth
      setTimeout(() => {
        const el = document.querySelector('[data-panel-width]');
        // Use state-based save instead
      }, 50);
    }, { once: true });
  }, [panelWidth]);

  // Save width when it changes due to resize
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
    if (!text || isStreaming) return;

    // Build system prompt
    const activePrompt = prompts.find(p => p.id === activePromptId) ?? prompts[0];
    let systemContent = activePrompt?.prompt || '';

    // Interpolate variables
    systemContent = systemContent
      .replaceAll('{pageTitle}', pageTitle)
      .replaceAll('{pageUrl}', pageUrl)
      .replaceAll('{pageContent}', '(Not yet extracted)')
      .replaceAll('{selectedText}', window.getSelection()?.toString() || '')
      .replaceAll('{tabContext}', attachedTabs.map(t => t.content).join('\n\n---\n\n'));

    // Build message history
    const chatMessages: { role: string; content: string }[] = [
      { role: 'system', content: systemContent },
    ];

    // Add tab context as a system-level message if tabs are attached
    if (attachedTabs.length > 0) {
      const tabContextContent = attachedTabs
        .map(t => `--- Context from tab: ${t.title} (${t.url}) ---\n${t.content}`)
        .join('\n\n');
      chatMessages.push({
        role: 'system',
        content: `Additional context from attached tabs:\n\n${tabContextContent}`
      });
    }

    // Add conversation history
    for (const msg of messages) {
      if (msg.role === 'error') continue;
      chatMessages.push({ role: msg.role, content: msg.content });
    }

    // Add user message
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

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // Send to background
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
    setAttachedTabs(prev => prev.filter(t => t.id !== tabId));
  };

  const filteredTabs = availableTabs.filter(t => {
    const q = tabSearch.toLowerCase();
    return !q || t.title.toLowerCase().includes(q) || t.url.toLowerCase().includes(q);
  });

  // ─── Render markdown safely ─────────────────────────
  const renderMarkdown = (content: string) => {
    if (!content) return '';
    try {
      return marked.parse(content) as string;
    } catch {
      return content;
    }
  };

  // ─── Abort streaming ────────────────────────────────
  const abortStream = () => {
    browser.runtime.sendMessage({ type: 'ASK_PAGE_CHAT_ABORT' });
    setIsStreaming(false);
    streamingContentRef.current = '';
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

      {/* Header */}
      <div className="askpage-header">
        <div className="askpage-header-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <span className="askpage-header-title">Ask Page</span>

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

      {/* Provider & Prompt Controls */}
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
      </div>

      {/* Prompt Chips */}
      <div className="askpage-prompt-chips">
        {prompts.map(p => (
          <button
            key={p.id}
            className={`askpage-prompt-chip ${activePromptId === p.id ? 'active' : ''}`}
            onClick={() => setActivePromptId(p.id)}
          >
            {p.name}
          </button>
        ))}
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
        </div>
      ) : (
        <div className="askpage-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`askpage-msg ${msg.role}`}
              {...(msg.role === 'assistant' ? {
                dangerouslySetInnerHTML: { __html: renderMarkdown(msg.content) || '<span style="opacity:0.3">Thinking…</span>' }
              } : {})}
            >
              {msg.role !== 'assistant' ? msg.content : undefined}
            </div>
          ))}
          {isStreaming && messages[messages.length - 1]?.content === '' && (
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
