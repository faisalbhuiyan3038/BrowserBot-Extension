/**
 * Shared helpers and request plumbing for AI providers (Chrome AI, Ollama, OpenAI-compatible).
 * Consolidates endpoint normalization, header generation, availability checking, and JSON parsing.
 */

// ─── Chrome AI Helpers ────────────────────────────────────────────────────────

/**
 * Access the Chrome AI Prompt API LanguageModel object across standard and origin trial namespaces.
 */
export function getLanguageModel(): any {
  const g = globalThis as any;
  if (g.LanguageModel) return g.LanguageModel;
  if (g.ai?.languageModel) return g.ai.languageModel;
  if (g.chrome?.aiOriginTrial?.languageModel) return g.chrome.aiOriginTrial.languageModel;
  return null;
}

/**
 * Query availability status string from LanguageModel instance ('readily', 'available', 'after-download', 'no', etc.).
 */
export async function getChromeAIAvailability(lm: any): Promise<string> {
  if (typeof lm.availability === 'function') {
    return await lm.availability();
  } else if (typeof lm.capabilities === 'function') {
    const caps = await lm.capabilities();
    return caps.available;
  }
  throw new Error('No availability method found on LanguageModel.');
}

// ─── OpenAI Compatible Helpers ────────────────────────────────────────────────

/**
 * Normalizes OpenAI-compatible base URL to guarantee a valid `/chat/completions` endpoint.
 */
export function normalizeOpenAIEndpoint(endpoint: string): string {
  const clean = endpoint.replace(/\/+$/, '');
  return clean.endsWith('/chat/completions') ? clean : `${clean}/chat/completions`;
}

/**
 * Builds HTTP headers for OpenAI-compatible requests.
 */
export function buildOpenAIHeaders(apiKey?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  return headers;
}

/**
 * Builds payload body for OpenAI-compatible chat completion requests.
 */
export function buildOpenAIPayload(
  model: string,
  messages: Array<{ role: string; content: string }>,
  options: { stream?: boolean; reasoning?: boolean } = {}
): Record<string, any> {
  const body: Record<string, any> = {
    model,
    messages,
  };
  if (options.stream) {
    body.stream = true;
  }
  if (options.reasoning) {
    body.reasoning = { enabled: true };
  }
  return body;
}

// ─── Ollama Helpers ───────────────────────────────────────────────────────────

/**
 * Normalizes Ollama base endpoint and appends the target API path.
 */
export function normalizeOllamaEndpoint(endpoint: string, path: '/api/generate' | '/api/chat' = '/api/chat'): string {
  const clean = endpoint.replace(/\/+$/, '');
  return `${clean}${path}`;
}

// ─── Robust JSON Parsing ──────────────────────────────────────────────────────

/**
 * Attempts to parse JSON from direct text, markdown code blocks, or braces substrings.
 */
export function parseJSONFromText<T = any>(text: string): T | null {
  try {
    return JSON.parse(text);
  } catch (_) {}

  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match?.[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (_) {}
  }

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(text.substring(start, end + 1));
    } catch (_) {}
  }

  return null;
}
