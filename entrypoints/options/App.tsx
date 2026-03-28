import { useState, useEffect } from 'react';
import {
  AppStorage, StorageState, defaultState, defaultSystemPrompt,
  AIProviderType, OpenAIProvider, generateId
} from '../../utils/storage';

export default function App() {
  const [state, setState] = useState<StorageState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [editingProvider, setEditingProvider] = useState<OpenAIProvider | null>(null);

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
    const p: OpenAIProvider = { id: generateId(), name: '', endpoint: '', apiKey: '', model: '', reasoning: false };
    setEditingProvider(p);
  };

  const saveProvider = (p: OpenAIProvider) => {
    const existing = state.openaiProviders.find(x => x.id === p.id);
    let providers: OpenAIProvider[];
    if (existing) {
      providers = state.openaiProviders.map(x => x.id === p.id ? p : x);
    } else {
      providers = [...state.openaiProviders, p];
    }
    // If this is the first provider, auto-select it
    const activeId = state.activeOpenAIProviderId || (providers.length === 1 ? p.id : state.activeOpenAIProviderId);
    save({ openaiProviders: providers, activeOpenAIProviderId: activeId });
    setEditingProvider(null);
  };

  const deleteProvider = (id: string) => {
    const providers = state.openaiProviders.filter(x => x.id !== id);
    const activeId = state.activeOpenAIProviderId === id
      ? (providers[0]?.id || '')
      : state.activeOpenAIProviderId;
    save({ openaiProviders: providers, activeOpenAIProviderId: activeId });
    if (editingProvider?.id === id) setEditingProvider(null);
  };

  if (loading) return <div className="page-loading">Loading settings…</div>;

  return (
    <div className="page">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">B</div>
          <span>BrowserBot</span>
        </div>
        <nav>
          <a href="#providers" className="nav-link active">AI Providers</a>
          <a href="#prompt" className="nav-link">System Prompt</a>
        </nav>
      </aside>

      <main className="content">
        {saved && <div className="toast">✓ Saved</div>}

        {/* ═══ Provider Selection ═══ */}
        <section id="providers">
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

          {/* ── Ollama ── */}
          {state.activeProvider === 'ollama' && (
            <div className="card">
              <h3>Ollama Configuration</h3>
              <label className="field-label">Endpoint</label>
              <input
                type="text"
                value={state.ollamaEndpoint}
                onChange={e => save({ ollamaEndpoint: e.target.value })}
                placeholder="http://localhost:11434"
              />
              <label className="field-label">Model</label>
              <input
                type="text"
                value={state.ollamaModel}
                onChange={e => save({ ollamaModel: e.target.value })}
                placeholder="llama3"
              />
            </div>
          )}

          {/* ── Chrome AI ── */}
          {state.activeProvider === 'chrome_ai' && (
            <div className="card info-card">
              <h3>Chrome Built-in AI</h3>
              <p>Uses the browser's native Prompt API. No configuration needed — make sure the flag is enabled in <code>chrome://flags</code>.</p>
            </div>
          )}

          {/* ── OpenAI Compatible Providers List ── */}
          {state.activeProvider === 'openai' && (
            <>
              <div className="providers-header">
                <h3>OpenAI Compatible Providers</h3>
                <button className="add-btn" onClick={addProvider}>+ Add Provider</button>
              </div>

              {state.openaiProviders.length === 0 && (
                <div className="card info-card">
                  <p>No providers configured yet. Click <strong>+ Add Provider</strong> to get started.</p>
                </div>
              )}

              <div className="providers-grid">
                {state.openaiProviders.map(p => (
                  <div
                    key={p.id}
                    className={`provider-card ${state.activeOpenAIProviderId === p.id ? 'active' : ''}`}
                  >
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
                        <button className="small-btn" onClick={() => save({ activeOpenAIProviderId: p.id })}>
                          Use
                        </button>
                      )}
                      <button className="small-btn" onClick={() => setEditingProvider({ ...p })}>Edit</button>
                      <button className="small-btn danger" onClick={() => deleteProvider(p.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Provider Edit Modal ── */}
              {editingProvider && (
                <div className="modal-overlay" onClick={() => setEditingProvider(null)}>
                  <div className="modal" onClick={e => e.stopPropagation()}>
                    <h3>{state.openaiProviders.find(x => x.id === editingProvider.id) ? 'Edit' : 'Add'} Provider</h3>

                    <label className="field-label">Display Name</label>
                    <input
                      type="text"
                      value={editingProvider.name}
                      onChange={e => setEditingProvider({ ...editingProvider, name: e.target.value })}
                      placeholder="e.g. OpenAI, Groq, Together…"
                    />

                    <label className="field-label">API Endpoint</label>
                    <input
                      type="text"
                      value={editingProvider.endpoint}
                      onChange={e => setEditingProvider({ ...editingProvider, endpoint: e.target.value })}
                      placeholder="https://api.openai.com/v1"
                    />

                    <label className="field-label">API Key</label>
                    <input
                      type="password"
                      value={editingProvider.apiKey}
                      onChange={e => setEditingProvider({ ...editingProvider, apiKey: e.target.value })}
                      placeholder="sk-… (leave blank if not needed)"
                    />

                    <label className="field-label">Model</label>
                    <input
                      type="text"
                      value={editingProvider.model}
                      onChange={e => setEditingProvider({ ...editingProvider, model: e.target.value })}
                      placeholder="gpt-4o"
                    />

                    <label className="toggle-row-modal">
                      <input
                        type="checkbox"
                        checked={editingProvider.reasoning}
                        onChange={e => setEditingProvider({ ...editingProvider, reasoning: e.target.checked })}
                      />
                      <div>
                        <span className="toggle-title">Enable Reasoning</span>
                        <span className="toggle-hint">Sends reasoning: {'{enabled: true}'} with the request (OpenRouter, etc.)</span>
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

        {/* ═══ System Prompt ═══ */}
        <section id="prompt">
          <h1>System Prompt</h1>
          <p className="section-desc">This prompt is sent to the AI when categorizing tabs. Keep JSON instructions intact.</p>

          <div className="card">
            <textarea
              rows={14}
              value={state.systemPrompt}
              onChange={e => setState({ ...state, systemPrompt: e.target.value })}
              onBlur={() => save({ systemPrompt: state.systemPrompt })}
            />
            <button className="reset-btn" onClick={() => save({ systemPrompt: defaultSystemPrompt })}>
              Reset to Default
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
