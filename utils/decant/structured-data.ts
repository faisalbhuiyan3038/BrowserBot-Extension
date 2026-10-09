/**
 * Extract structured data from web pages.
 * JSON-LD, Open Graph, Twitter Cards, meta tags.
 */

export interface StructuredDataResult {
  jsonLd: Record<string, any>[];
  openGraph: Record<string, string> | null;
  twitterCard: Record<string, string> | null;
  meta: Record<string, string> | null;
}

/**
 * Extract all structured data from a parsed DOM.
 * @param doc - Parsed HTML document
 */
export function extractStructuredData(doc: Document): StructuredDataResult {
  return {
    jsonLd: extractJsonLd(doc),
    openGraph: extractOpenGraph(doc),
    twitterCard: extractTwitterCard(doc),
    meta: extractMetaTags(doc),
  };
}

function extractJsonLd(doc: Document): Record<string, any>[] {
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  const results: Record<string, any>[] = [];
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent || '');
      if (Array.isArray(data)) {
        results.push(...data);
      } else if (data && data['@graph'] && Array.isArray(data['@graph'])) {
        results.push(...data['@graph']);
      } else if (data) {
        results.push(data);
      }
    } catch { /* malformed JSON-LD — skip */ }
  }
  return results;
}

function extractOpenGraph(doc: Document): Record<string, string> | null {
  const og: Record<string, string> = {};
  doc.querySelectorAll('meta[property^="og:"]').forEach(meta => {
    const key = meta.getAttribute('property')?.replace('og:', '') || '';
    const content = meta.getAttribute('content') || '';
    if (key && content) og[key] = content;
  });
  return Object.keys(og).length > 0 ? og : null;
}

function extractTwitterCard(doc: Document): Record<string, string> | null {
  const tc: Record<string, string> = {};
  doc.querySelectorAll('meta[name^="twitter:"]').forEach(meta => {
    const key = meta.getAttribute('name')?.replace('twitter:', '') || '';
    const content = meta.getAttribute('content') || '';
    if (key && content) tc[key] = content;
  });
  return Object.keys(tc).length > 0 ? tc : null;
}

function extractMetaTags(doc: Document): Record<string, string> | null {
  const meta: Record<string, string> = {};
  const names = ['description', 'author', 'keywords', 'robots'];
  for (const name of names) {
    const el = doc.querySelector(`meta[name="${name}"]`);
    const content = el?.getAttribute('content');
    if (content) meta[name] = content;
  }
  const canonical = doc.querySelector('link[rel="canonical"]');
  const href = canonical?.getAttribute('href');
  if (href) meta.canonical = href;
  return Object.keys(meta).length > 0 ? meta : null;
}
