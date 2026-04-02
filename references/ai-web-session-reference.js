/**
 * Web Session AI Integration Module
 *
 * This reference module replicates the web session feature found in HARPA AI.
 * It demonstrates how to leverage an active browser session (cookies) to execute
 * AI inference directly from the background service worker.
 *
 * REFERENCES TAKEN FROM THE REVERSE-ENGINEERED EXTENSION:
 * 1. `manifest.json`: Uses `host_permissions: ["*://*/*"]` to sidestep CORS. Injects `cs-openai.js` into `https://*.openai.com/*`.
 * 2. `cs-openai.js`: Monkey patches `fetch` and `HTMLElement.prototype.appendChild` inside the Arkose iframe (`tcr9i.chat.openai.com`) to intercept and manipulate anti-bot headers.
 * 3. `pp.js`: 
 *    - Defines `chatgpt` endpoints `/api/auth/session` and `/backend-api/conversation`.
 *    - Uses `credentials: "include"` for `fetch` payloads to pass existing session cookies.
 *    - Configures stream decoding via SSE.
 */

class WebSessionAPI {
  constructor() {
    this.openAiApiKey = null;
  }

  /**
   * CHATGPT WEB SESSION
   * Reference: Extracted from `pp.js` around line 4882 `chatgpt: { endpoints: ... }`
   */
  async askChatGPTWeb(prompt, onProgress) {
    // Step 1: Ensure user is logged in
    const authRes = await fetch("https://chatgpt.com/api/auth/session", { credentials: "include" });
    const authData = await authRes.json();
    if (!authData.accessToken) throw new Error("Not logged in to ChatGPT");

    // Step 2: Send Request (Requires Arkose token resolution if challenged by OpenAI)
    const response = await fetch("https://chatgpt.com/backend-api/conversation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authData.accessToken}`,
        "Accept": "text/event-stream"
      },
      credentials: "include", // Uses the background script's cookie store
      body: JSON.stringify({
        action: "next",
        messages: [
          {
            id: crypto.randomUUID(),
            role: "user",
            content: { content_type: "text", parts: [prompt] }
          }
        ],
        model: "auto", // Can be 'gpt-4o', etc.
        parent_message_id: crypto.randomUUID(),
        timezone_offset_min: new Date().getTimezoneOffset(),
        history_and_training_disabled: false
      })
    });

    await this.processSSE(response, onProgress, (data) => {
        // Parse ChatGPT's specific SSE payload structure
        if(data && data.message && data.message.content && data.message.content.parts) {
            return data.message.content.parts[0];
        }
        return null;
    });
  }

  /**
   * GEMINI WEB SESSION
   * Reference: Extracted from `pp.js` parsing `batchexecute` internal APIs logic
   */
  async askGeminiWeb(prompt, onProgress) {
    // Gemini operates using Google's batchexecute internal endpoint.
    // Ensure `*://gemini.google.com/*` is in manifest permissions.
    const reqRes = await fetch("https://gemini.google.com/app", { credentials: "include" });
    const text = await reqRes.text();
    
    // Extract SNlM0e (session token for batchexecute)
    const snlm0eMatch = text.match(/"SNlM0e":"([^"]+)"/);
    if (!snlm0eMatch) throw new Error("Not logged in to Gemini");
    const snlm0e = snlm0eMatch[1];

    const fReq = JSON.stringify([null, `[[[${JSON.stringify(prompt)}],null,null]]`]);
    const payload = new URLSearchParams({
      "f.req": fReq,
      "at": snlm0e
    });

    const response = await fetch("https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=STREAM_UPDATE", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
      credentials: "include",
      body: payload.toString()
    });

    const responseText = await response.text();
    // Native parser required for highly nested Google array RPC format
    onProgress(responseText); 
  }

  /**
   * GROK WEB SESSION
   * Reference: Extracted from `pp.js` referencing `grok.com/api` and `grok-4-1-fast`
   */
  async askGrokWeb(prompt, onProgress) {
    // Fetch x-csrf-token from Grok API / HTML
    const authRes = await fetch("https://grok.com/sign-in", { credentials: "include" });
    if(authRes.status === 401) throw new Error("Not logged in to Grok");
    const cookieString = authRes.headers.get("set-cookie") || ""; // Simplify handling
    
    const response = await fetch("https://grok.com/api/chat/conversation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": "..." // Extract from session cookies
      },
      credentials: "include",
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        model: "grok-4-1-fast"
      })
    });

    await this.processSSE(response, onProgress, (data) => data.reply || null);
  }

  /**
   * OPEN API COMPATIBLE (OpenAI API Standard)
   */
  async askOpenAPI(endpoint, apiKey, prompt, onProgress) {
    const response = await fetch(endpoint, { // e.g. "https://api.openai.com/v1/chat/completions"
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "text/event-stream"
      },
      body: JSON.stringify({
        model: "gpt-4o", // standard parameter
        messages: [{ role: "user", content: prompt }],
        stream: true
      })
    });

    await this.processSSE(response, onProgress, (data) => {
        if(data && data.choices && data.choices[0].delta && data.choices[0].delta.content) {
            return data.choices[0].delta.content;
        }
        return null;
    });
  }

  /**
   * Helper utility to process Standard Server-Sent Events (SSE) Streams
   */
  async processSSE(response, onProgress, extractorFunc) {
     const reader = response.body.getReader();
     const decoder = new TextDecoder();
     let completeText = "";

     while (true) {
       const { done, value } = await reader.read();
       if (done) break;

       const chunk = decoder.decode(value, { stream: true });
       const lines = chunk.split("\n");

       for (const line of lines) {
         if (line.startsWith("data: ") && line !== "data: [DONE]") {
           try {
             const data = JSON.parse(line.substring(6));
             const textChunk = extractorFunc(data);
             if (textChunk) {
               completeText += textChunk;
               onProgress(completeText); // Emit latest aggregate
             }
           } catch(e) { }
         }
       }
     }
  }
}

export default WebSessionAPI;
