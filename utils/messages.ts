import type { ChatMessage } from './askPageAI';
import type { Conversation, ChatMsg, AIProviderType, ExtractionAlgorithm } from './storage';

// ─── Discriminated union of all runtime messages across BrowserBot ───

export interface TabListItem {
  id: number;
  title: string;
  url: string;
  favIconUrl: string;
}

export interface TabContentResult {
  tabId: number;
  title: string;
  url: string;
  content: string;
}

export type RuntimeMessage =
  | { type: 'TOGGLE_ASK_PAGE'; pageTitle?: string; pageUrl?: string }
  | {
      type: 'ASK_PAGE_CHAT';
      messages: ChatMessage[];
      providerType?: AIProviderType;
      openaiProviderId?: string;
      sessionId?: string;
    }
  | { type: 'ASK_PAGE_CHAT_ABORT'; sessionId?: string }
  | { type: 'GET_TAB_LIST' }
  | { type: 'GET_TAB_CONTENT'; tabId: number }
  | { type: 'SAVE_PANEL_WIDTH'; width: number }
  | { type: 'SAVE_CHAT'; messages: ChatMsg[] }
  | { type: 'LOAD_CHAT' }
  | { type: 'CLEAR_CHAT' }
  | { type: 'SAVE_CONVERSATION'; conversation: Conversation }
  | { type: 'LOAD_CONVERSATIONS' }
  | { type: 'DELETE_CONVERSATION'; id: string }
  | { type: 'CHECK_CHROME_AI' }
  | { type: 'DOWNLOAD_CHROME_AI' }
  | { type: 'GET_BOOKMARKS' }
  | { type: 'EXTRACT_PAGE_CONTENT'; algorithm?: ExtractionAlgorithm }
  | { type: 'CHAT_UPDATED'; messages: ChatMsg[] }
  | { type: 'CHROME_AI_DOWNLOAD_PROGRESS'; progress: number }
  | { type: 'ASK_PAGE_CHAT_CHUNK'; chunk: string; sessionId?: string }
  | { type: 'ASK_PAGE_CHAT_THINKING'; chunk: string; sessionId?: string }
  | { type: 'ASK_PAGE_CHAT_DONE'; sessionId?: string }
  | { type: 'ASK_PAGE_CHAT_ERROR'; error: string; sessionId?: string };
