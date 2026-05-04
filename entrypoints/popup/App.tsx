import { useState, useEffect, useRef } from 'react';
import { groupTabsWithAI, TabInfo, ExistingGroup, organizeBookmarksWithAI } from '../../utils/ai';
import { AppStorage, SystemPrompt } from '../../utils/storage';
import {
  getBookmarkTree, buildBookmarkListText, buildFolderListText, buildDomainList,
  applyOrganizePlan, FlatBookmark, FlatFolder, OrganizePlan
} from '../../utils/bookmarks';

type View = 'home' | 'group-tabs' | 'devtools-info' | 'bookmarks';
type BookmarksTab = 'organize' | 'ask';

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

  // Bookmarks state
  const [bTab, setBTab] = useState<BookmarksTab>('organize');
  const [bLoading, setBLoading] = useState(false);
  const [bStatus, setBStatus] = useState('');
  const [bCustom, setBCustom] = useState('');
  const [bRestrictExisting, setBRestrictExisting] = useState(false);
  const [bPlan, setBPlan] = useState<OrganizePlan | null>(null);
  const [bBookmarks, setBBookmarks] = useState<FlatBookmark[]>([]);
  const [bFolders, setBFolders] = useState<FlatFolder[]>([]);
  // Ask Bookmarks chat
  const [bMessages, setBMessages] = useState<{role:'user'|'assistant'; content:string}[]>([]);
  const [bInput, setBInput] = useState('');
  const [bStreaming, setBStreaming] = useState(false);
  const bChatRef = useRef<HTMLDivElement>(null);
  const bSessionId = useRef(Math.random().toString(36).slice(2));

  // Scroll ask-bookmarks chat to bottom
  useEffect(() => { if (bChatRef.current) bChatRef.current.scrollTop = bChatRef.current.scrollHeight; }, [bMessages]);

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

  // ── Load and analyze bookmarks ──
  const loadBookmarks = async () => {
    setBLoading(true);
    setBStatus('Loading bookmarks…');
    setBPlan(null);
    try {
      const tree = await getBookmarkTree();
      setBBookmarks(tree.bookmarks);
      setBFolders(tree.folders);
      setBStatus(`Found ${tree.bookmarks.length} bookmarks in ${tree.folders.length} folders. Asking AI…`);
      const plan = await organizeBookmarksWithAI({
        bookmarkListText: buildBookmarkListText(tree.bookmarks),
        folderListText: buildFolderListText(tree.folders),
        domainList: buildDomainList(tree.bookmarks),
        bookmarkCount: tree.bookmarks.length,
        rootFolderCount: tree.folders.filter(f => f.depth === 1).length,
        totalFolderCount: tree.folders.length,
        restrictToExisting: bRestrictExisting,
        customInstructions: bCustom || undefined,
      });
      setBPlan(plan);
      setBStatus('');
    } catch (e: any) {
      setBStatus('Error: ' + (e.message || 'Unknown error'));
    } finally {
      setBLoading(false);
    }
  };

  const applyPlan = async () => {
    if (!bPlan) return;
    setBLoading(true);
    setBStatus('Applying changes…');
    try {
      const result = await applyOrganizePlan(bPlan, bFolders, bRestrictExisting);
      const msg = `✓ Done! ${result.bookmarksMoved} bookmarks moved, ${result.foldersCreated} folders created.` +
        (result.errors.length ? `\n⚠ ${result.errors.length} error(s): ${result.errors[0]}` : '');
      setBStatus(msg);
      setBPlan(null);
    } catch (e: any) {
      setBStatus('Error: ' + (e.message || 'Unknown error'));
    } finally {
      setBLoading(false);
    }
  };

  // ── Ask Bookmarks chat (streaming via background) ──
  const sendBMsg = async () => {
    if (!bInput.trim() || bStreaming) return;
    const userMsg = bInput.trim();
    setBInput('');
    setBStreaming(true);
    // Build bookmark context once
    let bookmarkCtx = '';
    if (bBookmarks.length === 0) {
      try {
        const tree = await getBookmarkTree();
        setBBookmarks(tree.bookmarks);
        setBFolders(tree.folders);
        bookmarkCtx = buildBookmarkListText(tree.bookmarks);
      } catch { bookmarkCtx = '(Could not load bookmarks)'; }
    } else {
      bookmarkCtx = buildBookmarkListText(bBookmarks);
    }
    const systemContent = `You are a bookmark assistant. The user has the following bookmarks:\n\n${bookmarkCtx}\n\nAnswer questions about these bookmarks. Be specific, cite titles and URLs.`;
    const history = bMessages.map(m => ({ role: m.role as 'user'|'assistant', content: m.content }));
    const msgs = [
      { role: 'system' as const, content: systemContent },
      ...history,
      { role: 'user' as const, content: userMsg },
    ];
    setBMessages(prev => [...prev, { role: 'user', content: userMsg }, { role: 'assistant', content: '' }]);
    const sid = bSessionId.current;
    const listener = (msg: any) => {
      if (msg.sessionId !== sid) return;
      if (msg.type === 'ASK_PAGE_CHAT_CHUNK') {
        setBMessages(prev => { const a = [...prev]; a[a.length-1] = { role: 'assistant', content: a[a.length-1].content + msg.chunk }; return a; });
      } else if (msg.type === 'ASK_PAGE_CHAT_DONE' || msg.type === 'ASK_PAGE_CHAT_ERROR') {
        setBStreaming(false);
        browser.runtime.onMessage.removeListener(listener);
      }
    };
    browser.runtime.onMessage.addListener(listener);
    browser.runtime.sendMessage({ type: 'ASK_PAGE_CHAT', messages: msgs, sessionId: sid });
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

          <button className="action-card" onClick={async () => {
              await browser.runtime.sendMessage({ type: 'TOGGLE_ASK_PAGE' });
              window.close();
            }}>
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #00b894, #55efc4)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="action-text">
              <span className="action-title">Ask Page</span>
              <span className="action-desc">Chat with AI about the current page</span>
            </div>
            <svg className="action-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          <button className="action-card" onClick={() => { setView('bookmarks'); setBStatus(''); setBPlan(null); }}>
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #f9a825, #ff6f00)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="action-text">
              <span className="action-title">Organize Bookmarks</span>
              <span className="action-desc">Restructure &amp; search bookmarks with AI</span>
            </div>
            <svg className="action-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          <button className="action-card" onClick={() => setView('devtools-info')}>
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #e17055, #fd79a8)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 11 4 5"/>
                <line x1="12" y1="19" x2="20" y2="19"/>
              </svg>
            </div>
            <div className="action-text">
              <span className="action-title">Ask about DevTools</span>
              <span className="action-desc">Analyze elements, network, performance & console</span>
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

      {/* ── Bookmarks sub-view ── */}
      {view === 'bookmarks' && (
        <div className="subview">
          <button className="back-btn" onClick={() => { setView('home'); setBStatus(''); setBPlan(null); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </button>

          {/* Sub-tab switcher */}
          <div style={{ display:'flex', gap:'4px', marginBottom:'10px' }}>
            {(['organize','ask'] as BookmarksTab[]).map(t => (
              <button key={t} onClick={() => setBTab(t)} style={{ flex:1, padding:'6px', fontSize:'12px', fontWeight:600, borderRadius:'6px', border:'1px solid #e5e7eb', background: bTab===t ? '#f9a825' : '#f9fafb', color: bTab===t ? '#fff' : '#374151', cursor:'pointer', textTransform:'capitalize' }}>{t === 'organize' ? '🗂 Organize' : '💬 Ask'}</button>
            ))}
          </div>

          {/* ── Organize tab ── */}
          {bTab === 'organize' && (
            <div className="glass-card">
              <h3 className="subview-title">Organize Bookmarks</h3>

              <label className="toggle-row">
                <input type="checkbox" checked={bRestrictExisting} onChange={e => setBRestrictExisting(e.target.checked)} />
                <span className="toggle-label">Use existing folders only</span>
              </label>

              <div className="field-group" style={{marginTop:'8px'}}>
                <label className="field-label-popup">Custom instructions <span className="optional-tag">optional</span></label>
                <textarea className="popup-textarea" rows={2} value={bCustom} onChange={e => setBCustom(e.target.value)} placeholder="e.g. Keep all dev links together, separate work from personal…" />
              </div>

              {bStatus && <p className={`status-text ${bStatus.startsWith('Error') ? 'error' : bStatus.startsWith('✓') ? 'success' : ''}`} style={{whiteSpace:'pre-line'}}>{bStatus}</p>}

              {/* Confirmation panel */}
              {bPlan && !bLoading && (
                <div style={{ background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:'8px', padding:'10px', marginTop:'8px', fontSize:'12px' }}>
                  <div style={{fontWeight:600, marginBottom:'4px', color:'#92400e'}}>⚡ Review Plan</div>
                  <div style={{color:'#78350f'}}>📁 {bPlan.createFolders.length} new folder(s) will be created</div>
                  <div style={{color:'#78350f'}}>🔀 {bPlan.moves.length} bookmark(s) will be moved</div>
                  <div style={{display:'flex', gap:'6px', marginTop:'8px'}}>
                    <button className="btn primary-btn" style={{flex:1, padding:'7px', fontSize:'12px'}} onClick={applyPlan}>Apply Changes</button>
                    <button className="btn" style={{padding:'7px 10px', fontSize:'12px', border:'1px solid #d1d5db', borderRadius:'6px', background:'#fff', cursor:'pointer'}} onClick={() => setBPlan(null)}>Cancel</button>
                  </div>
                </div>
              )}

              {!bPlan && (
                <button className={`btn primary-btn ${bLoading ? 'loading-pulse' : ''}`} style={{marginTop:'8px', background:'linear-gradient(135deg,#f9a825,#ff6f00)', border:'none'}} onClick={loadBookmarks} disabled={bLoading}>
                  {bLoading ? 'Analyzing…' : 'Analyze & Organize'}
                </button>
              )}
            </div>
          )}

          {/* ── Ask tab ── */}
          {bTab === 'ask' && (
            <div className="glass-card" style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              <h3 className="subview-title">Ask Bookmarks</h3>
              <p style={{fontSize:'12px', color:'#6b7280', margin:0}}>Ask anything about your bookmarks — find tools, games, videos, or any pattern you're looking for.</p>

              <div ref={bChatRef} style={{maxHeight:'200px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'6px'}}>
                {bMessages.length === 0 && <p style={{fontSize:'12px', color:'#9ca3af', textAlign:'center', margin:'12px 0'}}>Try: "Find any GitHub links" or "Do I have any cooking sites?"</p>}
                {bMessages.map((m, i) => (
                  <div key={i} style={{padding:'6px 10px', borderRadius:'8px', fontSize:'12px', lineHeight:'1.5', maxWidth:'90%', alignSelf: m.role==='user'?'flex-end':'flex-start', background: m.role==='user'?'#f9a825':'#f3f4f6', color: m.role==='user'?'#fff':'#1f2937'}}>
                    {m.content || <span style={{opacity:.4}}>…</span>}
                  </div>
                ))}
              </div>

              <div style={{display:'flex', gap:'6px'}}>
                <input
                  style={{flex:1, padding:'7px 10px', fontSize:'12px', border:'1px solid #e5e7eb', borderRadius:'6px', outline:'none'}}
                  value={bInput} onChange={e => setBInput(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && !e.shiftKey && sendBMsg()}
                  placeholder="Ask about your bookmarks…"
                  disabled={bStreaming}
                />
                <button
                  onClick={sendBMsg} disabled={bStreaming || !bInput.trim()}
                  style={{padding:'7px 12px', fontSize:'12px', fontWeight:600, borderRadius:'6px', border:'none', background:'#f9a825', color:'#fff', cursor: bStreaming||!bInput.trim()?'not-allowed':'pointer', opacity: bStreaming||!bInput.trim()?0.6:1}}
                >Send</button>
              </div>
              {bMessages.length > 0 && (
                <button onClick={() => setBMessages([])} style={{fontSize:'11px', background:'none', border:'none', color:'#9ca3af', cursor:'pointer', alignSelf:'center'}}>Clear chat</button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── DevTools Info sub-view ── */}
      {view === 'devtools-info' && (
        <div className="subview">
          <button className="back-btn" onClick={() => setView('home')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </button>
          
          <div className="glass-card">
            <h3 className="subview-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e17055" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
              AI Debugger
            </h3>
            
            <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5', marginTop: '10px' }}>
              BrowserBot now integrates directly with your browser's Developer Tools!
            </p>
            
            <div style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginTop: '16px' }}>
              <ol style={{ margin: 0, paddingLeft: '20px', color: '#1f2937', fontSize: '14px', lineHeight: '1.6' }}>
                <li>Right-click anywhere on the page and select <strong>Inspect</strong> (or press <strong>F12</strong>).</li>
                <li>In the Developer Tools window, find the <strong>AI Debugger</strong> tab (it might be under the <strong>&raquo;</strong> menu).</li>
                <li>Select elements, check network requests, and ask the AI!</li>
              </ol>
            </div>
            
            <button
              className="btn primary-btn"
              style={{ marginTop: '20px' }}
              onClick={() => window.close()}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
