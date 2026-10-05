# Refactoring Execution Plan & Log

This document tracks the incremental, behavior-preserving refactoring of the BrowserBot extension across Chrome (MV3) and Firefox (MV2).

---

## Architecture Decision Records (ADRs)

- **ADR-01 (Manifest Permissions)**: Remove unused `'debugger'` permission from `wxt.config.ts`. The extension uses standard `browser.devtools.*` APIs, not `chrome.debugger`. Removing this eliminates severe security warnings during installation.
- **ADR-02 (Firefox Tab Groups Support)**: Retain native tab grouping support across both Chrome and Firefox. Firefox 138+ natively supports `browser.tabs.group()`, `browser.tabs.ungroup()`, and `browser.tabGroups` under the declared `"tabGroups"` permission. No artificial restrictions or warning banners will be added for Firefox.
- **ADR-03 (Storage Listeners)**: Both Chrome and Firefox (since Firefox 101) support `browser.storage.local.onChanged`. The existing CORS rule listener is valid in both browsers.
- **ADR-04 (Firefox MV2 Session Storage Fallback)**: In Firefox MV2, `browser.storage.session` is undefined (MV3 only). Implement a session storage fallback wrapper (`browser.storage.session ?? in-memory / local fallback`) so chat persistence and cross-tab sync work cleanly without throwing `TypeError`.
- **ADR-05 (Storage Concurrency)**: Implement an async sequential promise chain queue for `AppStorage.set` and `ConversationStorage.save` to eliminate read-modify-write race conditions where concurrent calls overwrite each other.
- **ADR-06 (Content Script Isolation)**: Remove dead passive monkey-patching (`console`, `fetch`, `XHR`) from `ask-page.content/index.tsx`. Content scripts run in an isolated world and cannot intercept host page traffic, and `AskDevtoolsPanel` inspects logs via `browser.devtools.inspectedWindow.eval` and network via HAR.
- **ADR-07 (Font Declarations Context)**: Preserve separate font loading mechanisms: `@font-face` in `chatStyles.ts` uses `browser.runtime.getURL()` for host webpage Shadow DOM (required due to CSP and relative path isolation), whereas extension pages (`popup`, `options`) use standard bundled stylesheet paths.
- **ADR-08 (Message Passing Type Safety)**: Implement a centralized discriminated union contract in `utils/messages.ts` to prevent payload omissions (such as missing `sessionId` in abort requests) and ensure all async handlers catch rejections.

---

## Verified Problem Status Matrix

