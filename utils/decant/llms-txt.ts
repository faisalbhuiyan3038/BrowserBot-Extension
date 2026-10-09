/**
 * Detect and fetch llms.txt from a website.
 * Checks: /llms.txt, /llms-full.txt, /.well-known/llms.txt
 * Also checks <link rel="llms"> in page head.
 */

const LLMS_PATHS = ['/llms.txt', '/llms-full.txt', '/.well-known/llms.txt'];

export interface LlmsTxtResult {
  found: boolean;
  url?: string;
  content?: string;
}

/**
 * Check if the site has an llms.txt file.
 * @param url - Any page URL from the site
 */
export async function detectLlmsTxt(url: string): Promise<LlmsTxtResult> {
  let origin: string;
  try {
    origin = new URL(url).origin;
  } catch {
    return { found: false };
  }

  for (const path of LLMS_PATHS) {
    try {
      const res = await fetch(origin + path, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        const text = await res.text();
        // Validate: must have content, must not be an HTML error page
        if (text.length > 10 && !text.trimStart().startsWith('<!') && !contentType.includes('text/html')) {
          return { found: true, url: origin + path, content: text };
        }
      }
    } catch {
      // Timeout, network error, CORS — skip this path
    }
  }

  return { found: false };
}

/**
 * Check for <link rel="llms"> or <link rel="llms-txt"> in page DOM.
 * @param doc - Parsed DOM
 * @returns href if found
 */
export function detectLlmsLink(doc: Document): string | null {
  if (!doc) return null;
  const link = doc.querySelector('link[rel="llms"], link[rel="llms-txt"]');
  return link?.getAttribute('href') || null;
}
