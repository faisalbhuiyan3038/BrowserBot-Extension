import React from 'react';
import type { ChatMsg, Conversation, AIProviderType, OpenAIProvider } from '../../../utils/storage';
import type { DevToolsData } from '../types';

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
}) => {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: 'var(--pbg)',
        color: 'var(--fg)',
        overflow: 'hidden',
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
                    <div className="askpage-history-item-title">{conv.title.replace('[DevTools] ', '')}</div>
                    <div className="askpage-history-item-meta">
                      {new Date(conv.updatedAt).toLocaleDateString()} ·{' '}
                      {conv.messages.filter(m => m.role === 'user').length} msgs
                    </div>
                  </button>
                  <button
                    className="askpage-history-item-delete"
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
            {conversations.length === 0 && <div className="askpage-history-empty">No DevTools chats yet</div>}
          </div>
        </div>
      )}

      {/* ─── Header ─── */}
      <div
        className="askpage-header"
        style={{
          borderBottom: '1.5px solid var(--bd)',
          padding: '10px 14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className={`askpage-header-btn ${showHistory ? 'active' : ''}`}
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory) loadConversations();
            }}
            title="Chat History"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
          <div className="askpage-brand">
            <svg className="askpage-logo" viewBox="0 0 24 24" fill="none" stroke="none">
              <rect width="24" height="24" rx="7" fill="currentColor" stroke="none" />
              <path
                d="M6.5 9.5A2.5 2.5 0 0 1 9 7h6a2.5 2.5 0 0 1 2.5 2.5v3A2.5 2.5 0 0 1 15 15h-3l-3 2.5V15a2.5 2.5 0 0 1-2.5-2.5z"
                fill="#fff"
                stroke="none"
              />
              <circle cx="10" cy="11" r="1.1" fill="currentColor" stroke="none" />
              <circle cx="14" cy="11" r="1.1" fill="currentColor" stroke="none" />
            </svg>
            <span className="askpage-header-title">
              <b>BrowserBot Debugger</b>
            </span>
          </div>
        </div>

        <div className="askpage-acts">
          {messages.length > 0 && (
            <button className="askpage-header-btn" onClick={clearConversation} title="New conversation">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          )}
          <select
            className="askpage-select"
            value={providerType === 'openai' ? `openai:${selectedOpenAIId}` : providerType}
            onChange={e => {
              const v = e.target.value;
              if (v.startsWith('openai:')) {
                setProviderType('openai');
                setSelectedOpenAIId(v.replace('openai:', ''));
              } else {
                setProviderType(v as AIProviderType);
              }
            }}
          >
            {openaiProviders.map(p => (
              <option key={p.id} value={`openai:${p.id}`}>
                {p.name} ({p.model})
              </option>
            ))}
            <option value="ollama">Ollama ({ollamaModel || 'default'})</option>
            <option value="chrome_ai">Chrome AI</option>
          </select>
        </div>
      </div>

      {/* ─── Context Bar (Tape effect) ─── */}
      {capturedData && (
        <div
          className="askpage-ctx"
          style={{ margin: '8px 14px 0' }}
          title={capturedData.metadata?.url || 'Captured context'}
        >
          <svg className="askpage-fav" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <b>{capturedData.metadata?.title || 'Inspected Webpage'}</b>
          <span>
            {[
              capturedData.dom ? `<${capturedData.dom.tag.toLowerCase()}>` : null,
              capturedData.logs?.length ? `${capturedData.logs.length} logs` : null,
              capturedData.network?.length ? `${capturedData.network.length} reqs` : null,
              capturedData.performance ? 'Perf' : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </div>
      )}

      {/* ─── Messages list (Ruled Notebook Background) ─── */}
      <div className="askpage-messages" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="askpage-welcome">
            <svg className="askpage-welcome-logo" viewBox="0 0 24 24" fill="none" stroke="none">
              <rect width="24" height="24" rx="7" fill="currentColor" stroke="none" />
              <path
                d="M6.5 9.5A2.5 2.5 0 0 1 9 7h6a2.5 2.5 0 0 1 2.5 2.5v3A2.5 2.5 0 0 1 15 15h-3l-3 2.5V15a2.5 2.5 0 0 1-2.5-2.5z"
                fill="#fff"
                stroke="none"
              />
              <circle cx="10" cy="11" r="1.1" fill="currentColor" stroke="none" />
              <circle cx="14" cy="11" r="1.1" fill="currentColor" stroke="none" />
            </svg>
            <h2>Hi, I'm BrowserBot Debugger</h2>
            <p>I have live access to your console logs, network requests, DOM elements, and performance metrics.</p>
            <span className="askpage-welcome-pick">
              try one of these
              <svg viewBox="0 0 40 30">
                <path d="M4 4c14 0 26 6 28 20M32 24l-6-5M32 24l5-6" />
              </svg>
            </span>
            <div className="askpage-welcome-prompts">
              {WELCOME_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  className="askpage-welcome-prompt-btn"
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

      {/* ─── Footer Composer ─── */}
      <div className="askpage-footer">
        <div className="askpage-cmp">
          <textarea
            ref={inputRef}
            className="askpage-input"
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this page or DevTools data…"
            rows={1}
            disabled={isStreaming}
          />
          <div className="askpage-row">
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
              <span>{isCapturing ? 'Capturing…' : capturedData ? 'DevTools Context Attached' : 'Capture Context'}</span>
            </button>

            {isStreaming ? (
              <button className="askpage-send" onClick={abortStream} title="Stop generation">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="5" y="5" width="14" height="14" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                className="askpage-send"
                onClick={() => sendMessage()}
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
        </div>
      </div>
    </div>
  );
};
