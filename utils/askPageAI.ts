import { AppStorage, StorageState, OpenAIProvider, AIProviderType } from './storage';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamChatOptions {
  providerType?: AIProviderType;
  openaiProviderId?: string;
  onChunk: (chunk: string) => void;
  onThinkingChunk?: (chunk: string) => void;
  signal?: AbortSignal;
}

export interface ChromeAIStatus {
  available: boolean;
  status: 'readily' | 'after-download' | 'no' | 'unavailable' | 'available' | 'downloadable' | 'downloading';
  error?: string;
}

/**
 * Stream a multi-turn chat conversation to the AI and emit chunks
 * as they arrive. Returns the full response when complete.
 */
export async function streamChatWithAI(
  messages: ChatMessage[],
  options: StreamChatOptions
): Promise<string> {
  const state = await AppStorage.get();
  const providerType = options.providerType ?? state.activeProvider;

  if (providerType === 'chrome_ai') {
    return streamWithChromeAI(messages, options);
  } else if (providerType === 'ollama') {
    return streamWithOllama(messages, state, options);
  } else if (providerType === 'openai') {
    const providerId = options.openaiProviderId ?? state.activeOpenAIProviderId;
    const provider = state.openaiProviders.find(p => p.id === providerId);
    if (!provider) throw new Error('No active OpenAI provider configured. Please check Settings.');
    return streamWithOpenAI(messages, provider, options);
  }

  throw new Error(`Unknown provider type: ${providerType}`);
}

/**
 * Check Chrome AI availability and return status info.
 */
/**
 * Helper to get the correct standard LanguageModel object.
 * As of Chrome 138, this might be exposed globally or under ai/chrome.aiOriginTrial
 */
export function getLanguageModel() {
  const g = globalThis as any;
  if (g.LanguageModel) return g.LanguageModel;
  if (g.ai?.languageModel) return g.ai.languageModel;
  if (g.chrome?.aiOriginTrial?.languageModel) return g.chrome.aiOriginTrial.languageModel;
  return null;
}

/**
 * Check Chrome AI availability and return status info.
 */
export async function checkChromeAIStatus(): Promise<ChromeAIStatus> {
  const lm = getLanguageModel();

  if (!lm) {
    return {
      available: false,
      status: 'unavailable',
      error: 'Chrome AI Prompt API is not available. Make sure you are using Chrome 131+ and enable the following flags in chrome://flags:\n• #prompt-api-for-gemini-nano → Enabled\n• #optimization-guide-on-device-model → Enabled BypassPerfRequirement\n\nOr optionally, join the Chrome AI Origin Trial.'
    };
  }

  try {
    let availability: string;
    if (typeof lm.availability === 'function') {
      availability = await lm.availability();
    } else if (typeof lm.capabilities === 'function') {
      const caps = await lm.capabilities();
      availability = caps.available;
    } else {
      throw new Error('No availability method found.');
    }

    // Accept both old ('readily') and new ('available') return values
    if (availability === 'readily' || availability === 'available') {
      return { available: true, status: 'readily' };
    } else if (['after-download', 'downloadable', 'downloading'].includes(availability)) {
      return {
        available: false,
        status: 'after-download',
        error: 'Chrome AI model needs to be downloaded. Click "Download Model" to start.'
      };
    } else {
      return {
        available: false,
        status: 'no',
        error: `Chrome AI returned status "${availability}". Requirements:\n• Desktop OS (Windows 10+, macOS 13+, or Linux)\n• At least 22 GB free disk space\n• A supported GPU\n• Chrome flags enabled:\n  - chrome://flags/#optimization-guide-on-device-model\n  - chrome://flags/#prompt-api-for-gemini-nano-multimodal-input`
      };
    }
  } catch (err: any) {
    return {
      available: false,
      status: 'unavailable',
      error: `Error checking Chrome AI: ${err.message}`
    };
  }
}

/**
 * Trigger Chrome AI model download. Returns progress updates via callback.
 */
export async function downloadChromeAIModel(
  onProgress: (progress: number) => void
): Promise<boolean> {
  const lm = getLanguageModel();
  if (!lm) throw new Error('Chrome AI not available');

  try {
    const session = await lm.create({
      monitor(m: any) {
        m.addEventListener('downloadprogress', (e: any) => {
          const pct = Math.round((e.loaded / e.total) * 100);
          onProgress(pct);
        });
      }
    });
    session.destroy();
    return true;
  } catch (err: any) {
    throw new Error(`Model download failed: ${err.message}`);
  }
}

// ─── Chrome AI (Prompt API) ──────────────────────────────────

