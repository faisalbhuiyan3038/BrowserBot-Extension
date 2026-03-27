export type AIProvider = 'ollama' | 'openai' | 'chrome_ai';

export interface StorageState {
  provider: AIProvider;
  ollamaEndpoint: string;
  ollamaModel: string;
  openaiEndpoint: string;
  openaiKey: string;
  openaiModel: string;
  systemPrompt: string;
}

export const defaultState: StorageState = {
  provider: 'chrome_ai',
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'llama3',
  openaiEndpoint: 'https://api.openai.com/v1',
  openaiKey: '',
  openaiModel: 'gpt-4o',
  systemPrompt: `You are an AI assistant helping categorize browser tabs.
I will provide you a list of open tabs with their URLs and Titles.
Your task is to group them into logical categories.

Return a JSON object with the following structure:
{
  "categories": [
    {
      "name": "Category Name (e.g. Work, News, Social)",
      "color": "blue", // must be one of: grey, blue, red, yellow, green, pink, purple, cyan
      "tabIds": [1, 2, 3] // array of tab IDs belonging to this category
    }
  ]
}

Only return valid JSON, no markdown blocks or conversational text.`
};

export const AppStorage = {
  get: async (): Promise<StorageState> => {
    const val = await browser.storage.local.get('appState');
    return val.appState ? { ...defaultState, ...val.appState } : defaultState;
  },
  set: async (state: Partial<StorageState>) => {
    const current = await AppStorage.get();
    await browser.storage.local.set({ appState: { ...current, ...state } });
  }
};
