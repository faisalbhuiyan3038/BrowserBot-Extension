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

Group these {tabCount} tabs into logical categories.`
};

export const BUILTIN_SMART_PROMPT: SystemPrompt = {
  id: 'builtin-smart',
  name: 'Smart Grouper',
  prompt: `As an AI assistant, analyze and organize these {tabCount} browser tabs into meaningful groups. Here are open tabs: 
{tabList}

Follow these specific guidelines:
1. Create intuitive groups that reflect how users naturally organize their work and activities
2. Use short, clear category names (1-2 words) that instantly convey the purpose
3. Consider tab relationships based on:
   - Common domains or platforms
   - Related topics or projects
   - Similar purposes (research, shopping, etc.)
   - Temporal context (current tasks vs reference material)
4. Rules:
- Create 3-8 groups based on tab count and content similarity
- not to make too many groups
- Use short, clear category names (1-2 words, try just 1 word)
- Keep groups focused and cohesive
- Each tab must be assigned to exactly one group
- Group related items even if from different domains`
};

export const BUILTIN_CONTEXT_PROMPT: SystemPrompt = {
  id: 'builtin-context',
  name: 'Context-Aware',
  prompt: `Analyze the provided list of tab data and assign a concise category (1-2 words, Title Case) for EACH tab.

Existing Categories:
{existingGroups}
---
Instructions for Assignment:
1.  **Prioritize Existing:** For each tab below, determine if it clearly belongs to one of the 'Existing Categories'. Base this primarily on the URL/Domain, then Title/Description. If it fits, you MUST use the EXACT category name provided in the 'Existing Categories' list. DO NOT create a minor variation (e.g., if 'Project Docs' exists, use that, don't create 'Project Documentation').
2.  **Assign New Category (If Necessary):** Only if a tab DOES NOT fit an existing category, assign the best NEW concise category (1-2 words, Title Case).
4.  **Format:** 1-2 words, Title Case.
---
Input Tab Data:
{tabList}`
};

export const ALL_BUILTIN_PROMPTS: SystemPrompt[] = [
  DEFAULT_TAB_GROUP_PROMPT,
  BUILTIN_SMART_PROMPT,
  BUILTIN_CONTEXT_PROMPT
];

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
  tabGroupPrompts: ALL_BUILTIN_PROMPTS.map(p => ({ ...p })),
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