async function streamWithChromeAI(
  messages: ChatMessage[],
  options: StreamChatOptions
): Promise<string> {
  const lm = getLanguageModel();
  if (!lm) {
    throw new Error('Chrome AI Prompt API is not available. Enable it in chrome://flags:\n• #prompt-api-for-gemini-nano → Enabled\n• #optimization-guide-on-device-model → Enabled BypassPerfRequirement');
  }

  let availability: string;
  if (typeof lm.availability === 'function') {
    availability = await lm.availability();
  } else if (typeof lm.capabilities === 'function') {
    const caps = await lm.capabilities();
    availability = caps.available;
  } else {
    throw new Error('No availability method found.');
  }

  // Accept both old and new return values
  if (availability === 'no' || availability === 'unavailable') {
    throw new Error('Chrome AI is not supported on this device. Requires desktop with 22 GB+ free space.');
  }

  if (['after-download', 'downloadable', 'downloading'].includes(availability)) {
    // Auto-trigger download with progress feedback
    options.onChunk('⏳ Chrome AI model is downloading...\n\n');
    try {
      const session = await lm.create({
        monitor(m: any) {
          m.addEventListener('downloadprogress', (e: any) => {
            const pct = Math.round((e.loaded / e.total) * 100);
            options.onChunk(`Downloading: ${pct}%\r`);
          });
        }
      });
      session.destroy();
      options.onChunk('\n\n✅ Model downloaded! Retrying...\n\n');
    } catch (err: any) {
      throw new Error(`Chrome AI model download failed: ${err.message}`);
    }
  }

  // If 'available', 'readily', or download just completed — proceed to create session

  // Map browser messages to initialPrompts array for Chrome AI
  const initialPrompts: any[] = [];
  const systemMsg = messages.find(m => m.role === 'system');
  if (systemMsg) {
    initialPrompts.push({ role: 'system', content: systemMsg.content });
  }

  const chatMsgs = messages.filter(m => m.role !== 'system');
  // everything except the very last message goes into initialPrompts
  if (chatMsgs.length > 1) {
    for (const msg of chatMsgs.slice(0, -1)) {
      initialPrompts.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      });
    }
  }

  const lastMessage = chatMsgs[chatMsgs.length - 1]?.content || '';

  const session = await lm.create({ initialPrompts });
  try {
    const stream = await session.promptStreaming(lastMessage);
    let fullText = '';
    for await (const chunk of stream) {
      if (options.signal?.aborted) break;
      // Current API returns incremental chunks directly
      const text = typeof chunk === 'string' ? chunk : '';
      if (text) {
        fullText += text;
        options.onChunk(text);
      }
    }
    return fullText;
  } finally {
    session.destroy();
  }
}

// ─── Ollama (Streaming with Thinking Support) ───────────────

async function streamWithOllama(
  messages: ChatMessage[],
  state: StorageState,
  options: StreamChatOptions
): Promise<string> {
  const endpoint = state.ollamaEndpoint.replace(/\/+$/, '');
  const res = await fetch(`${endpoint}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: state.ollamaModel,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: true,
      think: true   // Enable thinking/reasoning for supported models
    }),
    signal: options.signal
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Ollama error ${res.status}: ${body || res.statusText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body from Ollama');

  const decoder = new TextDecoder();
  let fullText = '';
  let fullThinking = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (options.signal?.aborted) { reader.cancel(); break; }

    const text = decoder.decode(value, { stream: true });
    const lines = text.split('\n').filter(l => l.trim());
    for (const line of lines) {
      try {
        const data = JSON.parse(line);

        // Handle thinking tokens (separate field from content)
        const thinkingChunk = data.message?.thinking || '';
        if (thinkingChunk && options.onThinkingChunk) {
          fullThinking += thinkingChunk;
          options.onThinkingChunk(thinkingChunk);
        }

        // Handle content tokens
        const chunk = data.message?.content || '';
        if (chunk) {
          fullText += chunk;
          options.onChunk(chunk);
        }
      } catch (_) { }
    }
  }

  return fullText;
}

// ─── OpenAI Compatible (Streaming with Reasoning) ───────────

async function streamWithOpenAI(
  messages: ChatMessage[],
  provider: OpenAIProvider,
  options: StreamChatOptions
): Promise<string> {
  let url = provider.endpoint.replace(/\/+$/, '');
  if (!url.endsWith('/chat/completions')) {
    url += '/chat/completions';
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (provider.apiKey) {
    headers['Authorization'] = `Bearer ${provider.apiKey}`;
  }

  const body: Record<string, any> = {
    model: provider.model,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    stream: true
  };

  if (provider.reasoning) {
    body.reasoning = { enabled: true };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: options.signal
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`${provider.name} error ${res.status}: ${errBody || res.statusText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullText = '';
  let fullThinking = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (options.signal?.aborted) { reader.cancel(); break; }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta;
        if (!delta) continue;

        // Handle reasoning/thinking content (various provider formats)
        const reasoningChunk = delta.reasoning_content || delta.reasoning || '';
        if (reasoningChunk && options.onThinkingChunk) {
          fullThinking += reasoningChunk;
          options.onThinkingChunk(reasoningChunk);
        }

        // Handle regular content
        const chunk = delta.content || '';
        if (chunk) {
          fullText += chunk;
          options.onChunk(chunk);
        }
      } catch (_) { }
    }
  }

  return fullText;
}
