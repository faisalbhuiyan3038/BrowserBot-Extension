import { AppStorage, StorageState, OpenAIProvider, AIProviderType } from './storage';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamChatOptions {
  providerType?: AIProviderType;
  openaiProviderId?: string;
  onChunk: (chunk: string) => void;
  signal?: AbortSignal;
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

// ─── Chrome AI (Prompt API) ──────────────────────────────────

async function streamWithChromeAI(
  messages: ChatMessage[],
  options: StreamChatOptions
): Promise<string> {
  const ai = (globalThis as any).ai;
  if (!ai?.languageModel) {
    throw new Error('Chrome AI Prompt API is not available. Enable it in chrome://flags.');
  }

  const { available } = await ai.languageModel.capabilities();
  if (available !== 'readily') {
    throw new Error('Chrome AI model is not readily available.');
  }

  // Chrome AI: combine messages into a single prompt
  const systemMsgs = messages.filter(m => m.role === 'system').map(m => m.content).join('\n');
  const conversationText = messages
    .filter(m => m.role !== 'system')
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  const prompt = systemMsgs
    ? `${systemMsgs}\n\n${conversationText}\n\nAssistant:`
    : `${conversationText}\n\nAssistant:`;

  const session = await ai.languageModel.create();
  try {
    const stream = await session.promptStreaming(prompt);
    let fullText = '';
    // promptStreaming returns cumulative text in each chunk
    let lastLen = 0;
    for await (const chunk of stream) {
      if (options.signal?.aborted) break;
      const newPart = typeof chunk === 'string' ? chunk.slice(lastLen) : '';
      lastLen = typeof chunk === 'string' ? chunk.length : lastLen;
      if (newPart) {
        fullText += newPart;
        options.onChunk(newPart);
      }
    }
    return fullText;
  } finally {
    session.destroy();
  }
}

// ─── Ollama (Streaming) ─────────────────────────────────────

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
      stream: true
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

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (options.signal?.aborted) { reader.cancel(); break; }

    const text = decoder.decode(value, { stream: true });
    // Ollama streams NDJSON: each line is a JSON object
    const lines = text.split('\n').filter(l => l.trim());
    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        const chunk = data.message?.content || '';
        if (chunk) {
          fullText += chunk;
          options.onChunk(chunk);
        }
      } catch (_) {}
    }
  }

  return fullText;
}

// ─── OpenAI Compatible (Streaming) ──────────────────────────

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
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (options.signal?.aborted) { reader.cancel(); break; }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // keep incomplete line in buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        const chunk = parsed.choices?.[0]?.delta?.content || '';
        if (chunk) {
          fullText += chunk;
          options.onChunk(chunk);
        }
      } catch (_) {}
    }
  }

  return fullText;
}
