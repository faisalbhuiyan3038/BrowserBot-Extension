# Goal Description

The user has requested a comprehensive overhaul of how DevTools context is captured, structured, and presented to the AI. This includes adding a top-level metadata block, a network summary table, granular toggles for specific mime-types (CSS, HTML, JS) and cookie value inclusion, safe limits on massive payload sizes, improved `console.log` object serialization, and global error tracking.

## User Review Required

- For the **Network Request Size Threshold**, I will implement a 50KB limit by default. If a request body exceeds this, it will be skipped unless the "Allow Large Bodies (>50KB)" toggle is explicitly enabled. Is 50KB the right default for your workflow?
- For **Network Mode**, I will add a dropdown to select between "Summary Table Only", "Full Details", or "Both". The summary table will always list all requests that you captured, even if you uncheck some from the detailed dump below.

## Proposed Changes

### Phase 1: Data Capture & Injection Upgrades
#### [MODIFY] `m:\.systemfile\BrowserBot-Extension\entrypoints\devtools-panel\AskDevtoolsPanel.tsx`
- **Global Error Tracking**: Update the `injectLogger` script to add `window.addEventListener('error', ...)` and `unhandledrejection` to catch deep JS crashes.
- **Console Serialization**: Modify the console monkey-patch (`console.log`, `console.error`) to use a safe stringification method that converts objects (e.g. `{a: 1}`) into readable JSON strings rather than `[object Object]`, and explicitly captures `Error.stack`.
- **Metadata Extraction**: Add a new `eval` call during capture to extract `window.location.href`, `document.title`, `navigator.userAgent`, `innerWidth/Height` (viewport), `localStorage/sessionStorage` keys, and basic framework detection (`window.angular`, `window.React`, `window.__vue__`).
- **HAR Enrichment**: Use `entry._initiator?.type` from the HAR payload to identify the request initiator type (fetch, xhr, script).

### Phase 2: System Prompt Formatting & Trimming
#### [MODIFY] `m:\.systemfile\BrowserBot-Extension\entrypoints\devtools-panel\AskDevtoolsPanel.tsx`
- **Capture Metadata Block**: Prepend the AI prompt with a structured `## Capture Metadata` block.
- **Cookie & Header Trimming**: Modify the Header extraction logic to automatically strip out the `Cookie` and `Set-Cookie` headers (since they are processed separately).
- **Cookie Values**: Adjust the cookie stringifier to only output `name` by default, or `name=value` if the new toggle is enabled.
- **Network Summary Table**: Implement a markdown table generation for the network summary containing URL, Method, Status, Time, Size, and Flags (e.g., `⚠️ SLOW` if >1000ms, `❌ FAILED` if status >= 400).
- **Payload Limits**: In the lazy fetching logic, skip bodies exceeding 50KB unless the user toggle is checked.
- **Mime-Type Filtering**: Prevent fetching bodies for `text/html`, `text/css`, or `application/javascript` if their respective toggles are disabled.

### Phase 3: UI Updates
#### [MODIFY] `m:\.systemfile\BrowserBot-Extension\entrypoints\devtools-panel\AskDevtoolsPanel.tsx`
- Update the `DevToolsConfig` interface and Sidebar UI to include the new toggles:
  - Dropdown: Network Format (`summary`, `details`, `both`)
  - Checkboxes: `Include HTML Bodies`, `Include CSS Bodies`, `Include JS Bodies`
  - Checkboxes: `Include Cookie Values` (keys only by default)
  - Checkboxes: `Allow Large Bodies (>50KB)`

## Verification Plan
### Automated Tests
- Build via `npm run build`.
### Manual Verification
- Capture a snapshot and copy context.
- Verify the `## Capture Metadata` block is present and accurate.
- Verify the Markdown Summary Table renders correctly.
- Ensure large bodies or specific mime-types are omitted unless explicitly toggled.
- Test that logging an object to the console successfully captures its JSON shape.
