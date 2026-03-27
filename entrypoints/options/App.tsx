import { useState, useEffect } from 'react';
import { AppStorage, StorageState, defaultState, AIProvider } from '../../utils/storage';

export default function App() {
  const [state, setState] = useState<StorageState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AppStorage.get().then(data => {
      setState(data);
      setLoading(false);
    });
  }, []);

  const handleChange = (field: keyof StorageState, value: string) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await AppStorage.set(state);
    setTimeout(() => setSaving(false), 800);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <header>
        <h1>BrowserBot Settings</h1>
        <p>Configure your AI provider for smart tab grouping and automation.</p>
      </header>

      <div className="card">
        <label>AI Provider</label>
        <select 
          value={state.provider} 
          onChange={(e) => handleChange('provider', e.target.value as AIProvider)}
        >
          <option value="chrome_ai">Built-in Chrome AI (Prompt API)</option>
          <option value="ollama">Ollama (Local API)</option>
          <option value="openai">OpenAI Compatible API</option>
        </select>
      </div>

      {state.provider === 'ollama' && (
        <div className="card">
          <label>Ollama Endpoint</label>
          <input 
            type="text" 
            value={state.ollamaEndpoint} 
            onChange={(e) => handleChange('ollamaEndpoint', e.target.value)} 
          />
          <label>Model Name</label>
          <input 
            type="text" 
            value={state.ollamaModel} 
            onChange={(e) => handleChange('ollamaModel', e.target.value)} 
          />
        </div>
      )}

      {state.provider === 'openai' && (
        <div className="card">
          <label>OpenAI Endpoint</label>
          <input 
            type="text" 
            value={state.openaiEndpoint} 
            onChange={(e) => handleChange('openaiEndpoint', e.target.value)} 
          />
          <label>API Key</label>
          <input 
            type="password" 
            value={state.openaiKey} 
            onChange={(e) => handleChange('openaiKey', e.target.value)} 
            placeholder="sk-..."
          />
          <label>Model Name</label>
          <input 
            type="text" 
            value={state.openaiModel} 
            onChange={(e) => handleChange('openaiModel', e.target.value)} 
          />
        </div>
      )}

      <div className="card">
        <label>System Prompt</label>
        <p className="help">This prompt is used when categorizing tabs. Be sure to keep the JSON formatting instructions intact.</p>
        <textarea 
          rows={12} 
          value={state.systemPrompt} 
          onChange={(e) => handleChange('systemPrompt', e.target.value)}
        />
      </div>

      <button className="save-btn" onClick={handleSave} disabled={saving}>
        {saving ? 'Saved!' : 'Save Configuration'}
      </button>
    </div>
  );
}
