import { AppStorage, StorageState } from './storage';

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

  try {
    let jsonResponse = '';
    
    if (state.provider === 'chrome_ai') {
      jsonResponse = await generateWithChromeAI(prompt);
    } else if (state.provider === 'ollama') {
      jsonResponse = await generateWithOllama(prompt, state);
    } else if (state.provider === 'openai') {
      jsonResponse = await generateWithOpenAI(prompt, state);
    }

    const parsed = executeParseJSON(jsonResponse);
    if (!parsed || !parsed.categories) {
      throw new Error("Invalid format returned by AI.");
    }
    return parsed.categories;
  } catch (err) {
    console.error("AI Generation error:", err);
    throw err;
  }
}

function executeParseJSON(text: string): any {
  // Try to parse raw
  try { return JSON.parse(text); } catch (e) {}
  
  // Try to extract JSON from markdown blocks
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    try { return JSON.parse(match[1]); } catch (e) {}
  }

  // Fallback: try to find the first '{' and last '}'
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(text.substring(start, end + 1)); } catch (e) {}
  }
  return null;
}

// ----------------------------------------------------
// Providers
// ----------------------------------------------------

async function generateWithChromeAI(prompt: string): Promise<string> {
  const ai = (globalThis as any).ai;
  if (!ai || !ai.languageModel) {
    throw new Error("Chrome AI Prompt API is not available.");
  }
  
  const { available } = await ai.languageModel.capabilities();
  if (available !== "readily") {
    throw new Error("Chrome AI model not readily available.");
  }
  
  const session = await ai.languageModel.create();
  const result = await session.prompt(prompt);
  session.destroy();
  return result;
}

async function generateWithOllama(prompt: string, state: StorageState): Promise<string> {
  const res = await fetch(`${state.ollamaEndpoint}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: state.ollamaModel,
      prompt: prompt,
      stream: false,
      format: 'json'
    })
  });
  
  if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
  const data = await res.json();
  return data.response;
}

async function generateWithOpenAI(prompt: string, state: StorageState): Promise<string> {
  const url = state.openaiEndpoint.endsWith('/') ? `${state.openaiEndpoint}chat/completions` : `${state.openaiEndpoint}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.openaiKey}`
    },
    body: JSON.stringify({
      model: state.openaiModel,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" }
    })
  });
  
  if (!res.ok) throw new Error(`OpenAI error: ${res.statusText}`);
  const data = await res.json();
  return data.choices[0].message.content;
}
