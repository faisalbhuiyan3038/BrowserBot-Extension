import { AppStorage, StorageState, OpenAIProvider } from './storage';

export type TabInfo = {
  id: number;
  url: string;
  title: string;
};

export type GroupCategory = {
  name: string;
  color: string;
  tabIds: number[];
};

export async function groupTabsWithAI(tabs: TabInfo[]): Promise<GroupCategory[]> {
  const state = await AppStorage.get();
  const tabsContext = JSON.stringify(tabs.map(t => ({ id: t.id, title: t.title, url: t.url })));
  const prompt = `${state.systemPrompt}\n\nTabs to group:\n${tabsContext}`;

  let jsonResponse = '';

  if (state.activeProvider === 'chrome_ai') {
    jsonResponse = await generateWithChromeAI(prompt);
  } else if (state.activeProvider === 'ollama') {
    jsonResponse = await generateWithOllama(prompt, state);
  } else if (state.activeProvider === 'openai') {
    const provider = state.openaiProviders.find(p => p.id === state.activeOpenAIProviderId);
    if (!provider) throw new Error('No active OpenAI provider configured. Please check Settings.');
    jsonResponse = await generateWithOpenAI(prompt, provider);
  }

  const parsed = parseJSON(jsonResponse);
  if (!parsed || !parsed.categories) {
    throw new Error(`AI returned invalid format. Raw response:\n${jsonResponse.substring(0, 200)}`);
  }
  return parsed.categories;
}

function parseJSON(text: string): any {
  // Direct parse
  try { return JSON.parse(text); } catch (_) {}

  // Extract from markdown code block
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match?.[1]) {
    try { return JSON.parse(match[1]); } catch (_) {}
  }

  // Find first { ... last }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try { return JSON.parse(text.substring(start, end + 1)); } catch (_) {}
  }
  return null;
}

// ─── Chrome AI (Prompt API) ──────────────────────────────────

async function generateWithChromeAI(prompt: string): Promise<string> {
  const ai = (globalThis as any).ai;
  if (!ai?.languageModel) {
    throw new Error('Chrome AI Prompt API is not available. Enable it in chrome://flags.');
  }

  const { available } = await ai.languageModel.capabilities();
  if (available !== 'readily') {
    throw new Error('Chrome AI model is not readily available.');
  }

  const session = await ai.languageModel.create();
  try {
    return await session.prompt(prompt);
  } finally {
    session.destroy();
  }
}

// ─── Ollama ──────────────────────────────────────────────────

async function generateWithOllama(prompt: string, state: StorageState): Promise<string> {
  const endpoint = state.ollamaEndpoint.replace(/\/+$/, '');
  const res = await fetch(`${endpoint}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: state.ollamaModel,
      prompt,
      stream: false,
      format: 'json'
    })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Ollama error ${res.status}: ${body || res.statusText}`);
  }
  const data = await res.json();
  return data.response;
}

// ─── OpenAI Compatible ──────────────────────────────────────

async function generateWithOpenAI(prompt: string, provider: OpenAIProvider): Promise<string> {
  // Smart URL resolution: don't double /chat/completions
  let url = provider.endpoint.replace(/\/+$/, '');
  if (!url.endsWith('/chat/completions')) {
    url += '/chat/completions';
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (provider.apiKey) {
    headers['Authorization'] = `Bearer ${provider.apiKey}`;
  }

  const body: Record<string, any> = {
    model: provider.model,
    messages: [{ role: 'user', content: prompt }]
  };

  if (provider.reasoning) {
    body.reasoning = { enabled: true };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`${provider.name} error ${res.status}: ${errBody || res.statusText}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}
