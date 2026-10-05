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
  abortStream: () => void;
  sendMessage: () => void;
}

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
  abortStream,
  sendMessage,
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
      {/* History sidebar */}
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

      {/* Header */}
      <div
        className="askpage-controls"
        style={{
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1.5px solid var(--bd)',
        }}
      >
        <button
          className={`askpage-header-btn askpage-history-btn ${showHistory ? 'active' : ''}`}
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
        <span
          style={{
            fontSize: '24px',
            fontWeight: 700,
            fontFamily: 'var(--hfont)',
            color: 'var(--fg)',
            flex: 1,
          }}
        >
          <b>BrowserBot Debugger</b>
        </span>
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
          style={{ width: 'auto' }}
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
          <option value="ollama">Ollama ({ollamaModel})</option>
          <option value="chrome_ai">Chrome AI</option>
        </select>
      </div>

      {/* Messages */}
      <div
        className="askpage-messages"
        ref={messagesContainerRef}
        style={{ flex: 1, overflowY: 'auto', padding: '16px' }}
      >
        {messages.length === 0 ? (
          <div className="askpage-welcome">
            <h3>Hi, I'm BrowserBot Debugger</h3>
            <p>
              Capture DevTools context from the sidebar, select exactly what to share, and ask the AI to debug, optimize,
              or explain.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isLast = i === messages.length - 1;
            const streaming = isStreaming && isLast && msg.role === 'assistant';
            const liveThinking = streaming && thinkingContent;
            return (
              <div key={i} className={`askpage-msg-wrapper ${msg.role}`}>
                {msg.role === 'assistant' && (msg.thinking || liveThinking) && (
                  <details className="askpage-thinking-block" open={liveThinking ? thinkingExpanded : undefined}>
                    <summary
                      className="askpage-thinking-summary"
                      onClick={
                        liveThinking
                          ? e => {
                              e.preventDefault();
                              setThinkingExpanded(!thinkingExpanded);
                            }
                          : undefined
                      }
                    >
                      {liveThinking ? 'Thinking…' : 'Thinking process'}
                    </summary>
                    <div
                      className="askpage-thinking-content"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown((liveThinking ? thinkingContent : msg.thinking) as string),
                      }}
                    />
                  </details>
                )}
                <div
                  className={`askpage-msg ${msg.role}`}
                  {...(msg.role === 'assistant'
                    ? {
                        dangerouslySetInnerHTML: {
                          __html: renderMarkdown(msg.content) || '<span style="opacity:0.3">Thinking…</span>',
                        },
                      }
                    : {})}
                >
                  {msg.role !== 'assistant' ? msg.content : undefined}
                </div>
              </div>
            );
          })
        )}
        {isStreaming && !thinkingContent && messages[messages.length - 1]?.content === '' && (
          <div className="askpage-typing">
            <svg className="askpage-typing-wave" viewBox="0 0 64 16">
              <path pathLength="1" d="M2 8q5-12 10 0t10 0 10 0 10 0 10 0 10 0" />
            </svg>
            <span>Thinking…</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="askpage-input-area" style={{ padding: '10px 16px 14px' }}>
        <div
          className="askpage-input-wrapper"
          style={{ opacity: !capturedData && messages.length === 0 ? 0.7 : 1 }}
        >
          <textarea
            ref={inputRef}
            className="askpage-input"
            style={{ resize: 'none' }}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the captured DevTools data…"
            rows={1}
            disabled={isStreaming}
          />
        </div>
        {isStreaming ? (
          <button className="askpage-send-btn" onClick={abortStream} title="Stop">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5" y="5" width="14" height="14" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            className="askpage-send-btn"
            onClick={sendMessage}
            disabled={!input.trim()}
            title="Send"
          >
            <svg
              width="16"
              height="16"
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
  );
};
