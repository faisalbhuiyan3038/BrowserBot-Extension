import { useState, useEffect } from 'react';
import { groupTabsWithAI, TabInfo, ExistingGroup } from '../../utils/ai';
import { AppStorage, SystemPrompt } from '../../utils/storage';

type View = 'home' | 'group-tabs';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [tabCount, setTabCount] = useState(0);
  const [keepExisting, setKeepExisting] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');

  // Prompt selection
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState('');

  useEffect(() => {
    browser.tabs.query({ currentWindow: true }).then(tabs => {
      setTabCount(tabs.length);
    });
    // Load available prompts
    AppStorage.get().then(state => {
      setPrompts(state.tabGroupPrompts);
      setSelectedPromptId(state.activeTabGroupPromptId);
    });
  }, []);

  const openSettings = () => {
    browser.runtime.openOptionsPage();
  };

  const handleGroupTabs = async () => {
    setLoading(true);
    setStatus('Analyzing your tabs…');

    try {
      const tabs = await browser.tabs.query({ currentWindow: true });
      const tabsInfo: TabInfo[] = tabs
        .filter(t => t.id != null && t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://'))
        .map(t => ({ id: t.id!, url: t.url!, title: t.title || '' }));

      if (tabsInfo.length === 0) {
        setStatus('No valid tabs found.');
        setLoading(false);
        return;
      }

      // Gather existing tab groups for context
      let existingGroups: ExistingGroup[] = [];
      try {
        const groups = await browser.tabGroups.query({ windowId: (await browser.windows.getCurrent()).id! });
        for (const g of groups) {
          const groupTabs = tabs.filter(t => (t as any).groupId === g.id);
          existingGroups.push({
            id: g.id,
            title: g.title || '',
            color: g.color || 'grey',
            tabIds: groupTabs.map(t => t.id!).filter(Boolean)
          });
        }
      } catch (_) {}

      setStatus(`Found ${tabsInfo.length} tabs. Asking AI…`);
      const categories = await groupTabsWithAI(tabsInfo, existingGroups, {
        promptId: selectedPromptId || undefined,
        customInstructions: customInstructions || undefined,
        keepExistingGroups: keepExisting,
      });
      setStatus('Applying groups…');

      if (!keepExisting) {
        const allTabIds = tabsInfo.map(t => t.id);
        if (allTabIds.length > 0) {
          try { await browser.tabs.ungroup(allTabIds as any); } catch (_) {}
        }
      }

      for (const cat of categories) {
        const validIds = (cat.tabIds || []).filter(id => tabsInfo.some(t => t.id === id));
        if (validIds.length === 0) continue;

        // Find existing match by exact name if keepExisting is true
        const existingMatch = keepExisting 
          ? existingGroups.find(g => g.title === cat.name) 
          : undefined;

        let groupId: number;
        if (existingMatch && existingMatch.id !== undefined) {
          // Add to existing group
          groupId = (await browser.tabs.group({ tabIds: validIds as any, groupId: existingMatch.id })) as unknown as number;
        } else {
          // Create new group
          groupId = (await browser.tabs.group({ tabIds: validIds as any })) as unknown as number;
        }

        const validColors = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
        const color = validColors.includes(cat.color) ? cat.color : (existingMatch?.color || 'grey');

        await browser.tabGroups.update(groupId, { title: cat.name, color: color as any });
      }

      setStatus('✓ Tabs grouped successfully!');
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-container">
      <header className="popup-header">
        <div className="logo-area">
          <div className="logo-circle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.4V11h3a3 3 0 0 1 3 3v1.5a2.5 2.5 0 0 1-5 0V14h-2v1.5a2.5 2.5 0 0 1-5 0V14H6v1.5a2.5 2.5 0 0 1-5 0V14a3 3 0 0 1 3-3h3V9.4A4 4 0 0 1 12 2z"/>
            </svg>
          </div>
          <div className="logo-text">
            <h2>BrowserBot</h2>
            <span className="tab-badge">{tabCount} tabs</span>
          </div>
        </div>
        <button className="icon-btn" onClick={openSettings} title="Settings">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </header>

      {/* ── Home view: action buttons ── */}
      {view === 'home' && (
        <div className="actions-list">
          <button className="action-card" onClick={() => setView('group-tabs')}>
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <div className="action-text">
              <span className="action-title">Auto Group Tabs</span>
              <span className="action-desc">Organize open tabs into smart groups using AI</span>
            </div>
            <svg className="action-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          <button className="action-card disabled" disabled>
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #00b894, #55efc4)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div className="action-text">
              <span className="action-title">Ask About Page</span>
              <span className="action-desc">Coming soon</span>
            </div>
            <svg className="action-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      )}

      {/* ── Group Tabs sub-view ── */}
      {view === 'group-tabs' && (
        <div className="subview">
          <button className="back-btn" onClick={() => { setView('home'); setStatus(''); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </button>

          <div className="glass-card">
            <h3 className="subview-title">Auto Group Tabs</h3>

            {/* Prompt selector */}
            <div className="field-group">
              <label className="field-label-popup">Prompt</label>
              <select
                className="popup-select"
                value={selectedPromptId}
                onChange={e => setSelectedPromptId(e.target.value)}
              >
                {prompts.map(p => (
                  <option key={p.id} value={p.id}>{p.name || 'Untitled'}</option>
                ))}
              </select>
            </div>

            <label className="toggle-row">
              <input type="checkbox" checked={keepExisting} onChange={e => setKeepExisting(e.target.checked)} />
              <span className="toggle-label">Keep existing tab groups</span>
            </label>

            {/* Custom instructions */}
            <div className="field-group">
              <label className="field-label-popup">Custom instructions <span className="optional-tag">optional</span></label>
              <textarea
                className="popup-textarea"
                rows={3}
                value={customInstructions}
                onChange={e => setCustomInstructions(e.target.value)}
                placeholder="e.g. Group by project, ignore social media tabs…"
              />
            </div>

            {status && <p className={`status-text ${status.startsWith('Error') ? 'error' : status.startsWith('✓') ? 'success' : ''}`}>{status}</p>}

            <button
              className={`btn primary-btn ${loading ? 'loading-pulse' : ''}`}
              onClick={handleGroupTabs}
              disabled={loading}
            >
              {loading ? 'Processing…' : 'Group Tabs Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
