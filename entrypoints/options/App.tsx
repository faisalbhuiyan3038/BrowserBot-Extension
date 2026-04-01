import { useState, useEffect, useRef } from 'react';
import {
  AppStorage, StorageState, defaultState,
  AIProviderType, ExtractionAlgorithm, OpenAIProvider, SystemPrompt, PROMPT_VARIABLES, ASK_PAGE_PROMPT_VARIABLES, generateId
} from '../../utils/storage';

type Page = 'providers' | 'tab-grouping' | 'ask-page';

export default function App() {
  const [state, setState] = useState<StorageState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [page, setPage] = useState<Page>('providers');
  const [editingProvider, setEditingProvider] = useState<OpenAIProvider | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);
  const [editingAskPrompt, setEditingAskPrompt] = useState<SystemPrompt | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const askPromptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chrome AI state
  const [chromeAIStatus, setChromeAIStatus] = useState<'checking' | 'readily' | 'after-download' | 'no' | 'unavailable'>('checking');
  const [chromeAIError, setChromeAIError] = useState('');
  const [chromeAIDownloading, setChromeAIDownloading] = useState(false);
  const [chromeAIProgress, setChromeAIProgress] = useState(0);

  useEffect(() => {
    AppStorage.get().then(data => {
      setState(data);
      setLoading(false);
    });
  }, []);

  // Check Chrome AI status when viewing providers
  useEffect(() => {
    if (state.activeProvider === 'chrome_ai') {
      checkChromeAI();
    }
  }, [state.activeProvider]);

  const checkChromeAI = () => {
    setChromeAIStatus('checking');
    browser.runtime.sendMessage({ type: 'CHECK_CHROME_AI' }).then((result: any) => {
      setChromeAIStatus(result.status);
      setChromeAIError(result.error || '');
    }).catch(() => {
      setChromeAIStatus('unavailable');
      setChromeAIError('Could not check Chrome AI status');
    });
  };

  const downloadChromeAI = () => {
    setChromeAIDownloading(true);
    setChromeAIProgress(0);

    // Listen for progress events
    const progressListener = (message: any) => {
      if (message.type === 'CHROME_AI_DOWNLOAD_PROGRESS') {
        setChromeAIProgress(message.progress);
      }
    };
    browser.runtime.onMessage.addListener(progressListener);

    browser.runtime.sendMessage({ type: 'DOWNLOAD_CHROME_AI' }).then((result: any) => {
      browser.runtime.onMessage.removeListener(progressListener);
      setChromeAIDownloading(false);
      if (result?.error) {
        setChromeAIError(result.error);
      } else {
        setChromeAIStatus('readily');
        setChromeAIError('');
      }
    }).catch((err: any) => {
      browser.runtime.onMessage.removeListener(progressListener);
      setChromeAIDownloading(false);
      setChromeAIError(err.message || 'Download failed');
    });
  };

  const save = async (patch: Partial<StorageState>) => {
    const next = { ...state, ...patch };
    setState(next);
    await AppStorage.set(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  // ── OpenAI provider CRUD ──
  const addProvider = () => {
    setEditingProvider({ id: generateId(), name: '', endpoint: '', apiKey: '', model: '', reasoning: false });
  };
  const saveProvider = (p: OpenAIProvider) => {
    const exists = state.openaiProviders.some(x => x.id === p.id);
    const providers = exists
      ? state.openaiProviders.map(x => x.id === p.id ? p : x)
      : [...state.openaiProviders, p];
    const activeId = state.activeOpenAIProviderId || providers[0]?.id || '';
    save({ openaiProviders: providers, activeOpenAIProviderId: activeId });
    setEditingProvider(null);
  };
  const deleteProvider = (id: string) => {
    const providers = state.openaiProviders.filter(x => x.id !== id);
    const activeId = state.activeOpenAIProviderId === id ? (providers[0]?.id || '') : state.activeOpenAIProviderId;
    save({ openaiProviders: providers, activeOpenAIProviderId: activeId });
    if (editingProvider?.id === id) setEditingProvider(null);
  };

  // ── Tab Grouping Prompt CRUD ──
  const addPrompt = () => {
    setEditingPrompt({ id: generateId(), name: '', prompt: '' });
  };
  const savePrompt = (p: SystemPrompt) => {
    const exists = state.tabGroupPrompts.some(x => x.id === p.id);
    const prompts = exists
      ? state.tabGroupPrompts.map(x => x.id === p.id ? p : x)
      : [...state.tabGroupPrompts, p];
    const activeId = state.activeTabGroupPromptId || prompts[0]?.id || '';
    save({ tabGroupPrompts: prompts, activeTabGroupPromptId: activeId });
    setEditingPrompt(null);
  };
  const deletePrompt = (id: string) => {
    if (state.tabGroupPrompts.length <= 1) return;
    const prompts = state.tabGroupPrompts.filter(x => x.id !== id);
    const activeId = state.activeTabGroupPromptId === id ? (prompts[0]?.id || '') : state.activeTabGroupPromptId;
    save({ tabGroupPrompts: prompts, activeTabGroupPromptId: activeId });
    if (editingPrompt?.id === id) setEditingPrompt(null);
  };

  // ── Ask Page Quick Prompt CRUD ──
  const addAskPrompt = () => {
    setEditingAskPrompt({ id: generateId(), name: '', prompt: '' });
  };
  const saveAskPrompt = (p: SystemPrompt) => {
    const exists = state.askPagePrompts.some(x => x.id === p.id);
    const prompts = exists
      ? state.askPagePrompts.map(x => x.id === p.id ? p : x)
      : [...state.askPagePrompts, p];
    save({ askPagePrompts: prompts });
    setEditingAskPrompt(null);
  };
  const deleteAskPrompt = (id: string) => {
    const prompts = state.askPagePrompts.filter(x => x.id !== id);
    save({ askPagePrompts: prompts });
    if (editingAskPrompt?.id === id) setEditingAskPrompt(null);
  };

  // ── Import / Export ──
  const handleExport = async () => {
    try {
      const json = await AppStorage.exportAll();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `browserbot-settings-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + (err as any).message);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await AppStorage.importAll(text);
      const newState = await AppStorage.get();
      setState(newState);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    } catch (err) {
      alert('Import failed: ' + (err as any).message);
    }
    // Reset the input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const navigateTo = (p: Page) => {
    setPage(p);
    setMobileMenuOpen(false);
  };

  if (loading) return <div className="page-loading">Loading settings…</div>;

  return (
    <div className="page">
      {/* ═══ Mobile Header ═══ */}
      <div className="mobile-header">
        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen
              ? <path d="M18 6L6 18M6 6l12 12"/>
              : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
            }
          </svg>
        </button>
        <div className="mobile-header-logo">
          <div className="sidebar-logo-icon">B</div>
          <span>BrowserBot</span>
        </div>
      </div>

      {/* ═══ Sidebar / Mobile Drawer ═══ */}
      {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">B</div>
          <span>BrowserBot</span>
        </div>
        <nav>
          <button
            className={`nav-link ${page === 'providers' ? 'active' : ''}`}
            onClick={() => navigateTo('providers')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            AI Providers
          </button>

          <div className="nav-group-label">Features</div>

          <button
            className={`nav-link ${page === 'tab-grouping' ? 'active' : ''}`}
            onClick={() => navigateTo('tab-grouping')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Auto Group Tabs
          </button>

          <button
            className={`nav-link ${page === 'ask-page' ? 'active' : ''}`}
            onClick={() => navigateTo('ask-page')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Ask Page
          </button>
        </nav>

        {/* ─── Import/Export Buttons ─── */}
        <div className="sidebar-footer">
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          <button className="sidebar-footer-btn" onClick={handleExport} title="Export all settings and conversations">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Export
          </button>
          <button className="sidebar-footer-btn" onClick={() => fileInputRef.current?.click()} title="Import settings and conversations from file">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            Import
          </button>
        </div>
      </aside>

      {/* ═══ Content ═══ */}
      <main className="content">
        {saved && <div className="toast">✓ Saved</div>}

        {/* ─── AI Providers Page ─── */}
        {page === 'providers' && (
          <section>
            <h1>AI Providers</h1>
            <p className="section-desc">Choose your active provider and configure endpoints.</p>

            <div className="card">
              <label className="field-label">Active Provider Type</label>
              <select
                value={state.activeProvider}
                onChange={e => save({ activeProvider: e.target.value as AIProviderType })}
              >
                <option value="openai">OpenAI Compatible API</option>
                <option value="ollama">Ollama (Local)</option>
                <option value="chrome_ai">Chrome Built-in AI</option>
              </select>
            </div>

            {state.activeProvider === 'ollama' && (
              <div className="card">
                <h3>Ollama Configuration</h3>
                <label className="field-label">Endpoint</label>
                <input type="text" value={state.ollamaEndpoint} onChange={e => save({ ollamaEndpoint: e.target.value })} placeholder="http://localhost:11434" />
                <label className="field-label">Model</label>
                <input type="text" value={state.ollamaModel} onChange={e => save({ ollamaModel: e.target.value })} placeholder="llama3" />
              </div>
            )}

            {state.activeProvider === 'chrome_ai' && (
              <div className="card">
                <h3>Chrome Built-in AI</h3>
                {chromeAIStatus === 'checking' && (
                  <p className="chrome-ai-status checking">Checking availability…</p>
                )}
                {chromeAIStatus === 'readily' && (
                  <p className="chrome-ai-status ready">✅ Chrome AI is ready! Gemini Nano model is available.</p>
                )}
                {chromeAIStatus === 'after-download' && (
                  <div>
                    <p className="chrome-ai-status download">⬇️ Chrome AI model needs to be downloaded.</p>
                    {chromeAIDownloading ? (
                      <div className="chrome-ai-progress">
                        <div className="chrome-ai-progress-bar" style={{ width: `${chromeAIProgress}%` }} />
                        <span>{chromeAIProgress}%</span>
                      </div>
                    ) : (
                      <button className="btn-primary" onClick={downloadChromeAI} style={{ marginTop: 8 }}>
                        Download Model
                      </button>
                    )}
                  </div>
                )}
                {(chromeAIStatus === 'no' || chromeAIStatus === 'unavailable') && (
                  <div>
                    <p className="chrome-ai-status error">❌ Chrome AI is not available</p>
                    <pre className="chrome-ai-error">{chromeAIError}</pre>
                    <button className="small-btn" onClick={checkChromeAI} style={{ marginTop: 8 }}>Re-check</button>
                  </div>
                )}
              </div>
            )}

            {state.activeProvider === 'openai' && (
              <>
                <div className="providers-header">
                  <h3>OpenAI Compatible Providers</h3>
                  <button className="add-btn" onClick={addProvider}>+ Add Provider</button>
                </div>

                {state.openaiProviders.length === 0 && (
                  <div className="card info-card"><p>No providers configured. Click <strong>+ Add Provider</strong>.</p></div>
                )}

                <div className="providers-grid">
                  {state.openaiProviders.map(p => (
                    <div key={p.id} className={`provider-card ${state.activeOpenAIProviderId === p.id ? 'active' : ''}`}>
                      <div className="provider-card-header">
                        <span className="provider-name">{p.name || 'Unnamed'}</span>
                        {state.activeOpenAIProviderId === p.id && <span className="active-badge">Active</span>}
                      </div>
                      <div className="provider-meta">
                        <span>{p.model || '—'}</span>
                        <span className="dot">•</span>
                        <span className="provider-endpoint">{p.endpoint || '—'}</span>
                        {p.reasoning && <><span className="dot">•</span><span className="reasoning-badge">Reasoning</span></>}
                      </div>
                      <div className="provider-actions">
                        {state.activeOpenAIProviderId !== p.id && (
                          <button className="small-btn" onClick={() => save({ activeOpenAIProviderId: p.id })}>Use</button>
                        )}
                        <button className="small-btn" onClick={() => setEditingProvider({ ...p })}>Edit</button>
                        <button className="small-btn danger" onClick={() => deleteProvider(p.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Provider Edit Modal */}
                {editingProvider && (
                  <div className="modal-overlay" onMouseDown={() => setEditingProvider(null)}>
                    <div className="modal" onMouseDown={e => e.stopPropagation()}>
                      <h3>{state.openaiProviders.some(x => x.id === editingProvider.id) ? 'Edit' : 'Add'} Provider</h3>
                      <label className="field-label">Display Name</label>
                      <input type="text" value={editingProvider.name} onChange={e => setEditingProvider({ ...editingProvider, name: e.target.value })} placeholder="e.g. OpenAI, Groq, Together…" />
                      <label className="field-label">API Endpoint</label>
                      <input type="text" value={editingProvider.endpoint} onChange={e => setEditingProvider({ ...editingProvider, endpoint: e.target.value })} placeholder="https://api.openai.com/v1" />
                      <label className="field-label">API Key</label>
                      <input type="password" value={editingProvider.apiKey} onChange={e => setEditingProvider({ ...editingProvider, apiKey: e.target.value })} placeholder="sk-… (leave blank if not needed)" />
                      <label className="field-label">Model</label>
                      <input type="text" value={editingProvider.model} onChange={e => setEditingProvider({ ...editingProvider, model: e.target.value })} placeholder="gpt-4o" />
                      <label className="toggle-row-modal">
                        <input type="checkbox" checked={editingProvider.reasoning} onChange={e => setEditingProvider({ ...editingProvider, reasoning: e.target.checked })} />
                        <div>
                          <span className="toggle-title">Enable Reasoning</span>
                          <span className="toggle-hint">Sends reasoning: {'{enabled: true}'} with the request</span>
                        </div>
                      </label>
                      <div className="modal-footer">
                        <button className="btn-secondary" onClick={() => setEditingProvider(null)}>Cancel</button>
                        <button className="btn-primary" onClick={() => saveProvider(editingProvider)}>Save Provider</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* ─── Auto Group Tabs Page ─── */}
        {page === 'tab-grouping' && (
          <section>
            <h1>Auto Group Tabs</h1>
            <p className="section-desc">Manage system prompts used when AI groups your tabs.</p>

            <div className="providers-header">
              <h3>System Prompts</h3>
              <button className="add-btn" onClick={addPrompt}>+ Add Prompt</button>
            </div>

            <div className="providers-grid">
              {state.tabGroupPrompts.map(p => (
                <div key={p.id} className={`provider-card ${state.activeTabGroupPromptId === p.id ? 'active' : ''}`}>
                  <div className="provider-card-header">
                    <span className="provider-name">{p.name || 'Untitled'}</span>
                    {state.activeTabGroupPromptId === p.id && <span className="active-badge">Default</span>}
                  </div>
                  <div className="prompt-preview">{p.prompt.substring(0, 120)}…</div>
                  <div className="provider-actions">
                    {state.activeTabGroupPromptId !== p.id && (
                      <button className="small-btn" onClick={() => save({ activeTabGroupPromptId: p.id })}>Set Default</button>
                    )}
                    <button className="small-btn" onClick={() => setEditingPrompt({ ...p })}>Edit</button>
                    {state.tabGroupPrompts.length > 1 && (
                      <button className="small-btn danger" onClick={() => deletePrompt(p.id)}>Delete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Variable Reference */}
            <div className="card var-reference">
              <h3>Available Variables</h3>
              <p className="section-desc" style={{ marginBottom: 12 }}>Use these in your prompts — they'll be replaced with real data at runtime.</p>
              <div className="var-grid">
                {PROMPT_VARIABLES.map(v => (
                  <div key={v.key} className="var-row">
                    <code className="var-key">{v.key}</code>
                    <span className="var-desc">{v.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt Edit Modal */}
            {editingPrompt && (
              <div className="modal-overlay" onMouseDown={() => setEditingPrompt(null)}>
                <div className="modal modal-wide" onMouseDown={e => e.stopPropagation()}>
                  <h3>{state.tabGroupPrompts.some(x => x.id === editingPrompt.id) ? 'Edit' : 'Add'} System Prompt</h3>
                  <label className="field-label">Prompt Name</label>
                  <input type="text" value={editingPrompt.name} onChange={e => setEditingPrompt({ ...editingPrompt, name: e.target.value })} placeholder="e.g. Default, Minimal, Work-focused…" />
                  <label className="field-label">Prompt Template</label>
                  <textarea
                    ref={promptTextareaRef}
                    rows={16}
                    value={editingPrompt.prompt}
                    onChange={e => setEditingPrompt({ ...editingPrompt, prompt: e.target.value })}
                    placeholder="Use variables like {tabList}, {tabCount}, etc."
                  />
                  <div className="var-hint-row">
                    {PROMPT_VARIABLES.map(v => (
                      <button
                        key={v.key}
                        className="var-chip"
                        type="button"
                        onClick={() => {
                          const ta = promptTextareaRef.current;
                          const text = editingPrompt.prompt;
                          if (ta) {
                            const pos = ta.selectionStart ?? text.length;
                            const newText = text.slice(0, pos) + v.key + text.slice(pos);
                            setEditingPrompt({ ...editingPrompt, prompt: newText });
                            requestAnimationFrame(() => {
                              ta.focus();
                              ta.selectionStart = ta.selectionEnd = pos + v.key.length;
                            });
                          } else {
                            setEditingPrompt({ ...editingPrompt, prompt: text + v.key });
                          }
                        }}
                        title={v.description}
                      >{v.key}</button>
                    ))}
                  </div>
                  <div className="modal-footer">
                    <button className="btn-secondary" onClick={() => setEditingPrompt(null)}>Cancel</button>
                    <button className="btn-primary" onClick={() => savePrompt(editingPrompt)}>Save Prompt</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ─── Ask Page Settings ─── */}
        {page === 'ask-page' && (
          <section>
            <h1>Ask Page</h1>
            <p className="section-desc">Configure the Ask Page chat overlay — system prompt, quick prompts, and behavior.</p>

            {/* System Prompt */}
            <div className="card">
              <h3>System Prompt</h3>
              <p className="section-desc" style={{ marginBottom: 8 }}>This prompt is always active for every Ask Page conversation. It provides context and instructions to the AI.</p>
              <textarea
                rows={8}
                value={state.askPageSystemPrompt}
                onChange={e => save({ askPageSystemPrompt: e.target.value })}
                placeholder="Enter your system prompt…"
                style={{ fontFamily: 'monospace', fontSize: 12 }}
              />
              <div className="var-hint-row" style={{ marginTop: 8 }}>
                {ASK_PAGE_PROMPT_VARIABLES.map(v => (
                  <span key={v.key} className="var-chip-static" title={v.description}>{v.key}</span>
                ))}
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="providers-header">
              <h3>Quick Prompts</h3>
              <button className="add-btn" onClick={addAskPrompt}>+ Add Prompt</button>
            </div>
            <p className="section-desc">Reusable text templates. When selected in the chat, their text fills the input box for you to use or edit.</p>

            <div className="providers-grid">
              {state.askPagePrompts.map(p => (
                <div key={p.id} className="provider-card">
                  <div className="provider-card-header">
                    <span className="provider-name">{p.name || 'Untitled'}</span>
                  </div>
                  <div className="prompt-preview">{p.prompt.substring(0, 120)}…</div>
                  <div className="provider-actions">
                    <button className="small-btn" onClick={() => setEditingAskPrompt({ ...p })}>Edit</button>
                    <button className="small-btn danger" onClick={() => deleteAskPrompt(p.id)}>Delete</button>
                  </div>
                </div>
              ))}
              {state.askPagePrompts.length === 0 && (
                <div className="card info-card"><p>No quick prompts. Click <strong>+ Add Prompt</strong> to create reusable templates.</p></div>
              )}
            </div>

            {/* Panel Settings */}
            <div className="card" style={{ marginTop: 20 }}>
              <h3>Panel Settings</h3>
              <label className="field-label">Panel Width (px)</label>
              <input
                type="number"
                value={state.askPagePanelWidth || ''}
                onChange={e => save({ askPagePanelWidth: e.target.value === '' ? '' as any : parseInt(e.target.value) })}
                onBlur={e => save({ askPagePanelWidth: Math.max(320, Math.min(800, parseInt(e.target.value) || 420)) })}
                min={320}
                max={800}
              />
              <label className="toggle-row-modal" style={{ marginTop: 16 }}>
                <input
                  type="checkbox"
                  checked={state.askPagePersistChat}
                  onChange={e => save({ askPagePersistChat: e.target.checked })}
                />
                <div>
                  <span className="toggle-title">Persist Chat Across Pages</span>
                  <span className="toggle-hint">Keep active chat when navigating. Chat syncs in real-time across tabs.</span>
                </div>
              </label>
            </div>

            {/* Page Extraction Algorithm */}
            <div className="card" style={{ marginTop: 16 }}>
              <h3>Page Content Extraction</h3>
              <p className="section-desc" style={{ marginBottom: 12 }}>Choose how page content is extracted when used as context for AI conversations.</p>
              <label className="field-label">Extraction Algorithm</label>
              <select
                value={state.pageExtractionAlgorithm}
                onChange={e => save({ pageExtractionAlgorithm: parseInt(e.target.value) as ExtractionAlgorithm })}
              >
                <option value={1}>Text Extraction</option>
                <option value={2}>Optimized Content Extraction</option>
                <option value={3}>⚠️ Full Content Extraction</option>
              </select>
              <div className="algo-descriptions" style={{ marginTop: 12 }}>
                {state.pageExtractionAlgorithm === 1 && (
                  <p className="section-desc">Lightweight extraction of headings, paragraphs, and list items with markdown formatting. Includes smart truncation to stay within token limits. Best for most use cases.</p>
                )}
                {state.pageExtractionAlgorithm === 2 && (
                  <p className="section-desc">Cleans full page HTML, removes duplicates, and extracts structured text. Includes automatic YouTube transcript extraction when on a video page.</p>
                )}
                {state.pageExtractionAlgorithm === 3 && (
                  <div>
                    <p className="section-desc" style={{ color: '#f59e0b' }}>⚠️ <strong>Warning:</strong> Extracts maximum page content using Mozilla Readability. This may use significantly more tokens as more content is captured, including potentially unnecessary content.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat History Settings */}
            <div className="card" style={{ marginTop: 16 }}>
              <h3>Chat History</h3>
              <label className="field-label">Auto-delete conversations older than (days)</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="number"
                  value={state.askPageAutoDeleteDays}
                  onChange={e => save({ askPageAutoDeleteDays: Math.max(0, parseInt(e.target.value) || 0) })}
                  min={0}
                  style={{ maxWidth: 100 }}
                />
                <span className="toggle-hint">{state.askPageAutoDeleteDays === 0 ? 'Disabled (never auto-delete)' : `Delete after ${state.askPageAutoDeleteDays} day${state.askPageAutoDeleteDays > 1 ? 's' : ''}`}</span>
              </div>

              <label className="field-label" style={{ marginTop: 12 }}>Maximum stored conversations</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="number"
                  value={state.askPageMaxConversations}
                  onChange={e => save({ askPageMaxConversations: Math.max(10, Math.min(1000, parseInt(e.target.value) || 100)) })}
                  min={10}
                  max={1000}
                  style={{ maxWidth: 100 }}
                />
                <span className="toggle-hint">Oldest conversations removed when limit reached</span>
              </div>
            </div>

            {/* Variable Reference */}
            <div className="card var-reference" style={{ marginTop: 16 }}>
              <h3>Available Variables</h3>
              <p className="section-desc" style={{ marginBottom: 12 }}>Use these in your system prompt — they'll be replaced with real data at runtime.</p>
              <div className="var-grid">
                {ASK_PAGE_PROMPT_VARIABLES.map(v => (
                  <div key={v.key} className="var-row">
                    <code className="var-key">{v.key}</code>
                    <span className="var-desc">{v.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ask Page Quick Prompt Edit Modal */}
            {editingAskPrompt && (
              <div className="modal-overlay" onMouseDown={() => setEditingAskPrompt(null)}>
                <div className="modal modal-wide" onMouseDown={e => e.stopPropagation()}>
                  <h3>{state.askPagePrompts.some(x => x.id === editingAskPrompt.id) ? 'Edit' : 'Add'} Quick Prompt</h3>
                  <label className="field-label">Prompt Name</label>
                  <input type="text" value={editingAskPrompt.name} onChange={e => setEditingAskPrompt({ ...editingAskPrompt, name: e.target.value })} placeholder="e.g. Summarize, Explain, Code Review…" />
                  <label className="field-label">Prompt Text</label>
                  <textarea
                    ref={askPromptTextareaRef}
                    rows={6}
                    value={editingAskPrompt.prompt}
                    onChange={e => setEditingAskPrompt({ ...editingAskPrompt, prompt: e.target.value })}
                    placeholder="The text that will fill the input box when this prompt is selected."
                  />
                  <div className="modal-footer">
                    <button className="btn-secondary" onClick={() => setEditingAskPrompt(null)}>Cancel</button>
                    <button className="btn-primary" onClick={() => saveAskPrompt(editingAskPrompt)}>Save Prompt</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
