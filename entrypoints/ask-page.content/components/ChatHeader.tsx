import React from 'react';
import { getDomain } from '../types';

interface ChatHeaderProps {
  pageTitle: string;
  pageUrl: string;
  isFullScreen?: boolean;
  showHistory: boolean;
  hasMessages: boolean;
  onToggleHistory: () => void;
  onNewChat: () => void;
  onClose: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  pageTitle,
  pageUrl,
  isFullScreen = false,
  showHistory,
  hasMessages,
  onToggleHistory,
  onNewChat,
  onClose,
}) => {
  return (
    <>
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
            onClick={onToggleHistory}
            title="Chat History"
            aria-label="Chat history"
          >
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16h.01" /></svg>
          </button>
          {hasMessages && (
            <button className="askpage-header-btn" onClick={onNewChat} title="New conversation" aria-label="New conversation">
              <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            </button>
          )}
          {!isFullScreen && (
            <button className="askpage-header-btn" onClick={onClose} title="Close" aria-label="Close">
              <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          )}
        </div>
      </div>

      <div className="askpage-ctx" title={`${pageTitle}\n${pageUrl}`}>
        <svg className="askpage-fav" viewBox="0 0 24 24" fill="none" stroke="none">
          <rect x="2" y="2" width="20" height="20" rx="5" fill="currentColor" stroke="none" />
          <path d="M13 6l-5 7h4l-1 5 5-7h-4z" fill="#fff" stroke="none" />
        </svg>
        <b>{pageTitle || 'This page'}</b>
        <span>{getDomain(pageUrl)}</span>
      </div>
    </>
  );
};
