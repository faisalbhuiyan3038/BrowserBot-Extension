export type AIProviderType = 'ollama' | 'openai' | 'chrome_ai';

export interface OpenAIProvider {
  id: string;
  name: string;
  endpoint: string;
  apiKey: string;
  model: string;
  reasoning: boolean;
}

export interface StorageState {
  activeProvider: AIProviderType;
  activeOpenAIProviderId: string;
  ollamaEndpoint: string;
  ollamaModel: string;
  openaiProviders: OpenAIProvider[];
  systemPrompt: string;
}

export const defaultSystemPrompt = `You are an AI assistant helping categorize browser tabs.
I will provide you a list of open tabs with their URLs and Titles.
Your task is to group them into logical categories.

Return a JSON object with the following structure:
{
  "categories": [
    {
      "name": "Category Name (e.g. Work, News, Social)",
      "color": "blue", // must be one of: grey, blue, red, yellow, green, pink, purple, cyan, orange
      "tabIds": [1, 2, 3] // array of tab IDs belonging to this category
    }
  ]
}

Only return valid JSON, no markdown blocks or conversational text.`;

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
  systemPrompt: defaultSystemPrompt
};

export const AppStorage = {
  get: async (): Promise<StorageState> => {
    const val = await browser.storage.local.get('appState');
    return val.appState ? { ...defaultState, ...val.appState } : { ...defaultState };
  },
  set: async (state: Partial<StorageState>) => {
    const current = await AppStorage.get();
    await browser.storage.local.set({ appState: { ...current, ...state } });
  },
  getActiveOpenAIProvider: async (): Promise<OpenAIProvider | undefined> => {
    const state = await AppStorage.get();
    return state.openaiProviders.find(p => p.id === state.activeOpenAIProviderId);
  }
};

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}
