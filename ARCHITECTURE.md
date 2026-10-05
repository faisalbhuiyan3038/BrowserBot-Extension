# BrowserBot Extension Architecture

## 1. System Overview

BrowserBot is a cross-browser extension built using the [WXT Framework](https://wxt.dev/) with Vite and React 19. It runs simultaneously on:
- **Google Chrome** (Manifest V3)
- **Mozilla Firefox** (Manifest V2, compiled via WXT)

The extension empowers users to interact with multiple AI models directly in their browser for:
1. **Multi-Provider AI Orchestration**: Real-time streaming from Chrome built-in AI (`window.ai`), Ollama (local LLMs), and OpenAI-compatible providers (OpenAI, DeepSeek, Groq, OpenRouter, self-hosted endpoints).
2. **In-Page AI Experience (`ask-page.content`)**: Interactive overlay on web pages allowing full chat, tab selection context, slash commands, and structured page manipulation.
3. **DevTools Debugger (`devtools-panel`)**: Live capture and granular inspection of network (HAR), console logs, DOM elements ($0), and page performance metrics for AI-assisted debugging.
4. **Tab & Bookmark Management**: Programmatic grouping, deduplication, and bookmark organization powered by heuristics and AI actions.

---

## 2. Directory Structure & Module Boundaries

```
BrowserBot-Extension/
├── entrypoints/
│   ├── background.ts                  # Background service worker (Chrome) / background script (Firefox)
│   ├── ask-page.content/              # In-page chat overlay content script
│   │   ├── index.tsx                  # Shadow DOM / UI mounter
│   │   ├── AskPagePanel.tsx           # Orchestration container & state management
│   │   ├── types.ts                   # UI component contracts & TabInfo
│   │   └── components/                # Decomposed UI components
│   │       ├── ChatHeader.tsx         # Title bar, provider selector, minimize/close controls
│   │       ├── HistorySidebar.tsx     # Past chat conversations drawer with search
│   │       ├── MessageList.tsx        # Chat messages, streaming indicators, reasoning blocks
│   │       ├── SlashMenu.tsx          # Quick command picker (/summarize, /extract, etc.)
│   │       └── TabPickerModal.tsx     # Multi-tab context attachment modal
│   ├── devtools-panel/                # Browser DevTools debugger tab
│   │   ├── index.html / main.tsx      # Entry mounting
│   │   ├── AskDevtoolsPanel.tsx       # DevTools state & data coordinator
│   │   ├── types.ts                   # Capture configs, log/network contracts, initiator heuristic
│   │   ├── devtoolsStyles.ts          # Extracted styling tokens & responsive layout styles
│   │   └── components/
│   │       ├── DevtoolsSidebar.tsx    # Capture configuration, source toggles, snapshot controls
│   │       └── DevtoolsChatArea.tsx   # Chat history, reasoning block, messages, input composer
│   ├── floating-button.content/       # Persistent floating button trigger on web pages
│   ├── chat/                          # Dedicated standalone chat tab UI
│   ├── popup/                         # Browser action popup (tab & bookmark manager)
│   └── options/                       # Settings page (API keys, provider configurations)
├── utils/                             # Core cross-browser services (auto-imported by WXT)
│   ├── storage.ts                     # Persistent AppStorage, SessionChatStorage, lock queues, UUIDs
│   ├── messages.ts                    # Strongly typed runtime message contracts
│   ├── aiCommon.ts                    # AI model providers, client builders, and tokenizers
│   ├── askPageAI.ts                   # Page context gathering & streaming AI orchestration
│   ├── ai.ts                          # Background AI actions and prompt templates
│   ├── tabUtils.ts                    # Tab manipulation, grouping algorithms, URL utilities
│   └── logger.ts                      # Inspected window console interception scripts
├── wxt.config.ts                      # WXT build configuration & manifest declarations
└── package.json
```

---

## 3. Runtime Message Contracts (`utils/messages.ts`)

All communication between background, popup, devtools, and content scripts passes through `browser.runtime.sendMessage` and `browser.runtime.onMessage` using strongly typed discriminated unions:

| Message Type | Direction | Payload | Description |
|---|---|---|---|
| `ASK_PAGE_CHAT` | Content/DevTools → BG | `messages`, `providerType`, `openaiProviderId`, `sessionId` | Dispatches streaming chat to the selected AI provider |
| `ASK_PAGE_CHAT_CHUNK` | BG → Content/DevTools | `chunk`, `sessionId` | Text delta streamed back to the active session |
| `ASK_PAGE_CHAT_THINKING` | BG → Content/DevTools | `chunk`, `sessionId` | Reasoning/thinking token delta (e.g. DeepSeek-R1) |
| `ASK_PAGE_CHAT_DONE` | BG → Content/DevTools | `sessionId` | Signals completion of streaming stream |
| `ASK_PAGE_CHAT_ERROR` | BG → Content/DevTools | `error`, `sessionId` | Signals stream failure and triggers cleanup |
| `ASK_PAGE_CHAT_ABORT` | Content/DevTools → BG | `sessionId` | Aborts ongoing stream for the matching `sessionId` |
| `ASK_PAGE_CLOSE` | Content → BG | none | Closes and unmounts the in-page chat overlay |
| `GET_FULL_CONTEXT` | Content/DevTools → BG | none | Fetches system prompt and settings snapshot |
| `EXECUTE_ACTION` | Content/Popup → BG | `action` | Executes browser mutations (close tabs, group tabs, bookmarks) |
| `CHECK_AI_AVAILABILITY`| Content/Popup → BG | none | Checks availability of Chrome built-in AI API |

### Concurrency & Isolation Guarantee
Streaming operations require a unique `sessionId` (RFC4122 v4 UUID). This prevents cross-talk or race conditions when multiple tabs or DevTools panels stream AI responses simultaneously. When `ASK_PAGE_CHAT_ABORT` or `ASK_PAGE_CHAT_ERROR` fires, only the session matching `sessionId` is affected.

---

## 4. Storage Architecture & Concurrency (`utils/storage.ts`)

Browser extensions store data asynchronously across multiple processes. BrowserBot employs a dual-tier storage strategy:

### 1. `AppStorage` (Persistent Data)
- Backed by `browser.storage.local`.
- Stores API keys, custom endpoints, user preferences, prompt templates, and conversation history.
- Mutated exclusively via `withLock<T>()`: a promise chain queue with exponential backoff retry logic that prevents lost updates caused by concurrent read-modify-write calls across tabs.

### 2. `SessionChatStorage` (Ephemeral Data)
- Backed by `browser.storage.session` in Chrome MV3.
- Automatically falls back to `browser.storage.local` with a `_session:` prefix in Firefox MV2 (where `storage.session` is unavailable).
- Automatically clears session-prefixed entries on extension startup in Firefox to maintain ephemeral session semantics.

### 3. ID Generation Standard
- All entities (`Conversation.id`, `Message.id`, `Session.id`, `OpenAIProvider.id`) use RFC4122 v4 UUIDs generated via `generateUUID()`.

---

## 5. AI Provider Plumbing (`utils/aiCommon.ts`)

AI requests are unified into a single abstraction layer:
- **`AIProviderType`**: `'openai' | 'ollama' | 'chrome_ai'`.
- **OpenAI-Compatible Providers**: Configured dynamically in Options (supports base URL, auth token, model ID, temperature, top_p, and custom headers).
- **Chrome Built-In AI**: Interfaces with `window.ai.languageModel` when supported, with capabilities checks and graceful fallbacks.
- **Ollama**: Interfaces with local daemon endpoints with automatic model availability detection.

---

## 6. Cross-Browser Guarantees (Chrome MV3 vs. Firefox MV2)

| Feature / API | Chrome MV3 | Firefox MV2 | Solution / Guarantee |
|---|---|---|---|
| **Background Execution** | Service Worker (terminates when idle) | Background Page (persistent) | Background script avoids long-lived in-memory state; uses storage locks and declarative listeners |
| **Session Storage** | `browser.storage.session` | Not supported in MV2 | `SessionChatStorage` detects availability and falls back to `browser.storage.local` with key prefixing |
| **Content Script Invalidation** | Throws `Extension context invalidated` on reload | Throws `Extension context invalidated` on reload | `floating-button` catches errors on storage access and falls back to in-memory/window storage |
| **DevTools Network HAR Initiator** | Exposes `entry._initiator.type` | Does not populate `_initiator` | `inferInitiator()` applies heuristic cascade (MIME, URL extension, Referer header, resource type) |
| **Performance Metrics** | Exposes `performance.memory` & `first-paint` | Memory and `first-paint` unavailable | Evaluator queries `first-contentful-paint` and returns informative notes to AI when memory metrics are absent |
| **Extension Permissions** | Declared in `wxt.config.ts` | Filtered per manifest requirements | Minimal permissions used: removed unused `'debugger'` permission |

---

## 7. Developer Guidelines

1. **Zero Unverifiable Commits**: Always verify any change across both builds before committing:
   ```bash
   npm run compile          # TypeScript strict typecheck
   npm run build            # Chrome MV3 production build
   npm run build:firefox    # Firefox MV2 production build
   ```
2. **Preserve Message Signatures**: Any addition to `RuntimeMessage` in `utils/messages.ts` must include an exhaustive handler in `entrypoints/background.ts`.
3. **Use `withLock` for Storage Mutations**: Never read `AppStorage.get()`, modify it, and write back without using `withLock()` if other contexts might mutate it concurrently.
4. **Avoid Top-Level Re-Exports in `utils/`**: WXT automatically auto-imports symbols exported by any file in `utils/`. Creating proxy exports across utility files causes Vite duplicate identifier warnings.
