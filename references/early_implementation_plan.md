# AI Web Session Integration Plan

This plan details how the reference extension leverages active web sessions for AI providers (ChatGPT, Gemini, Grok) and Open API-compatible endpoints, and provides a clear guide on how to implement this architecture in your own extension.

## Overview of Operation
The core mechanism behind using web sessions for AI inferences is making cross-origin requests from the browser extension's background script (or service worker) while using the user's existing login cookies.

By declaring `<all_urls>` or specific domain permissions (like `*://*.chatgpt.com/*`) in the `manifest.json`, the extension gains the right to make API calls to those servers. When `fetch` is executed with `credentials: "include"`, the browser automatically attaches the authentication cookies, making the request appear as if it was executed by the user directly on the platform.

### Provider Breakdown

1. **ChatGPT (chatgpt.com)**
   - **Methodology**: The background script hits endpoints like `/api/auth/session` to obtain an access token and `user-agent` mappings.
   - **Streaming Responses**: Uses the `/backend-api/conversation` endpoint with standard payloads (`model`, `messages`, `parent_message_id`).
   - **Anti-Bot Circumvention**: You will observe the extension runs a script called `cs-openai.js`. This content script solves the OpenAI Arkose challenge by hooking into `window.fetch` and `appendChild`. It intercepts validation tokens to ensure the `/backend-api/conversation` requests succeed without throwing 403 Forbidden errors.

2. **Gemini (gemini.google.com)**
   - **Methodology**: Hits internal Google APIs (usually `batchexecute` RPCs or native Gemini backend endpoints) bypassing standard REST conventions. 
   - **Authentication**: Relies entirely on the user's existing Google login context. The extension has to parse highly nested JSON arrays to extract the answer chunks.

3. **Grok (grok.com)**
   - **Methodology**: The extension directly hits the Grok API web endpoints, interacting similarly to ChatGPT by simulating the web app payload with `credentials` attached. 
   - **Authentication**: It leverages cookies from the `grok.com` domain.

4. **Open API Compatible APIs**
   - **Methodology**: Simple integration using standard REST API standard (e.g., POST `https://api.openai.com/v1/chat/completions`). 
   - **Authentication**: Requires the user to enter and store their own API key (e.g. `Bearer sk-...`) in the extension settings.

---

## Proposed Implementation Steps

To replicate this functionality in your extension, you will implement the following steps:

### 1. Update Permissions
Modify your `manifest.json` to include the necessary `host_permissions` for the AI web domains.
```json
{
  "host_permissions": [
    "*://chatgpt.com/*",
    "*://gemini.google.com/*",
    "*://grok.com/*",
    "*://api.openai.com/*" // For custom APIs
  ]
}
```

### 2. Implement the API Controllers 
Create an abstraction layer in your background service worker that standardizes the interaction with the different models. 
- For each provider, define their specific conversational endpoints and payload shapes.
- Use `fetch` configuration:
```javascript
fetch('https://chatgpt.com/backend-api/conversation', {
  method: 'POST',
  headers: {
    'Accept': 'text/event-stream',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  credentials: 'omit', // or 'include' based on the provider approach
  body: JSON.stringify(payload)
})
```

### 3. Handle Streaming Responses (SSE)
Implement a parser for `text/event-stream`.
- Capture the `response.body.getReader()`.
- Use a TextDecoder to parse the chunks as they stream in.
- Parse the `data: {...}` lines to extract the token text and emit events to your frontend UI via `chrome.runtime.sendMessage`.

### 4. Inject Content Scripts for Bot Mitigation (Crucial for ChatGPT)
Like `cs-openai.js`, you must create a content script running on `chatgpt.com`.
- OpenAI uses Arkose labs for bot protection. Web-session calls often fail if this token isn't validated. 
- The content script must either solve, bridge, or retrieve valid sentinel tokens and send them to your background script to attach to your `fetch` requests.

### 5. Build the Open API Fallback
A straightforward feature that relies on `chrome.storage.local` to retrieve a provided API Key, and uses standard HTTP Post requests for `api.openai.com` (or AnyScale, Groq, TogetherAI, etc.).

## Open Questions

> [!WARNING]
> Before we start writing code for this extension logic, I need to know:
> 1. Do you want to build support for **all** three web session providers (ChatGPT, Gemini, Grok) in this phase, or start with just one (e.g. ChatGPT + Open API)?
> 2. Web session APIs change frequently (especially Gemini's internal payload structure). Do you currently have up-to-date payload specifications, or would you like me to generate standard reference code for them based on known generic structures?
> 3. Does your extension currently use Manifest V3 with a dedicated Service Worker?

## Verification Plan
1. **Manual Testing:** Open ChatGPT, Gemini, and Grok in the browser and log in. 
2. Execute requests from the extension and monitor the Network Tab and Service Worker console to verify that the payloads are correctly accepted and streamed back.
3. Validate anti-bot headers for OpenAI to ensure 403 Forbidden errors are bypassed.
