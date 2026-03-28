export type AIProviderType = 'ollama' | 'openai' | 'chrome_ai';

export interface OpenAIProvider {
  id: string;
  name: string;
  endpoint: string;
  apiKey: string;
  model: string;
  reasoning: boolean;
}

export interface SystemPrompt {
  id: string;
  name: string;
  prompt: string;
}

// ─── Available template variables for tab grouping prompts ───
// These are interpolated at runtime before sending to the AI.
export const PROMPT_VARIABLES: { key: string; description: string }[] = [
  { key: '{tabList}',        description: 'Full JSON array of tabs: [{id, title, url}, ...]' },
  { key: '{tabCount}',       description: 'Total number of tabs' },
  { key: '{tabIds}',         description: 'Comma-separated list of tab IDs' },
  { key: '{tabTitles}',      description: 'Newline-separated list of tab titles' },
  { key: '{tabUrls}',        description: 'Newline-separated list of tab URLs' },
  { key: '{tabTitleUrlPairs}', description: 'Each tab as "Title — URL" on its own line' },
  { key: '{existingGroups}', description: 'JSON of current tab groups: [{title, color, tabIds}, ...]' },
  { key: '{ungroupedTabIds}', description: 'Comma-separated IDs of tabs not in any group' },
];

export interface StorageState {
  // AI provider config
  activeProvider: AIProviderType;
  activeOpenAIProviderId: string;
  ollamaEndpoint: string;
  ollamaModel: string;
  openaiProviders: OpenAIProvider[];

  // Tab grouping prompts
  tabGroupPrompts: SystemPrompt[];
  activeTabGroupPromptId: string;
}

export const DEFAULT_TAB_GROUP_PROMPT: SystemPrompt = {
  id: 'builtin-default',
  name: 'Default',
  prompt: `You are an AI assistant helping categorize browser tabs.
Here are the open tabs:

{tabList}

Group these {tabCount} tabs into logical categories.

Return a JSON object with the following structure:
{
  "categories": [
    {
      "name": "Category Name (e.g. Work, News, Social)",
      "color": "blue", // must be one of: grey, blue, red, yellow, green, pink, purple, cyan, orange
      "tabIds": [1, 2, 3] // array of tab IDs from the list above
    }
  ]
}

Only return valid JSON, no markdown blocks or conversational text.`
};

export const defaultState: StorageState = {
  activeProvider: 'openai',
  activeOpenAIProviderId: 'default',
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'llama3',
  openaiProviders: [
    {
      id: 'default',
      name: 'OpenAI',
      endpoint: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4o',
      reasoning: false
    }
  ],
  tabGroupPrompts: [{ ...DEFAULT_TAB_GROUP_PROMPT }],
  activeTabGroupPromptId: 'builtin-default'
};

export const AppStorage = {
  get: async (): Promise<StorageState> => {
    const val = await browser.storage.local.get('appState');
    if (!val.appState) return { ...defaultState };
    const merged = { ...defaultState, ...val.appState };
    // Ensure there's always at least the default prompt
    if (!merged.tabGroupPrompts || merged.tabGroupPrompts.length === 0) {
      merged.tabGroupPrompts = [{ ...DEFAULT_TAB_GROUP_PROMPT }];
      merged.activeTabGroupPromptId = DEFAULT_TAB_GROUP_PROMPT.id;
    }
    return merged;
  },
  set: async (state: Partial<StorageState>) => {
    const current = await AppStorage.get();
    await browser.storage.local.set({ appState: { ...current, ...state } });
  },
  getActiveOpenAIProvider: async (): Promise<OpenAIProvider | undefined> => {
    const state = await AppStorage.get();
    return state.openaiProviders.find(p => p.id === state.activeOpenAIProviderId);
  },
  getActiveTabGroupPrompt: async (): Promise<SystemPrompt> => {
    const state = await AppStorage.get();
    return state.tabGroupPrompts.find(p => p.id === state.activeTabGroupPromptId)
      ?? state.tabGroupPrompts[0]
      ?? DEFAULT_TAB_GROUP_PROMPT;
  }
};

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}
