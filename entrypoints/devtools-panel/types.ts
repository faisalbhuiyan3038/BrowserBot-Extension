export interface DevToolsConfig {
  console: boolean;
  network: boolean;
  dom: boolean;
  performance: boolean;
  networkHeaders: boolean;
  networkCookies: boolean;
  networkPayload: boolean;
  networkResponseBody: boolean;
  networkDisplayMode: 'summary' | 'details' | 'both';
  includeHtml: boolean;
  includeCss: boolean;
  includeJs: boolean;
  cookieValues: boolean;
  allowLargeBodies: boolean;
  webVitals: boolean;
  storage: boolean;
  storageValues: boolean;
  cookies: boolean;
  screenshots: boolean;
  liveConsole: boolean;
  pwa: boolean;
  security: boolean;
  eventListeners: boolean;
  matchedStyles: boolean;
  accessibilityTree: boolean;
}

export interface LogEntry {
  id: string;
  ts: number;
  level: string;
  text: string;
  stack?: string;
}

export interface NetworkEntry {
  id: string;
  method: string;
  url: string;
  status: number;
  duration: number;
  mimeType?: string;
  size?: number;
}

export interface DevToolsData {
  captureId?: string;
  logs?: LogEntry[];
  network?: NetworkEntry[];
  dom?: any;
  performance?: any;
  metadata?: any;
  storage?: any;
  cookies?: any[];
  vitals?: any;
  screenshot?: string;
  pwa?: any;
  security?: any;
}

/**
 * Infer the initiator type for a HAR network entry in a cross-browser way.
 */
export function inferInitiator(entry: any): string {
  // 1. Chrome _initiator (best signal)
  if (entry._initiator?.type) return entry._initiator.type;

  // 2. Chrome _resourceType (script, stylesheet, document, xhr, fetch, …)
  if (entry._resourceType) return entry._resourceType;

  // 3. Infer from URL file extension
  try {
    const url = new URL(entry.request.url);
    const ext = url.pathname.split('.').pop()?.toLowerCase() || '';
    if (['js', 'mjs', 'ts'].includes(ext)) return 'script';
    if (['css'].includes(ext)) return 'stylesheet';
    if (['html', 'htm'].includes(ext)) return 'document';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'avif'].includes(ext)) return 'image';
    if (['woff', 'woff2', 'ttf', 'eot', 'otf'].includes(ext)) return 'font';
  } catch (_) {}

  // 4. Presence of a Referer header → triggered by the page (parser or script)
  const headers: Array<{ name: string; value: string }> = entry.request.headers || [];
  const hasReferer = headers.some(h => h.name.toLowerCase() === 'referer');
  if (hasReferer) return 'parser';

  // 5. Explicit non-empty fallback
  return 'other';
}
