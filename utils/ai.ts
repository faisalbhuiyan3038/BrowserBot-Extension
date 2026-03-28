import { AppStorage, StorageState, OpenAIProvider } from './storage';

export type TabInfo = {
  id: number;
  url: string;
  title: string;
};

export type ExistingGroup = {
  id?: number;
  title: string;
  color: string;
  tabIds: number[];
};

export type GroupCategory = {
  name: string;
  color: string;
  tabIds: number[];
};

/**
 * Interpolate prompt template variables with actual tab data.
 */
function interpolatePrompt(
  template: string,
  tabs: TabInfo[],
  existingGroups: ExistingGroup[]
): string {
  const ungroupedIds = tabs
    .filter(t => !existingGroups.some(g => g.tabIds.includes(t.id)))
    .map(t => t.id);

  const replacements: Record<string, string> = {
    '{tabList}': JSON.stringify(tabs.map(t => ({ id: t.id, title: t.title, url: t.url })), null, 2),
    '{tabCount}': String(tabs.length),
    '{tabIds}': tabs.map(t => t.id).join(', '),
    '{tabTitles}': tabs.map(t => t.title).join('\n'),
    '{tabUrls}': tabs.map(t => t.url).join('\n'),
    '{tabTitleUrlPairs}': tabs.map(t => `${t.title} — ${t.url}`).join('\n'),
    '{existingGroups}': JSON.stringify(existingGroups, null, 2),
    '{ungroupedTabIds}': ungroupedIds.join(', '),
  };

  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replaceAll(key, value);
  }
  return result;
}

// The output format is always appended programmatically — users
// don't need to include it in their custom prompts.
const OUTPUT_FORMAT_INSTRUCTION = `

Return a JSON object with the following structure:
{
  "categories": [
    {
      "name": "Category Name",
      "color": "blue",
      "tabIds": [1, 2, 3]
    }
  ]
}

"color" must be one of: grey, blue, red, yellow, green, pink, purple, cyan, orange.
"tabIds" must contain tab IDs from the provided list.
Only return valid JSON, no markdown blocks or conversational text.`;

export interface GroupTabsOptions {
  promptId?: string;           // override the active prompt
  customInstructions?: string; // extra instructions appended to the prompt
  keepExistingGroups?: boolean; // programmatic instruction to preserve existing groups
}

export async function groupTabsWithAI(
  tabs: TabInfo[],
  existingGroups: ExistingGroup[] = [],
  options: GroupTabsOptions = {}
): Promise<GroupCategory[]> {
  const state = await AppStorage.get();

  // Resolve which prompt to use
  let promptTemplate: SystemPrompt;
  if (options.promptId) {
    promptTemplate = state.tabGroupPrompts.find(p => p.id === options.promptId)
      ?? await AppStorage.getActiveTabGroupPrompt();
  } else {
    promptTemplate = await AppStorage.getActiveTabGroupPrompt();
  }

  let templateText = promptTemplate.prompt;

  if (options.keepExistingGroups && existingGroups.length > 0) {
    templateText += `\n\nIMPORTANT: The user wants to keep their existing tab groups intact.\nHere is the data for existing groups:\n{existingGroups}\n\nIf a tab currently belongs to an existing group, you MUST keep it in that group by assigning it the EXACT same "name" and "color". You may also add ungrouped tabs to these existing groups. Do not rename existing groups or change their colors.`;
  }

  // Build the full prompt: template → custom instructions → output format
  let fullPrompt = interpolatePrompt(templateText, tabs, existingGroups);

  if (options.customInstructions?.trim()) {
    fullPrompt += '\n\nAdditional instructions:\n' + options.customInstructions.trim();
  }

  fullPrompt += OUTPUT_FORMAT_INSTRUCTION;

  let jsonResponse = '';

  if (state.activeProvider === 'chrome_ai') {
    jsonResponse = await generateWithChromeAI(fullPrompt);
  } else if (state.activeProvider === 'ollama') {
    jsonResponse = await generateWithOllama(fullPrompt, state);
  } else if (state.activeProvider === 'openai') {
    const provider = state.openaiProviders.find(p => p.id === state.activeOpenAIProviderId);
    if (!provider) throw new Error('No active OpenAI provider configured. Please check Settings.');
    jsonResponse = await generateWithOpenAI(fullPrompt, provider);
  }

  const parsed = parseJSON(jsonResponse);
  if (!parsed || !parsed.categories) {
    throw new Error(`AI returned invalid format. Raw response:\n${jsonResponse.substring(0, 300)}`);
  }
  return parsed.categories;
}

function parseJSON(text: string): any {
  try { return JSON.parse(text); } catch (_) {}

  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match?.[1]) {
    try { return JSON.parse(match[1]); } catch (_) {}
  }

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
