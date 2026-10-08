import { useState, useEffect, useRef } from 'react';
import iconUrl from '../../assets/icon-alt.png';
import { groupTabsWithAI, TabInfo, ExistingGroup, organizeBookmarksWithAI } from '../../utils/ai';
import { AppStorage, SystemPrompt, generateUUID } from '../../utils/storage';
import {
  getBookmarkTree, buildBookmarkListText, buildFolderListText, buildDomainList, buildRootParentList,
  applyOrganizePlan, FlatBookmark, FlatFolder, OrganizePlan
} from '../../utils/bookmarks';
import { CopyPromptDropdown } from '../../components/CopyPromptDropdown';
import { PasteResponseModal } from '../../components/PasteResponseModal';
import type { PromptContext } from '../../utils/copyModules';
import type { ParsedAIAction } from '../../utils/actionExecutor';
import { executeTabGroups, executeBookmarkPlan } from '../../utils/actionExecutor';

type View = 'home' | 'group-tabs' | 'devtools-info' | 'bookmarks';
type BookmarksTab = 'organize' | 'ask';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [keepExisting, setKeepExisting] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');

  // Opt-in Copy-Paste AI state
  const [copyPasteUnlocked, setCopyPasteUnlocked] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteModalScope, setPasteModalScope] = useState<'tab_groups' | 'bookmarks'>('tab_groups');
  const [tabContext, setTabContext] = useState<PromptContext | null>(null);
  const [bookmarkContext, setBookmarkContext] = useState<PromptContext | null>(null);

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
  const bSessionId = useRef(generateUUID());

  // Scroll ask-bookmarks chat to bottom
  useEffect(() => { if (bChatRef.current) bChatRef.current.scrollTop = bChatRef.current.scrollHeight; }, [bMessages]);

  useEffect(() => {
    // Load available prompts & settings
    AppStorage.get().then(state => {
      setPrompts(state.tabGroupPrompts);
      setSelectedPromptId(state.activeTabGroupPromptId);
      setCopyPasteUnlocked(state.copyPasteUnlocked ?? false);
    });

    const handleStorageChange = (changes: any, area: string) => {
      if (area === 'local' && changes.appState?.newValue) {
        const state = changes.appState.newValue;
        if (state.copyPasteUnlocked !== undefined) setCopyPasteUnlocked(state.copyPasteUnlocked);
      }
    };
    browser.storage.onChanged.addListener(handleStorageChange);
    return () => browser.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  // Update tab prompt context when relevant state changes
  useEffect(() => {
    if (!copyPasteUnlocked || view !== 'group-tabs') return;
    (async () => {
      try {
        const tabs = await browser.tabs.query({ currentWindow: true });
        const tabsInfo: TabInfo[] = tabs
          .filter(t => t.id != null && t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://'))
          .map(t => ({ id: t.id!, url: t.url!, title: t.title || '' }));
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
        const promptTemplate = prompts.find(p => p.id === selectedPromptId)?.prompt || '';
        setTabContext({
          scope: 'tab-group',
          systemPrompt: promptTemplate,
          tabs: tabsInfo,
          existingGroups,
          customInstructions,
          keepExistingGroups: keepExisting,
        });
      } catch (_) {}
    })();
  }, [copyPasteUnlocked, view, prompts, selectedPromptId, customInstructions, keepExisting]);

  // Update bookmark prompt context when relevant state changes
  useEffect(() => {
    if (!copyPasteUnlocked || view !== 'bookmarks' || bTab !== 'organize') return;
    (async () => {
      try {
        const tree = await getBookmarkTree();
        const bookmarkListText = buildBookmarkListText(tree.bookmarks);
        const folderListText = buildFolderListText(tree.folders);
        const domainList = buildDomainList(tree.bookmarks);
        const rootParentList = buildRootParentList(tree.bookmarks);
        const state = await AppStorage.get();
        setBookmarkContext({
          scope: 'bookmarks',
          systemPrompt: state.bookmarkOrganizePrompt,
          bookmarkOptions: {
            bookmarkListText,
            folderListText,
            domainList,
            rootParentList,
            bookmarkCount: tree.bookmarks.length,
            rootFolderCount: tree.folders.filter(f => f.depth === 1).length,
            totalFolderCount: tree.folders.length,
            restrictToExisting: bRestrictExisting,
            customInstructions: bCustom,
          }
        });
      } catch (_) {}
    })();
  }, [copyPasteUnlocked, view, bTab, bRestrictExisting, bCustom]);

  const handlePopupPasteAction = async (action: ParsedAIAction) => {
    if (action.type === 'tab_groups') {
      setStatus('Applying tab groups…');
      const tabs = await browser.tabs.query({ currentWindow: true });
      const tabsInfo: TabInfo[] = tabs
        .filter(t => t.id != null && t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://'))
        .map(t => ({ id: t.id!, url: t.url!, title: t.title || '' }));
      const res = await executeTabGroups(action.categories, keepExisting, tabsInfo);
      setStatus(`✓ Successfully organized tabs into ${res.created} categories!`);
    } else if (action.type === 'bookmarks') {
      setBPlan(action.plan);
      setBStatus('✓ Plan extracted! Review below and click "Apply Changes".');
    }
  };

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
        rootParentList: buildRootParentList(tree.bookmarks),
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
      const result = await applyOrganizePlan(bPlan, bFolders, bBookmarks, bRestrictExisting);
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
            <img src={iconUrl} alt="BrowserBot" width="28" height="28" style={{ display: 'block' }} />
          </div>
          <div className="logo-text">
            <h2><b>BrowserBot</b></h2>
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
            <div className="action-icon" style={{ background: '#ffd45e', color: '#2a2622' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
              try {
                await browser.runtime.sendMessage({ type: 'TOGGLE_ASK_PAGE' });
              } catch (_) {
                // Background may not be ready — ignore
              }
              // Small delay so background can process the message before popup closes
              setTimeout(() => window.close(), 150);
            }}>
            <div className="action-icon" style={{ background: '#ffe3d8', color: '#b02f17' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
            <div className="action-icon" style={{ background: '#fff1a8', color: '#78350f' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
            <div className="action-icon" style={{ background: '#fff3d6', color: '#e0482c' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

            {copyPasteUnlocked && tabContext && (
              <div className="popup-action-row">
                <CopyPromptDropdown context={tabContext} variant="popup" />
                <button
                  type="button"
                  className="popup-secondary-btn"
                  onClick={() => { setPasteModalScope('tab_groups'); setShowPasteModal(true); }}
                  title="Paste AI response"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  </svg>
                  <span>Paste AI Plan</span>
                </button>
              </div>
            )}
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
          <div style={{ display:'flex', gap:'8px', marginBottom:'12px' }}>
            {(['organize','ask'] as BookmarksTab[]).map(t => (
              <button 
                key={t} 
                onClick={() => setBTab(t)} 
                className="bookmarks-tab-btn"
                style={{ 
                  flex: 1, 
                  padding: '7px', 
                  fontSize: '17px', 
                  background: bTab === t ? 'var(--ac)' : 'var(--sub)', 
                  color: bTab === t ? 'var(--acfg)' : 'var(--fg)', 
                  cursor: 'pointer' 
                }}
              >
                {t === 'organize' ? '🗂 Organize' : '💬 Ask'}
              </button>
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
                <div style={{ background:'var(--sub)', border:'1.5px solid var(--bd)', borderRadius:'var(--rs)', padding:'10px', marginTop:'8px', fontSize:'12.5px', boxShadow:'var(--sh-sm)' }}>
                  <div style={{fontWeight:700, fontFamily:'var(--hfont)', fontSize:'18px', marginBottom:'4px', color:'var(--act)'}}>⚡ Review Plan</div>
                  <div style={{color:'var(--fg)'}}>📁 {bPlan.createFolders.length} new folder(s) will be created</div>
                  <div style={{color:'var(--fg)'}}>🔀 {bPlan.moves.length} bookmark(s) will be moved</div>
                  <div style={{display:'flex', gap:'8px', marginTop:'10px'}}>
                    <button className="btn primary-btn" style={{flex:1, padding:'6px 10px', fontSize:'18px'}} onClick={applyPlan}>Apply Changes</button>
                    <button className="btn" style={{padding:'6px 12px', fontSize:'18px', border:'1.5px solid var(--bd)', background:'var(--pbg)', color:'var(--fg)', cursor:'pointer'}} onClick={() => setBPlan(null)}>Cancel</button>
                  </div>
                </div>
              )}

              {!bPlan && (
                <>
                  <button className={`btn primary-btn ${bLoading ? 'loading-pulse' : ''}`} style={{marginTop:'8px'}} onClick={loadBookmarks} disabled={bLoading}>
                    {bLoading ? 'Analyzing…' : 'Analyze & Organize'}
                  </button>

                  {copyPasteUnlocked && bookmarkContext && (
                    <div className="popup-action-row">
                      <CopyPromptDropdown context={bookmarkContext} variant="popup" />
                      <button
                        type="button"
                        className="popup-secondary-btn"
                        onClick={() => { setPasteModalScope('bookmarks'); setShowPasteModal(true); }}
                        title="Paste AI response"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                        </svg>
                        <span>Paste AI Plan</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Ask tab ── */}
          {bTab === 'ask' && (
            <div className="glass-card" style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              <h3 className="subview-title">Ask Bookmarks</h3>
              <p style={{fontSize:'12px', color:'var(--mute)', margin:0}}>Ask anything about your bookmarks — find tools, games, videos, or any pattern you're looking for.</p>

              <div ref={bChatRef} style={{maxHeight:'200px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'6px', padding:'4px 0'}}>
                {bMessages.length === 0 && <p style={{fontSize:'13px', color:'var(--mute)', fontStyle:'italic', textAlign:'center', margin:'12px 0'}}>Try: "Find any GitHub links" or "Do I have any cooking sites?"</p>}
                {bMessages.map((m, i) => (
                  <div key={i} style={{
                    padding:'7px 11px',
                    borderRadius:'12px',
                    fontSize:'12.5px',
                    lineHeight:'1.5',
                    maxWidth:'88%',
                    alignSelf: m.role==='user'?'flex-end':'flex-start',
                    background: m.role==='user'?'var(--ub)':'var(--pbg)',
                    color: m.role==='user'?'var(--ubf)':'var(--fg)',
                    border: '1.5px solid var(--bd)',
                    boxShadow: '1.5px 1.5px 0 var(--bd)',
                    transform: m.role==='user'?'rotate(0.5deg)':'rotate(-0.5deg)'
                  }}>
                    {m.content || <span style={{opacity:.4}}>…</span>}
                  </div>
                ))}
              </div>

              <div style={{display:'flex', gap:'6px', marginTop:'4px'}}>
                <input
                  style={{flex:1, padding:'7px 10px', fontSize:'12.5px', border:'1.5px solid var(--bd)', borderRadius:'var(--rs)', background:'var(--sub)', color:'var(--fg)', outline:'none'}}
                  value={bInput} onChange={e => setBInput(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && !e.shiftKey && sendBMsg()}
                  placeholder="Ask about your bookmarks…"
                  disabled={bStreaming}
                />
                <button
                  onClick={sendBMsg} disabled={bStreaming || !bInput.trim()}
                  className="btn primary-btn"
                  style={{width:'auto', padding:'6px 14px', fontSize:'17px'}}
                >Send</button>
              </div>
              {bMessages.length > 0 && (
                <button onClick={() => setBMessages([])} style={{fontSize:'12px', background:'none', border:'none', color:'var(--mute)', cursor:'pointer', alignSelf:'center', marginTop:'4px'}}>Clear chat</button>
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

      {/* Paste AI Response Modal */}
      {showPasteModal && (
        <PasteResponseModal
          open={showPasteModal}
          onClose={() => setShowPasteModal(false)}
          targetScope={pasteModalScope}
          onExecuteAction={handlePopupPasteAction}
        />
      )}
    </div>
  );
}
