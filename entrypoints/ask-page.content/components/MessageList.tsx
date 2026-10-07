import React, { useState, useEffect } from 'react';
import type { ChatMsg, SystemPrompt } from '../../../utils/storage';
import iconUrl from '../../../assets/icon-alt.png';

const THINKING_MESSAGES = [
  'Skimming the page…',
  'Underlining the good bits…',
  'Writing it up…',
];

interface MessageListProps {
  messages: ChatMsg[];
  isStreaming: boolean;
  thinkingContent: string;
  thinkingExpanded: boolean;
  onToggleThinking: () => void;
  quickPrompts: SystemPrompt[];
  onSelectPrompt: (promptId: string) => void;
  onSelectFallbackPrompt: (text: string) => void;
  onRetry: () => void;
  onContinueResponse: () => void;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  renderMarkdown: (content: string) => string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isStreaming,
  thinkingContent,
  thinkingExpanded,
  onToggleThinking,
  quickPrompts,
  onSelectPrompt,
  onSelectFallbackPrompt,
  onRetry,
  onContinueResponse,
  messagesContainerRef,
  messagesEndRef,
  onScroll,
  renderMarkdown,
}) => {
  const [thinkingIndex, setThinkingIndex] = useState(0);

  useEffect(() => {
    if (!isStreaming) {
      setThinkingIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setThinkingIndex(prev => (prev + 1) % THINKING_MESSAGES.length);
    }, 1000);
    return () => clearInterval(timer);
  }, [isStreaming]);

  return (
    <div className="askpage-messages" ref={messagesContainerRef} onScroll={onScroll}>
      {messages.length === 0 ? (
        <div className="askpage-welcome">
          <img src={iconUrl} className="askpage-welcome-logo askpage-logo" alt="BrowserBot" />
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
                  if (found) onSelectPrompt(found.id);
                  else onSelectFallbackPrompt(item.label);
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
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16h.01" /></svg>
                  <div>
                    <b>Couldn't read this page's content</b>
                    <p>{msg.content || "The page blocked BrowserBot from reading it. Allow site access in the extension settings, then retry."}</p>
                    <button className="askpage-retry" onClick={onRetry}>Retry</button>
                  </div>
                </div>
              );
            }

            // assistant
            const hasThinking = Boolean(showLiveThinking ? thinkingContent : msg.thinking);
            const hasContent = Boolean(msg.content && msg.content.trim());

            return (
              <div key={i} className="askpage-m ai">
                <svg className="askpage-av" viewBox="0 0 24 24" fill="none" stroke="none">
                  <rect width="24" height="24" rx="7" fill="currentColor" stroke="none" />
                  <path d="M6.5 9.5A2.5 2.5 0 0 1 9 7h6a2.5 2.5 0 0 1 2.5 2.5v3A2.5 2.5 0 0 1 15 15h-3l-3 2.5V15a2.5 2.5 0 0 1-2.5-2.5z" fill="#fff" stroke="none" />
                  <circle cx="10" cy="11" r="1.1" fill="currentColor" stroke="none" />
                  <circle cx="14" cy="11" r="1.1" fill="currentColor" stroke="none" />
                </svg>
                <div className="askpage-ans">
                  {hasThinking && (
                    <details className="askpage-thinking-block" open={showLiveThinking ? thinkingExpanded : undefined}>
                      <summary
                        className="askpage-thinking-summary"
                        onClick={showLiveThinking ? (e) => { e.preventDefault(); onToggleThinking(); } : undefined}
                      >
                        {showLiveThinking ? 'Thinking…' : 'Thinking process'}
                      </summary>
                      <div
                        className="askpage-thinking-content"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown((showLiveThinking ? thinkingContent : msg.thinking) as string) }}
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
                      <svg className="askpage-scr" viewBox="0 0 64 16"><path pathLength={1} d="M2 8q5-12 10 0t10 0 10 0 10 0 10 0 10 0" /></svg>
                      <span>{THINKING_MESSAGES[thinkingIndex]}</span>
                    </div>
                  ) : hasThinking ? (
                    <div className="askpage-b">
                      <div style={{ opacity: 0.75, fontStyle: 'italic', fontSize: '13px', margin: '4px 0 8px 0' }}>
                        Thinking process completed without final output.
                      </div>
                      <button
                        className="askpage-welcome-prompt-btn"
                        style={{ fontSize: '12px', padding: '4px 10px', marginTop: '4px' }}
                        onClick={onContinueResponse}
                      >
                        Continue Response →
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
