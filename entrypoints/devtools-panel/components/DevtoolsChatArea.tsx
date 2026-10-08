import React, { useState, useRef, useEffect } from 'react';
import type { ChatMsg, Conversation, AIProviderType, OpenAIProvider } from '../../../utils/storage';
import { AppStorage } from '../../../utils/storage';
import type { DevToolsData } from '../types';
import iconUrl from '../../../assets/icon-alt.png';
import { SlashMenu } from '../../ask-page.content/components/SlashMenu';
import type { SlashMode, SlashOption } from '../../ask-page.content/types';
import { CopyPromptDropdown } from '../../../components/CopyPromptDropdown';
import { PasteResponseModal } from '../../../components/PasteResponseModal';
import type { ParsedAIAction } from '../../../utils/actionExecutor';

interface DevtoolsChatAreaProps {
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  startNewChat: () => void;
  historySearch: string;
  setHistorySearch: (search: string) => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  loadConversation: (conv: Conversation) => void;
  deleteConversation: (id: string) => void;
  loadConversations: () => void;
  messages: ChatMsg[];
  clearConversation: () => void;
  providerType: AIProviderType;
  setProviderType: (type: AIProviderType) => void;
  selectedOpenAIId: string;
  setSelectedOpenAIId: (id: string) => void;
  openaiProviders: OpenAIProvider[];
  ollamaModel: string;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  isStreaming: boolean;
  thinkingContent: string;
  thinkingExpanded: boolean;
  setThinkingExpanded: (expanded: boolean) => void;
  renderMarkdown: (text: string) => string;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  input: string;
  setInput: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  capturedData: DevToolsData | null;
  isCapturing: boolean;
  onCapture: () => void;
  abortStream: () => void;
  sendMessage: (customText?: string) => void;
  onRetry: () => void;
  onSelectWelcomePrompt: (promptText: string) => void;
  copyPasteUnlocked?: boolean;
  copyPasteUnlockCommand?: string;
  buildSystemPrompt?: () => Promise<string>;
  onExecutePasteAction?: (action: ParsedAIAction) => Promise<void> | void;
}

const WELCOME_PROMPTS = [
  'What network requests failed or are taking over 1s?',
  'Explain the recent console errors and how to fix them',
  'Analyze the selected DOM element ($0) and recommend optimizations',
  'Audit page load timing, paint metrics, and memory usage',
];