| ID | File / Symbol | Original Category | Verified Status | Action in Plan |
|---|---|---|---|---|
| **PRB-01** | `AskDevtoolsPanel.tsx:678` | Hidden Bug (P0) | **CONFIRMED BUG** | Fix in Task 1: Pass `sessionId` in `ASK_PAGE_CHAT_ABORT` |
| **PRB-02** | `background.ts:85-91` | Cross-Browser (P0) | **FALSE ALARM** | Firefox 101+ natively supports `storage.local.onChanged`. No crash. Keep listener intact. |
| **PRB-03** | `background.ts:156,164,171` | Cross-Browser (P0) | **CONFIRMED BUG** | Fix in Task 2: Provide fallback for `storage.session` in Firefox MV2. |
| **PRB-04** | `popup/App.tsx:113,122` | Cross-Browser (P0) | **FALSE ALARM** | Firefox 138+ natively supports `tabs.group` & `tabGroups`. Feature works properly. No block. |
| **PRB-05** | `utils/storage.ts:278,316` | Concurrency (P0) | **CONFIRMED BUG** | Fix in Task 3: Wrap storage mutations in sequential async promise queue. |
| **PRB-06** | `floating-button.content:128` | Security / Crash (P0) | **CONFIRMED BUG** | Fix in Task 4: Replace host `localStorage` with extension storage with memory fallback. |
| **PRB-07** | `background.ts:140,145,194` | Messaging (P1) | **CONFIRMED BUG** | Fix in Task 5: Add `.catch()` handlers so async message channels never hang. |
| **PRB-08** | `floating-button.content:224` | Listener Leak (P1) | **CONFIRMED BUG** | Fix in Task 4: Cleanly unbind document/window listeners on unmount/invalidation. |
| **PRB-09** | `ask-page.content:12-107` | Dead Code (P1) | **CONFIRMED DEAD CODE** | Fix in Task 6: Delete 95 lines of inactive isolated-world monkey-patching. |
| **PRB-10** | `utils/ai.ts` vs `askPageAI.ts` | Duplication (P1) | **CONFIRMED DEBT** | Fix in Task 7: Consolidate common URL/header/body assembly into `utils/aiCommon.ts`. |
| **PRB-11** | `AskPagePanel.tsx` (1,403 lines) | Architecture (P1) | **CONFIRMED DEBT** | Fix in Task 9: Decompose into focused sub-components. |
| **PRB-12** | `AskDevtoolsPanel.tsx` (1,133 lines)| Architecture (P1) | **CONFIRMED DEBT** | Fix in Task 10: Extract inline `S.*` styles to dedicated module and split inspectors. |
| **PRB-13** | `AskPagePanel.tsx:448`, `AskDevtoolsPanel.tsx:643` | Bug (P1) | **CONFIRMED BUG** | Fix in Task 1: Prune empty `{ role: 'assistant', content: '' }` on stream error. |
| **PRB-14** | `wxt.config.ts:14-15` | Permissions (P1) | **CONFIRMED DEBT** | Fix in Task 6: Remove unused `'debugger'` permission. |
| **PRB-15** | `entrypoints/popup/App.css` | Dead Code (P2) | **CONFIRMED DEAD CODE** | Fix in Task 11: Delete unused template CSS file. |
| **PRB-16** | `build_*.txt` & missing `.output` | Repo / Git (P2) | **CONFIRMED DEBT** | Fix in Task 11: Untrack committed build logs and add `.output` to `.gitignore`. |
| **PRB-17** | `background.ts:116` | Dead Code (P2) | **CONFIRMED DEAD CODE** | Fix in Task 6: Remove uncalled `OPEN_CHAT_TAB` case. |
| **PRB-18** | CSS & Font declarations | Duplication (P2) | **PARTIAL FALSE ALARM** | Shadow DOM requires runtime URL injection; extension pages use stylesheets. Preserve context-specific font rules. |
| **PRB-19** | Multiple ID generators | Inconsistency (P2) | **CONFIRMED POLISH** | Fix in Task 8: Standardize on `generateUUID()` (RFC4122 v4 with crypto fallback). |
| **PRB-20** | `any` types in messaging | Type Safety (P1) | **CONFIRMED DEBT** | Fix in Task 5: Implement discriminated union message contract. |

---

## Phase 2 & 3: Master Task List

### Phase 2.1: Critical P0 Bug Fixes

- [x] **Task 1: Fix stream abort session tracking and dangling empty assistant messages**
  - **Problem IDs**: PRB-01, PRB-13
  - **Goal**: Ensure DevTools abort requests propagate `sessionId` so background can abort the active fetch; remove/prevent dangling `{ role: 'assistant', content: '' }` on `ASK_PAGE_CHAT_ERROR`.
  - **Files**: `entrypoints/devtools-panel/AskDevtoolsPanel.tsx`, `entrypoints/ask-page.content/AskPagePanel.tsx`
  - **Acceptance Criteria**: Aborting in DevTools aborts the background stream; on stream failure, no empty assistant message remains in state or is saved to storage.
  - **Estimated Diff**: ~50 lines
  - **Rollback Note**: Revert changes to `AskDevtoolsPanel.tsx` and `AskPagePanel.tsx`.
  - **Parallel-safe**: Yes

