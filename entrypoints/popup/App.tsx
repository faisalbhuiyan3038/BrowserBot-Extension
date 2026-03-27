import { useState, useEffect } from 'react';
import { groupTabsWithAI, GroupCategory, TabInfo } from '../../utils/ai';
import { AppStorage, StorageState, defaultState } from '../../utils/storage';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('Ready to Group Tabs');
  const [tabCount, setTabCount] = useState(0);

  useEffect(() => {
    browser.tabs.query({ currentWindow: true }).then(tabs => {
      setTabCount(tabs.length);
    });
  }, []);

  const openSettings = () => {
    browser.runtime.openOptionsPage();
  };

  const handleGroupTabs = async (keepExisting: boolean) => {
    setLoading(true);
    setStatus('Analyzing your tabs...');

    try {
      const tabs = await browser.tabs.query({ currentWindow: true });
      if (tabs.length === 0) {
        setStatus('No tabs found.');
        setLoading(false);
        return;
      }

      const tabsInfo: TabInfo[] = tabs.map(t => ({
        id: t.id!,
        url: t.url || '',
        title: t.title || ''
      })).filter(t => t.url && !t.url.startsWith('chrome://'));

      setStatus(`Found ${tabsInfo.length} valid tabs. Asking AI...`);
      
      const categories = await groupTabsWithAI(tabsInfo);

      setStatus('AI response received. Applying groups...');

      if (!keepExisting) {
        const allTabIds = tabsInfo.map(t => t.id);
        if (allTabIds.length > 0) {
          await browser.tabs.ungroup(allTabIds as any);
        }
      }

      for (const cat of categories) {
        if (cat.tabIds && cat.tabIds.length > 0) {
          // Verify those tabs still exist
          const validIds = cat.tabIds.filter(id => tabsInfo.some(t => t.id === id));
          if (validIds.length === 0) continue;

          setStatus(`Grouping: ${cat.name}`);
          const groupId = (await browser.tabs.group({ tabIds: validIds as any })) as unknown as number;
          
          let validatedColor = cat.color;
          const validColors = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan'];
          if (!validColors.includes(validatedColor)) {
            validatedColor = 'grey' as any;
          }

          await browser.tabGroups.update(groupId, {
            title: cat.name,
            color: validatedColor as any
          });
        }
      }

      setStatus('Successfully grouped your tabs!');
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message || 'Failed to group tabs'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-container">
      <header className="popup-header">
        <div className="logo-area">
          <div className="logo-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <h2>BrowserBot</h2>
        </div>
        <button className="icon-btn" onClick={openSettings} title="Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </header>

      <div className="glass-card main-action-card">
        <div className="stats">
          <span className="number">{tabCount}</span>
          <span className="label">Open Tabs</span>
        </div>
        <p className="status-text">{status}</p>

        <div className="button-group">
          <button 
            className={`btn primary-btn ${loading ? 'loading-pulse' : ''}`}
            onClick={() => handleGroupTabs(false)}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Auto-Group All Tabs'}
          </button>
          <button 
            className="btn secondary-btn"
            onClick={() => handleGroupTabs(true)}
            disabled={loading}
          >
            Group Ungrouped Only
          </button>
        </div>
      </div>
    </div>
  );
}
