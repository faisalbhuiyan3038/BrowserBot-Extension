import React from 'react';
import type { Conversation } from '../../../utils/storage';

interface HistorySidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  historySearch: string;
  onSearchChange: (search: string) => void;
  onStartNewChat: () => void;
  onClose: () => void;
  onLoadConversation: (conv: Conversation) => void;
  onDeleteConversation: (id: string) => void;
  formatDate: (ts: number) => string;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  conversations,
  activeConversationId,
  historySearch,
  onSearchChange,
  onStartNewChat,
  onClose,
  onLoadConversation,
  onDeleteConversation,
  formatDate,
}) => {
  return (
    <div className="askpage-history-sidebar">
      <div className="askpage-history-header">
        <h4>Chat History</h4>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="askpage-history-new" onClick={onStartNewChat}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New
          </button>
          <button className="askpage-history-close" onClick={onClose} title="Close">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <input
        className="askpage-history-search"
        placeholder="Search conversations…"
        value={historySearch}
        onChange={e => onSearchChange(e.target.value)}
      />
      <div className="askpage-history-list">
        {conversations.map(conv => (
          <div
            key={conv.id}
            className={`askpage-history-item ${activeConversationId === conv.id ? 'active' : ''}`}
          >
            <button className="askpage-history-item-main" onClick={() => onLoadConversation(conv)}>
              <div className="askpage-history-item-title">{conv.title}</div>
              <div className="askpage-history-item-meta">
                {formatDate(conv.updatedAt)} · {conv.messages.filter(m => m.role === 'user').length} msgs
              </div>
            </button>
            <button
              className="askpage-history-item-delete"
              onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}
              title="Delete"
            >×</button>
          </div>
        ))}
        {conversations.length === 0 && (
          <div className="askpage-history-empty">
            {historySearch ? 'No matching conversations' : 'No conversations yet'}
          </div>
        )}
      </div>
    </div>
  );
};