- [x] **Task 2: Firefox MV2 session storage fallback**
  - **Problem IDs**: PRB-03
  - **Goal**: Provide a safe session storage fallback wrapper (`browser.storage.session ?? browser.storage.local`) in background for Firefox MV2.
  - **Files**: `entrypoints/background.ts`, `utils/storage.ts`
  - **Acceptance Criteria**: `SAVE_CHAT`, `LOAD_CHAT`, and `CLEAR_CHAT` execute cleanly in Firefox MV2 without throwing `TypeError: browser.storage.session is undefined`.
  - **Estimated Diff**: ~45 lines
  - **Rollback Note**: Revert changes to `background.ts` and `storage.ts`.
  - **Parallel-safe**: No

- [ ] **Task 3: Concurrency-safe storage mutation queue**
  - **Problem IDs**: PRB-05
  - **Goal**: Eliminate read-modify-write race conditions in `AppStorage.set` and `ConversationStorage.save`.
  - **Files**: `utils/storage.ts`
  - **Acceptance Criteria**: Concurrent calls to `AppStorage.set` and `ConversationStorage.save` execute sequentially through an async promise queue without state clobbering.
  - **Estimated Diff**: ~50 lines
  - **Rollback Note**: Revert queue wrapper in `utils/storage.ts`.
  - **Parallel-safe**: No

- [ ] **Task 4: Floating button safe storage and listener lifecycle cleanup**
  - **Problem IDs**: PRB-06, PRB-08
  - **Goal**: Replace host `localStorage` with extension storage (with memory fallback) and cleanly remove all window/document listeners on unmount/invalidation.
  - **Files**: `entrypoints/floating-button.content/index.tsx`
  - **Acceptance Criteria**: No `SecurityError` thrown in restricted iframes/pages; dragging position persists; all event listeners cleanly removed on unmount.
  - **Estimated Diff**: ~80 lines
  - **Rollback Note**: Revert changes to `floating-button.content/index.tsx`.
  - **Parallel-safe**: Yes

---

### Phase 2.2: Safety Nets & Message Contracts (P1)

- [ ] **Task 5: Strongly typed runtime message contract and unhandled rejection guards**
  - **Problem IDs**: PRB-07, PRB-20
  - **Goal**: Introduce a centralized discriminated union for all extension runtime messages; add `.catch()` to all async message handlers in `background.ts`.
  - **Files**: `utils/messages.ts` (new), `entrypoints/background.ts`
  - **Acceptance Criteria**: All `browser.runtime.sendMessage` message types and payloads are strongly typed; background promise rejections respond with `{ error }` and never hang caller.
  - **Estimated Diff**: ~170 lines
  - **Rollback Note**: Delete `utils/messages.ts` and revert `background.ts`.
  - **Parallel-safe**: No

---

### Phase 2.3: Foundational Architectural Cleanup & Dead Code Removal (P1, P2)

- [ ] **Task 6: Remove dead content script monkey-patching, unused `debugger` permission, and dead handler**
  - **Problem IDs**: PRB-09, PRB-14, PRB-17
  - **Goal**: Delete 95 lines of inactive isolated-world console/fetch monkey-patching; remove `'debugger'` permission from `wxt.config.ts`; remove uncalled `OPEN_CHAT_TAB` handler.
  - **Files**: `entrypoints/ask-page.content/index.tsx`, `wxt.config.ts`, `entrypoints/background.ts`
  - **Acceptance Criteria**: Builds pass for Chrome and Firefox; manifest does not request `debugger`; no passive console interception in content script.
  - **Estimated Diff**: -120 lines
  - **Rollback Note**: Revert changes to `ask-page.content/index.tsx`, `wxt.config.ts`, `background.ts`.
  - **Parallel-safe**: Yes

- [ ] **Task 7: Consolidate duplicated AI client plumbing**
  - **Problem IDs**: PRB-10
  - **Goal**: Extract common provider URL normalization, header construction, Ollama request bodies, and Chrome AI availability checks into `utils/aiCommon.ts`.
  - **Files**: `utils/aiCommon.ts` (new), `utils/ai.ts`, `utils/askPageAI.ts`
  - **Acceptance Criteria**: Zero duplication of endpoint normalization, headers, and body assembly; streaming and non-streaming behaviors identical.
  - **Estimated Diff**: ~180 lines
  - **Rollback Note**: Delete `utils/aiCommon.ts` and revert `utils/ai.ts` and `utils/askPageAI.ts`.
  - **Parallel-safe**: No

