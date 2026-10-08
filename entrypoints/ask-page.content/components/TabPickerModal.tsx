import React from 'react';

interface TabPickerModalProps {
  tabSearch: string;
  onTabSearchChange: (search: string) => void;
  filteredTabs: any[];
  selectedPickerTabs: number[];
  onToggleTab: (tabId: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export const TabPickerModal: React.FC<TabPickerModalProps> = ({
  tabSearch,
  onTabSearchChange,
  filteredTabs,
  selectedPickerTabs,
  onToggleTab,
  onCancel,
  onConfirm,
}) => {
  return (
    <div className="askpage-tab-picker-overlay" onClick={onCancel}>
      <div className="askpage-tab-picker" onClick={e => e.stopPropagation()}>
        <h4>Add Tab Context</h4>
        <input
          className="askpage-tab-picker-search"
          placeholder="Search tabs…"
          value={tabSearch}
          onChange={e => onTabSearchChange(e.target.value)}
          autoFocus
        />
        <div className="askpage-tab-picker-list">
          {filteredTabs.map(tab => (
            <button
              key={tab.id}
              className={`askpage-tab-picker-item ${selectedPickerTabs.includes(tab.id) ? 'selected' : ''}`}
              onClick={() => onToggleTab(tab.id)}
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
          <button className="askpage-tab-picker-btn cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="askpage-tab-picker-btn confirm"
            onClick={onConfirm}
            disabled={selectedPickerTabs.length === 0}
          >
            Add {selectedPickerTabs.length > 0 ? `(${selectedPickerTabs.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