export const DevtoolsChatArea: React.FC<DevtoolsChatAreaProps> = ({
  showHistory,
  setShowHistory,
  startNewChat,
  historySearch,
  setHistorySearch,
  conversations,
  activeConversationId,
  loadConversation,
  deleteConversation,
  loadConversations,
  messages,
  clearConversation,
  providerType,
  setProviderType,
  selectedOpenAIId,
  setSelectedOpenAIId,
  openaiProviders,
  ollamaModel,
  messagesContainerRef,
  isStreaming,
  thinkingContent,
  thinkingExpanded,
  setThinkingExpanded,
  renderMarkdown,
  inputRef,
  input,
  setInput,
  handleKeyDown,
  capturedData,
  isCapturing,
  onCapture,
  abortStream,
  sendMessage,
  onRetry,
  onSelectWelcomePrompt,
  copyPasteUnlocked = false,
  copyPasteUnlockCommand = '/unlockMySecrets3038',
  buildSystemPrompt,
  onExecutePasteAction,
}) => {
  // Slash commands state (/model, /prompt)
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashMode, setSlashMode] = useState<SlashMode>('root');
  const [slashQuery, setSlashQuery] = useState('');
  const [slashIndex, setSlashIndex] = useState(0);
  const slashMenuRef = useRef<HTMLDivElement>(null);
  const [showPasteModal, setShowPasteModal] = useState(false);

  const getCurrentModelLabel = () => {
    if (providerType === 'chrome_ai') return 'Chrome AI (Built-in Nano)';
    if (providerType === 'ollama') return `Ollama (${ollamaModel || 'default'})`;
    const p = openaiProviders.find(x => x.id === selectedOpenAIId);
    return p ? `${p.name} (${p.model})` : 'OpenAI-compatible';
  };

  const getCurrentModelShort = () => {
    if (providerType === 'chrome_ai') return 'Chrome AI';
    if (providerType === 'ollama') return ollamaModel || 'Ollama';
    const p = openaiProviders.find(x => x.id === selectedOpenAIId);
    return p ? (p.name || p.model) : 'OpenAI';
  };

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
      const promptList = [
        { key: 'network', title: 'Network Errors', desc: 'What network requests failed or are taking over 1s?' },
        { key: 'console', title: 'Console Errors', desc: 'Explain the recent console errors and how to fix them' },
        { key: 'dom', title: 'Analyze DOM ($0)', desc: 'Analyze the selected DOM element ($0) and recommend optimizations' },
        { key: 'perf', title: 'Performance Audit', desc: 'Audit page load timing, paint metrics, and memory usage' },
      ];
      return promptList.filter(o => match(o.title) || match(o.desc));
    }

    // root
    const root: SlashOption[] = [
      { key: 'model', title: '/model', desc: 'Switch AI model', hint: getCurrentModelShort() },
      { key: 'prompt', title: '/prompt', desc: 'Insert DevTools prompt', hint: '4 prompts' },
    ];
    return root.filter(o => match(o.title) || match(o.desc));
  };

  const slashOptions = getSlashOptions();

  const closeSlash = () => {
    setSlashOpen(false);
    setSlashMode('root');
    setSlashQuery('');
    setSlashIndex(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const openSlash = (mode: SlashMode = 'root') => {
    setSlashMode(mode);
    setSlashQuery('');
    setSlashIndex(0);
    setSlashOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

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
      const newId = key.replace('openai:', '');
      setProviderType('openai');
      setSelectedOpenAIId(newId);
      AppStorage.set({ activeProvider: 'openai', activeOpenAIProviderId: newId }).catch(() => {});
    } else if (key === 'ollama' || key === 'chrome_ai') {
      setProviderType(key as AIProviderType);
      AppStorage.set({ activeProvider: key as AIProviderType }).catch(() => {});
    }
    replaceSlashToken('');
    closeSlash();
  };

  const selectPromptOption = (key: string) => {
    const promptMap: Record<string, string> = {
      network: 'What network requests failed or are taking over 1s?',
      console: 'Explain the recent console errors and how to fix them',
      dom: 'Analyze the selected DOM element ($0) and recommend optimizations',
      perf: 'Audit page load timing, paint metrics, and memory usage',
    };
    const text = promptMap[key] || '';
    if (text) {
      replaceSlashToken(text + ' ');
    }
    closeSlash();
  };

  const selectSlashOption = (opt: SlashOption) => {
    if (slashMode === 'root') {
      if (opt.key === 'model' || opt.key === 'prompt') {
        setSlashMode(opt.key as SlashMode);
        setSlashQuery('');
        setSlashIndex(0);
        return;
      }
    }
    if (slashMode === 'model') { selectModelOption(opt.key); return; }
    if (slashMode === 'prompt') { selectPromptOption(opt.key); return; }
  };

  const detectSlash = (value: string, cursorPos: number) => {
    const before = value.slice(0, cursorPos);
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
        setSlashMode('root');
        setSlashQuery(nextQ);
        setSlashOpen(true);
        setSlashIndex(0);
      } else if (nextQ !== slashQuery) {
        setSlashQuery(nextQ);
      }
    } else if (slashOpen && slashMode === 'root') {
      setSlashOpen(false);
      setSlashQuery('');
      setSlashIndex(0);
    }
  };

  // Keyboard navigation for slash commands and message sending
  const onTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      closeSlash();
      sendMessage();
      return;
    }

    handleKeyDown(e);
  };

  useEffect(() => {
    if (slashIndex >= slashOptions.length) setSlashIndex(0);
  }, [slashOptions.length]);

  useEffect(() => {
    if (!slashOpen) return;
    slashMenuRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [slashIndex, slashOpen]);

  // Global Escape key listener to close slash menu
  useEffect(() => {
    if (!slashOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (slashMode !== 'root') {
          setSlashMode('root');
          setSlashQuery('');
          setSlashIndex(0);
        } else {
          closeSlash();
        }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [slashOpen, slashMode]);

  return (
    <div
      className="devtools-chat-panel askpage-panel"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: 'var(--pbg)',
        color: 'var(--fg)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: 'none',
        height: '100%',
        borderRadius: 0,
        border: 'none',
        boxShadow: 'none',
      }}
    >
      {/* ─── History Drawer ─── */}
      {showHistory && (
        <div
          className="askpage-history-sidebar"
          style={{
            left: 0,
            right: 'auto',
            borderRight: '2px solid var(--bd)',
            borderLeft: 'none',
          }}
        >
          <div className="askpage-history-header">
            <h4>Chat History</h4>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="askpage-history-new" onClick={startNewChat}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New
              </button>
              <button className="askpage-history-close" onClick={() => setShowHistory(false)} title="Close">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <input
            className="askpage-history-search"
            placeholder="Search DevTools chats…"
            value={historySearch}
            onChange={e => setHistorySearch(e.target.value)}
          />
          <div className="askpage-history-list">
            {conversations
              .filter(c => !historySearch || c.title.toLowerCase().includes(historySearch.toLowerCase()))
              .map(conv => (
                <div
                  key={conv.id}
                  className={`askpage-history-item ${activeConversationId === conv.id ? 'active' : ''}`}
                >
                  <button className="askpage-history-item-main" onClick={() => loadConversation(conv)}>
                    <span className="askpage-history-item-title">{conv.title || 'Untitled'}</span>
                    <span className="askpage-history-item-date">
                      {new Date(conv.updatedAt || conv.createdAt).toLocaleDateString()}
                    </span>
                  </button>
                  <button
                    className="askpage-history-item-del"
                    onClick={e => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              ))}
            {conversations.length === 0 && (
              <div style={{ padding: '16px', fontSize: 13, color: 'var(--mute)', textAlign: 'center' }}>
                No saved chats yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Header matching Ask Page ─── */}
      <div
        className="askpage-header"
        style={{
          background: 'var(--pbg)',
          zIndex: 10,
          borderBottom: '1.5px solid var(--bd)',
          padding: '12px 24px',
          flexShrink: 0,
        }}
      >
        <div className="askpage-brand">
          <img
            src={iconUrl}
            alt="BrowserBot"
            className="askpage-logo"
            style={{ width: 22, height: 22, objectFit: 'contain' }}
          />
          <span className="askpage-header-title">
            <b>BrowserBot Debugger</b>
          </span>
        </div>

        <div className="askpage-acts">
          <button
            className={`askpage-header-btn ${showHistory ? 'active' : ''}`}
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory) loadConversations();
            }}
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
        </div>
      </div>

      {/* ─── Context Bar ─── */}
      {capturedData && (
        <div style={{ maxWidth: 840, width: '100%', margin: '0 auto', padding: '10px 24px 0', boxSizing: 'border-box' }}>
          <div className="askpage-ctx" style={{ margin: 0 }} title={`Target: ${capturedData.metadata?.url || 'DevTools Target'}`}>
            <svg className="askpage-fav" viewBox="0 0 24 24" fill="none" stroke="none">
              <rect x="2" y="2" width="20" height="20" rx="5" fill="currentColor" stroke="none" />
              <path d="M13 6l-5 7h4l-1 5 5-7h-4z" fill="#fff" stroke="none" />
            </svg>
            <b>{capturedData.metadata?.title || 'DevTools Inspect'}</b>
            <span>{capturedData.metadata?.framework || 'Web App'}</span>
          </div>
        </div>
      )}

      {/* ─── Messages list (Ruled Notebook Background) ─── */}
      <div className="askpage-messages" ref={messagesContainerRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 24px' }}>
        <div style={{ maxWidth: 840, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.length === 0 ? (
            <div className="askpage-welcome" style={{ width: '100%', boxSizing: 'border-box' }}>
              <img src={iconUrl} className="askpage-welcome-logo askpage-logo" alt="BrowserBot" />
              <h2>Hi, I'm BrowserBot Debugger</h2>
              <p>I have live access to your console logs, network requests, DOM elements, and performance metrics.</p>
              <span className="askpage-welcome-pick">
                try one of these
                <svg viewBox="0 0 40 30">
                  <path d="M4 4c14 0 26 6 28 20M32 24l-6-5M32 24l5-6" />
                </svg>
              </span>
              <div
                className="askpage-welcome-prompts"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '12px',
                  width: '100%',
                  marginTop: '10px',
                }}
              >
                {WELCOME_PROMPTS.map((promptText, idx) => (
                  <button
                    key={idx}
                    className="askpage-welcome-prompt-btn"
                    style={{ margin: 0, height: '100%', display: 'flex', alignItems: 'center' }}
                    onClick={() => onSelectWelcomePrompt(promptText)}
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isLastMessage = i === messages.length - 1;
              const isCurrentlyStreaming = isStreaming && isLastMessage && msg.role === 'assistant';
              const showLiveThinking = isCurrentlyStreaming && Boolean(thinkingContent);

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
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7.5v5M12 16h.01" />
                    </svg>
                    <div>
                      <b>Request Error</b>
                      <p>{msg.content}</p>
                      <button className="askpage-retry" onClick={onRetry}>
                        Retry
                      </button>
                    </div>
                  </div>
                );
              }

              // Assistant response
              const hasThinking = Boolean(showLiveThinking ? thinkingContent : msg.thinking);
              const hasContent = Boolean(msg.content && msg.content.trim());

              return (
                <div key={i} className="askpage-m ai">
                  <svg className="askpage-av" viewBox="0 0 24 24" fill="none" stroke="none">
                    <rect width="24" height="24" rx="7" fill="currentColor" stroke="none" />
                    <path
                      d="M6.5 9.5A2.5 2.5 0 0 1 9 7h6a2.5 2.5 0 0 1 2.5 2.5v3A2.5 2.5 0 0 1 15 15h-3l-3 2.5V15a2.5 2.5 0 0 1-2.5-2.5z"
                      fill="#fff"
                      stroke="none"
                    />
                    <circle cx="10" cy="11" r="1.1" fill="currentColor" stroke="none" />
                    <circle cx="14" cy="11" r="1.1" fill="currentColor" stroke="none" />
                  </svg>
                  <div className="askpage-ans">
                    {hasThinking && (
                      <details className="askpage-thinking-block" open={showLiveThinking ? thinkingExpanded : undefined}>
                        <summary
                          className="askpage-thinking-summary"
                          onClick={
                            showLiveThinking
                              ? e => {
                                  e.preventDefault();
                                  setThinkingExpanded(!thinkingExpanded);
                                }
                              : undefined
                          }
                        >
                          {showLiveThinking ? 'Thinking…' : 'Thinking process'}
                        </summary>
                        <div
                          className="askpage-thinking-content"
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdown((showLiveThinking ? thinkingContent : msg.thinking) as string),
                          }}
                        />
                      </details>
                    )}
                    {hasContent ? (
                      <div
                        className="askpage-b"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                    ) : isCurrentlyStreaming ? (
                      <div className="askpage-b askpage-dots">
                        <svg className="askpage-scr" viewBox="0 0 64 16">
                          <path pathLength={1} d="M2 8q5-12 10 0t10 0 10 0 10 0 10 0 10 0" />
                        </svg>
                        <span>Thinking…</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Footer Composer ─── */}
      <div
        className="askpage-footer"
        style={{
          background: 'var(--pbg)',
          borderTop: '1.5px solid var(--bd)',
          padding: '12px 24px 16px',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 840, width: '100%', margin: '0 auto' }}>
          <div className="askpage-cmp">
            <div className="askpage-context-pills" style={{ marginBottom: 4 }}>
              {capturedData && (
                <span className="askpage-pill active" title="DevTools Context Attached">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  DevTools Context
                </span>
              )}
              <span
                className="askpage-pill model"
                title={`Model: ${getCurrentModelLabel()} — type /model to switch`}
                onClick={() => openSlash('model')}
                style={{ cursor: 'pointer' }}
              >
                {getCurrentModelShort()}
              </span>
            </div>

            <textarea
              ref={inputRef}
              className="askpage-input"
              value={input}
              onChange={e => {
                setInput(e.target.value);
                detectSlash(e.target.value, e.target.selectionStart ?? e.target.value.length);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={onTextareaKeyDown}
              placeholder="Ask about this page or DevTools data… (type / for commands)"
              rows={1}
              disabled={isStreaming}
            />
            <div className="askpage-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  className={`askpage-att ${capturedData ? 'active' : ''}`}
                  onClick={onCapture}
                  title={capturedData ? 'Refresh captured DevTools context' : 'Capture DevTools context'}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                  <span>{isCapturing ? 'Capturing…' : capturedData ? 'Context Attached' : 'Capture Context'}</span>
                </button>

                {copyPasteUnlocked && (
                  <>
                    <CopyPromptDropdown
                      context={{
                        scope: 'devtools',
                        userPrompt: input,
                        buildDevtoolsSystemPrompt: buildSystemPrompt,
                        devtoolsContextData: capturedData ? JSON.stringify(capturedData, null, 2) : '',
                        historyMessages: messages,
                      }}
                    />
                    <button
                      type="button"
                      className="askpage-att"
                      onClick={() => setShowPasteModal(true)}
                      title="Paste AI Response"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                      </svg>
                      <span>Paste AI</span>
                    </button>
                  </>
                )}
              </div>

              {isStreaming ? (
                <button className="askpage-send" onClick={abortStream} title="Stop generation">
                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ fill: 'currentColor' }}>
                    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" style={{ fill: 'currentColor' }} />
                  </svg>
                </button>
              ) : (
                <button
                  className="askpage-send"
                  onClick={() => { closeSlash(); sendMessage(); }}
                  disabled={!input.trim()}
                  title="Send message"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                </button>
              )}
            </div>

            {slashOpen && (
              <SlashMenu
                menuRef={slashMenuRef}
                slashMode={slashMode}
                slashOptions={slashOptions}
                slashIndex={slashIndex}
                currentModelShort={getCurrentModelShort()}
                onSetSlashIndex={setSlashIndex}
                onBackToRoot={() => {
                  setSlashMode('root');
                  setSlashQuery('');
                  setSlashIndex(0);
                }}
                onSelectOption={selectSlashOption}
              />
            )}
          </div>
        </div>
      </div>

      {showPasteModal && onExecutePasteAction && (
        <PasteResponseModal
          open={showPasteModal}
          onClose={() => setShowPasteModal(false)}
          targetScope="auto"
          onExecuteAction={onExecutePasteAction}
        />
      )}
    </div>
  );
};
