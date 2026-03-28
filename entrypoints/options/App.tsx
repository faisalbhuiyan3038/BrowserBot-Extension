import { useState, useEffect, useRef } from 'react';
import {
  AppStorage, StorageState, defaultState,
  AIProviderType, OpenAIProvider, SystemPrompt, PROMPT_VARIABLES, generateId
} from '../../utils/storage';

type Page = 'providers' | 'tab-grouping' | 'ask-page';

export default function App() {
  const [state, setState] = useState<StorageState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [page, setPage] = useState<Page>('providers');
  const [editingProvider, setEditingProvider] = useState<OpenAIProvider | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    AppStorage.get().then(data => {
      setState(data);
      setLoading(false);
    });
  }, []);

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

  // ── System Prompt CRUD ──
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
    if (state.tabGroupPrompts.length <= 1) return; // keep at least one
    const prompts = state.tabGroupPrompts.filter(x => x.id !== id);
    const activeId = state.activeTabGroupPromptId === id ? (prompts[0]?.id || '') : state.activeTabGroupPromptId;
    save({ tabGroupPrompts: prompts, activeTabGroupPromptId: activeId });
    if (editingPrompt?.id === id) setEditingPrompt(null);
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
            className={`nav-link disabled ${page === 'ask-page' ? 'active' : ''}`}
            disabled
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Ask About Page
            <span className="coming-soon-badge">Soon</span>
          </button>
        </nav>
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
              <div className="card info-card">
                <h3>Chrome Built-in AI</h3>
                <p>Uses the browser's native Prompt API. No configuration needed — enable it in <code>chrome://flags</code>.</p>
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
                            // Restore cursor after React re-render
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

        {/* ─── Ask About Page (placeholder) ─── */}
        {page === 'ask-page' && (
          <section>
            <h1>Ask About Page</h1>
            <p className="section-desc">Coming soon — ask AI questions about the current page.</p>
          </section>
        )}
      </main>
    </div>
  );
}
