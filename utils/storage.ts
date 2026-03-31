export type AIProviderType = 'ollama' | 'openai' | 'chrome_ai';
export type ExtractionAlgorithm = 1 | 2 | 3;

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

// ─── Chat message used in conversations ─────────────────────
export interface ChatMsg {
  role: 'user' | 'assistant' | 'error';
  content: string;
  thinking?: string;  // reasoning/thinking content if available
}

// ─── Conversation stored in chat history ────────────────────
export interface Conversation {
  id: string;
  title: string;
  createdAt: number;   // timestamp ms
  updatedAt: number;
  pageUrl: string;
  pageTitle: string;
  messages: ChatMsg[];
}

// ─── Available template variables for tab grouping prompts ───
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

// ─── Available template variables for Ask Page prompts ───
export const ASK_PAGE_PROMPT_VARIABLES: { key: string; description: string }[] = [
  { key: '{pageTitle}',     description: 'Title of the current page' },
  { key: '{pageUrl}',       description: 'URL of the current page' },
  { key: '{pageContent}',   description: 'Extracted text content of the current page' },
  { key: '{selectedText}',  description: 'Currently selected text on the page' },
  { key: '{tabContext}',    description: 'Content from attached tabs' },
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

  // Ask Page config
  askPageSystemPrompt: string;        // always-active system prompt
  askPagePrompts: SystemPrompt[];     // quick prompts (reusable templates)
  askPagePanelWidth: number;
  askPagePersistChat: boolean;
  askPageAutoDeleteDays: number;      // 0 = never, 7/14/30/custom
  askPageMaxConversations: number;    // max stored conversations
  pageExtractionAlgorithm: ExtractionAlgorithm;  // 1=Text, 2=Optimized, 3=Full
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

// ─── Default Ask Page System Prompt ─────────────────────────
export const DEFAULT_ASK_PAGE_SYSTEM_PROMPT = `You are a helpful AI assistant. The user is viewing a webpage and may ask questions about it or any attached tab context.

Page Title: {pageTitle}
Page URL: {pageUrl}

Answer the user's questions clearly and concisely. Use markdown formatting for well-structured responses.`;

// ─── Built-in Ask Page Quick Prompts (reusable templates) ───
export const BUILTIN_ASK_PAGE_QUICK_PROMPTS: SystemPrompt[] = [
  {
    id: 'askpage-summarize',
    name: 'Summarize',
    prompt: `Please provide a comprehensive summary of this page. Include key points, main arguments, and important details. Structure with headings and bullet points.`
  },
  {
    id: 'askpage-qa',
    name: 'Q&A',
    prompt: `Based on the content of this page, answer the following question in detail. Quote relevant parts when applicable.`
  },
  {
    id: 'askpage-explain',
    name: 'Explain Simply',
    prompt: `Explain the main concepts from this page in simple, easy-to-understand language. Use analogies and examples where helpful.`
  },
  {
    id: 'askpage-extract',
    name: 'Extract Key Info',
    prompt: `Extract and list the most important information from this page: key facts, dates, names, numbers, and actionable items. Present as a structured list.`
  },
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
  activeTabGroupPromptId: 'builtin-default',

  // Ask Page defaults
  askPageSystemPrompt: DEFAULT_ASK_PAGE_SYSTEM_PROMPT,
  askPagePrompts: BUILTIN_ASK_PAGE_QUICK_PROMPTS.map(p => ({ ...p })),
  askPagePanelWidth: 420,
  askPagePersistChat: false,
  askPageAutoDeleteDays: 0,       // 0 = never auto-delete
  askPageMaxConversations: 100,
  pageExtractionAlgorithm: 1 as ExtractionAlgorithm,  // default: Text Extraction
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
    // Ensure system prompt exists
    if (!merged.askPageSystemPrompt) {
      merged.askPageSystemPrompt = DEFAULT_ASK_PAGE_SYSTEM_PROMPT;
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
  },
  // ─── Full state export (for import/export) ──────────
  exportAll: async (): Promise<string> => {
    const state = await AppStorage.get();
    const conversations = await ConversationStorage.loadAll();
    return JSON.stringify({ settings: state, conversations }, null, 2);
  },
  importAll: async (json: string): Promise<void> => {
    const data = JSON.parse(json);
    if (data.settings) {
      await browser.storage.local.set({ appState: { ...defaultState, ...data.settings } });
    }
    if (data.conversations && Array.isArray(data.conversations)) {
      await browser.storage.local.set({ askPageConversations: data.conversations });
    }
  }
};

// ─── Conversation Storage (separate key) ────────────────────
export const ConversationStorage = {
  loadAll: async (): Promise<Conversation[]> => {
    const val = await browser.storage.local.get('askPageConversations');
    return (val.askPageConversations as Conversation[]) || [];
  },

  save: async (conversation: Conversation): Promise<void> => {
    const all = await ConversationStorage.loadAll();
    const idx = all.findIndex(c => c.id === conversation.id);
    if (idx >= 0) {
      all[idx] = conversation;
    } else {
      all.unshift(conversation);
    }

    // Enforce max limit
    const state = await AppStorage.get();
    const maxConvs = state.askPageMaxConversations || 100;
    const trimmed = all.slice(0, maxConvs);

    await browser.storage.local.set({ askPageConversations: trimmed });
  },

  delete: async (id: string): Promise<void> => {
    const all = await ConversationStorage.loadAll();
    const filtered = all.filter(c => c.id !== id);
    await browser.storage.local.set({ askPageConversations: filtered });
  },

  clearOld: async (days: number): Promise<number> => {
    if (days <= 0) return 0;
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const all = await ConversationStorage.loadAll();
    const kept = all.filter(c => c.updatedAt >= cutoff);
    const removed = all.length - kept.length;
    if (removed > 0) {
      await browser.storage.local.set({ askPageConversations: kept });
    }
    return removed;
  }
};

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}