- [ ] **Task 8: Standardize ID generation**
  - **Problem IDs**: PRB-19
  - **Goal**: Standardize on RFC4122 v4 UUID generator (`generateUUID`) across storage, chat, and sessions; deprecate redundant generators.
  - **Files**: `utils/storage.ts`, `entrypoints/popup/App.tsx`
  - **Acceptance Criteria**: Uniform UUID format across all generated entity IDs.
  - **Estimated Diff**: ~30 lines
  - **Rollback Note**: Revert changes to `utils/storage.ts` and `App.tsx`.
  - **Parallel-safe**: Yes

---

### Phase 2.4: Local Cleanups & Component Decomposition (P1, P2)

- [ ] **Task 9: Decompose `AskPagePanel.tsx` (Sub-components extraction)**
  - **Problem IDs**: PRB-11
  - **Goal**: Split 1,403-line monolithic component into focused sub-components (`TabSelector`, `SlashCommands`, `ChatHeader`, `MessageList`) while strictly preserving styling and state.
  - **Files**: `entrypoints/ask-page.content/AskPagePanel.tsx`, `entrypoints/ask-page.content/components/*`
  - **Acceptance Criteria**: `AskPagePanel.tsx` lines reduced to < 600; all tabs, prompts, resize handlers, and chat streaming function identically.
  - **Estimated Diff**: ~260 lines
  - **Rollback Note**: Revert `AskPagePanel.tsx` and delete `entrypoints/ask-page.content/components/`.
  - **Parallel-safe**: No

- [ ] **Task 10: Decompose `AskDevtoolsPanel.tsx` (Extract styles and inspectors)**
  - **Problem IDs**: PRB-12
  - **Goal**: Extract 400+ lines of inline style objects (`S.*`) to `devtoolsStyles.ts` and extract inspector tabs into sub-components.
  - **Files**: `entrypoints/devtools-panel/AskDevtoolsPanel.tsx`, `entrypoints/devtools-panel/devtoolsStyles.ts`, `entrypoints/devtools-panel/components/*`
  - **Acceptance Criteria**: DevTools UI renders identically; `AskDevtoolsPanel.tsx` lines reduced to < 500 lines.
  - **Estimated Diff**: ~280 lines
  - **Rollback Note**: Revert `AskDevtoolsPanel.tsx` and delete extracted files.
  - **Parallel-safe**: No

- [ ] **Task 11: Remove unused template CSS and untrack build artifacts**
  - **Problem IDs**: PRB-15, PRB-16
  - **Goal**: Delete unused `popup/App.css` and root `build_*.txt`; add `.output` to `.gitignore` and untrack `.output/` from git index.
  - **Files**: `entrypoints/popup/App.css` (delete), `build_*.txt` (delete), `.gitignore`
  - **Acceptance Criteria**: Root directory clean of build logs; `.output` ignored by git; builds remain clean.
  - **Estimated Diff**: ~30 lines
  - **Rollback Note**: Revert deleted files and `.gitignore`.
  - **Parallel-safe**: Yes

---

### Phase 2.5: Documentation & Architecture Map (Definition of Done)

- [ ] **Task 12: Create `ARCHITECTURE.md` and complete refactoring sign-off**
  - **Problem IDs**: Definition of Done
  - **Goal**: Produce clear architectural documentation detailing module boundaries, message contracts, storage lifecycles, and cross-browser guarantees.
  - **Files**: `ARCHITECTURE.md`, `REFACTORING.md`
  - **Acceptance Criteria**: Complete architectural overview; all tasks verified and checked off.
  - **Estimated Diff**: ~220 lines
  - **Rollback Note**: Revert `ARCHITECTURE.md`.
  - **Parallel-safe**: Yes
