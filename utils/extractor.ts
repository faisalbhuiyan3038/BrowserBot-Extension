/**
 * Page Content Extraction Utility
 * 
 * Three algorithms for extracting page content in a content script context:
 *   1 = Text Extraction — lightweight heading/text extraction with smart truncation
 *   2 = Optimized Content Extraction — full HTML cleaning, dedup, YouTube transcript
 *   3 = Full Content Extraction — Readability + html-to-text pipeline
 */

import type { ExtractionAlgorithm } from './storage';

// ═══════════════════════════════════════════════════════
// SHARED CONFIG
// ═══════════════════════════════════════════════════════

const TRUNC_CONFIG = {
  characterLimit: 20000,
  initialContentRatio: 0.4,
  chunkSize: 300,
  minChunksPerSegment: 3
};

// ═══════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════

export interface ExtractionResult {
  content: string;
  originalLength: number;
  truncatedLength: number;
  algorithm: ExtractionAlgorithm;
  youtubeTranscript?: string;
}

/**
 * Extract page content using the specified algorithm.
 * Must be called from a content script context (needs DOM access).
 */
export async function extractPageContent(
  algorithm: ExtractionAlgorithm,
  options?: { characterLimit?: number; promptLength?: number }
): Promise<ExtractionResult> {
  const charLimit = options?.characterLimit || TRUNC_CONFIG.characterLimit;
  const promptLen = options?.promptLength || 0;
  const maxContentLength = charLimit - promptLen - 50;

  switch (algorithm) {
    case 1:
      return extractAlgorithm1(maxContentLength);
    case 2:
      return await extractAlgorithm2(maxContentLength);
    case 3:
      return await extractAlgorithm3();
    default:
      return extractAlgorithm1(maxContentLength);
  }
}

// ═══════════════════════════════════════════════════════
// ALGORITHM 1: TEXT EXTRACTION
// Lightweight extraction of headings, paragraphs, etc.
// with markdown-style formatting and smart truncation
// ═══════════════════════════════════════════════════════

function extractAlgorithm1(maxContentLength: number): ExtractionResult {
  const raw = dom_extractPageContent();
  const truncated = truncateText(raw, { characterLimit: maxContentLength });
  return {
    content: truncated,
    originalLength: raw.length,
    truncatedLength: truncated.length,
    algorithm: 1
  };
}

function dom_extractPageContent(): string {
  const ignore = 'nav, aside, header, footer, button, script, style, form, fieldset, legend';
  const targets = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'td', 'article', 'section', 'div:not(:empty)']
    .map(tag => `${tag}:not(${ignore}):not(${ignore} *)`).join(', ');
  const els = Array.from(document.querySelectorAll(targets));
  let content = '';

  for (const el of els) {
    if ((el as HTMLElement).offsetHeight === 0 || el.closest(ignore) || !el.textContent?.trim()) continue;

    const parent = el.parentElement;
    if (parent && (parent.matches(targets) || parent.closest(targets))) {
      if (parent.closest(targets) !== el) continue;
    }

    let text = (el as HTMLElement).innerText.trim().replace(/<[^>]+>/g, '').trim();
    if (!text) continue;
    switch (el.tagName.toLowerCase()) {
      case 'h1': content += `# ${text}\n`; break;
      case 'h2': content += `## ${text}\n`; break;
      case 'h3': content += `### ${text}\n`; break;
      case 'h4': case 'h5': case 'h6': content += `#### ${text}\n`; break;
      case 'li': content += `• ${text}\n`; break;
      default: content += `${text}\n`;
    }
  }
  return content.replace(/\n{2,}/g, '\n').trim();
}

// ── Truncation helpers ──

function chunkText(text: string, size: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    if (start + size >= text.length) {
      chunks.push(text.slice(start).trim());
      break;
    }
    let slice = text.slice(start, start + size);
    const lastSpace = slice.lastIndexOf(' ');
    slice = slice.slice(0, lastSpace);
    start += lastSpace + 1;
    chunks.push(slice.trim());
  }
  return chunks;
}

function totalLength(chunks: string[]): number {
  return chunks.reduce((sum, c) => sum + c.length, 0);
}

function getProportions(total: number, num: number): number[] {
  if (total <= 0 || num <= 0) return [];
  const props: number[] = [];
  const step = 1 / (num + 1);
  for (let i = 1; i <= num; i++) props.push(step * i);
  return props;
}

function truncateText(text: string, config?: Partial<typeof TRUNC_CONFIG>): string {
  const cfg = { ...TRUNC_CONFIG, ...config };
  if (text.length <= cfg.characterLimit) return text;
  const chunks = chunkText(text, cfg.chunkSize);
  const samples: string[] = [];
  let len = 0;
  const initLimit = Math.floor(cfg.characterLimit * cfg.initialContentRatio);
  let i = 0;
  while (i < chunks.length && len < initLimit) {
    const c = chunks[i];
    if (len + c.length <= initLimit) {
      samples.push(c);
      len += c.length;
    } else {
      const rem = initLimit - len;
      if (rem > 10) {
        samples.push(c.slice(0, rem));
        len += rem;
      }
      break;
    }
    i++;
  }
  const remChunks = chunks.slice(i);
  if (remChunks.length > 0) {
    const avg = totalLength(remChunks) / remChunks.length;
    const numSeg = Math.floor((cfg.characterLimit - len) / (avg * cfg.minChunksPerSegment));
    const props = getProportions(remChunks.length, numSeg);
    for (const p of props) {
      if (len >= cfg.characterLimit) break;
      const startIdx = Math.floor(remChunks.length * p);
      const numC = Math.min(cfg.minChunksPerSegment, remChunks.length - startIdx);
      for (let j = 0; j < numC; j++) {
        const c = remChunks[startIdx + j];
        const space = cfg.characterLimit - len;
        if (c.length <= space) {
          samples.push(c);
          len += c.length;
        } else if (space > 10) {
          samples.push(c.slice(0, space));
          len += space;
          break;
        }
      }
    }
  }
  return samples.join(' ').replace(/[\n\r]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

// ═══════════════════════════════════════════════════════
// ALGORITHM 2: OPTIMIZED CONTENT EXTRACTION
// Full HTML cleaning, deduplication, YouTube transcript
// ═══════════════════════════════════════════════════════

async function extractAlgorithm2(maxContentLength: number): Promise<ExtractionResult> {
  let pageText = harpaExtractPageText(document.documentElement.outerHTML);
  if (!pageText) pageText = '';

  // Try YouTube transcript extraction
  let youtubeTranscript: string | undefined;
  if (location.href.includes('youtube.com/watch')) {
    try {
      const transcript = await harpaExtractYouTubeTranscript();
      if (transcript) {
        youtubeTranscript = transcript;
        pageText = `${youtubeTranscript}\n\n---\n\n${pageText}`;
      }
    } catch (_) { /* YouTube extraction failed, continue with page text */ }
  }

  const truncated = truncateText(pageText, { characterLimit: maxContentLength });
  return {
    content: truncated,
    originalLength: pageText.length,
    truncatedLength: truncated.length,
    algorithm: 2,
    youtubeTranscript
  };
}

function harpaExtractPageText(html: string): string | null {
  if (!html) return null;

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch || !bodyMatch[1]) return null;

  let s = bodyMatch[1];
  s = s.replaceAll(/src="[^"]*"/g, '').replaceAll(/href="[^"]*"/g, '');
  s = s.replaceAll(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
       .replaceAll(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = s;

  const unwanted = 'head, script, style, img, svg, nav, footer, header, aside, iframe, video, audio, canvas, map, object, embed, applet, frame, frameset, noframes, noembed, noscript, link, meta, base, title';
  tempDiv.querySelectorAll(unwanted).forEach(el => el.remove());

  tempDiv.querySelectorAll('*').forEach(el => {
    if (!el.textContent?.trim()) el.remove();
  });

  tempDiv.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => el.removeAttribute(attr.name));
  });

  tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
    const level = parseInt(el.tagName[1]);
    el.textContent = '#'.repeat(level) + ' ' + el.textContent;
  });

  document.body.appendChild(tempDiv);
  let text = tempDiv.innerText || '';
  document.body.removeChild(tempDiv);

  text = text.replace(/ +/g, ' ').replace(/\n+/g, '\n').trim();

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const uniqueLines: string[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    if (!seen.has(line)) {
      seen.add(line);
      uniqueLines.push(line);
    }
  }
  return uniqueLines.join('\n');
}

// ── YouTube Transcript Extraction ──

async function harpaExtractYouTubeTranscript(): Promise<string | null> {
  if (!location.href.includes('youtube.com/watch')) return null;

  try {
    let transcriptData = await fetchTranscriptFromInitialData();
    if (!transcriptData || !transcriptData.transcript) {
      transcriptData = await fetchTranscriptWithXSRF(location.href);
    }
    if (!transcriptData || !transcriptData.transcript) return null;

    const lines = transcriptData.transcript.map((item: any) => {
      const time = formatTime(item.s);
      return `[${time}] ${item.t}`;
    });

    return `YouTube Transcript (${transcriptData.language || 'en'})\n\n` + lines.join('\n');
  } catch (_) {
    return null;
  }
}

async function fetchTranscriptFromInitialData(): Promise<any> {
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    const text = script.textContent || '';
    if (text.includes('ytInitialPlayerResponse')) {
      try {
        const match = text.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
        if (match) {
          const data = JSON.parse(match[1]);
          const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
          if (tracks && tracks.length) {
            const track = tracks.find((t: any) => t.vssId?.startsWith('.en'))
              || tracks.find((t: any) => t.vssId === 'a.en')
              || tracks[0];
            return await fetchCaptionTrack(track);
          }
        }
      } catch (_) { }
    }
  }
  return null;
}

async function fetchTranscriptWithXSRF(videoUrl: string): Promise<any> {
  try {
    const videoId = new URL(videoUrl).searchParams.get('v');
    const pageText = await (await fetch(videoUrl)).text();

    const xsrfMatch = pageText.match(/XSRF_TOKEN["']\s*:\s*["']([^"']+)/);
    if (!xsrfMatch) return null;

    const xsrf = xsrfMatch[1];
    const pbjUrl = `https://www.youtube.com/watch?v=${videoId}&bpctr=${Math.floor(Date.now() / 1000) + 3000}&pbj=1`;

    const pbjRes = await fetch(pbjUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: `session_token=${encodeURIComponent(xsrf)}`,
      credentials: 'include'
    });

    const pbjData = await pbjRes.json();
    const tracks = pbjData?.playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!tracks || !tracks.length) return null;

    const track = tracks.find((t: any) => t.vssId?.startsWith('.en'))
      || tracks.find((t: any) => t.vssId === 'a.en')
      || tracks[0];
    return await fetchCaptionTrack(track);
  } catch (_) {
    return null;
  }
}

async function fetchCaptionTrack(track: any): Promise<any> {
  let url = track.baseUrl;
  if (!url.startsWith('http')) url = 'https://www.youtube.com' + url;

  const res = await fetch(url, { credentials: 'include' });
  const xmlText = await res.text();

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const textNodes = xmlDoc.querySelectorAll('text');

  const transcript = Array.from(textNodes).map(node => ({
    s: parseFloat(node.getAttribute('start') || '0'),
    d: parseFloat(node.getAttribute('dur') || '0'),
    t: (node.textContent || '').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\n/g, ' ')
  }));

  return { transcript, language: track.name?.simpleText || 'en' };
}

function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

// ═══════════════════════════════════════════════════════
// ALGORITHM 3: FULL CONTENT EXTRACTION
// Readability + html-to-text pipeline
// ═══════════════════════════════════════════════════════

async function extractAlgorithm3(): Promise<ExtractionResult> {
  // Dynamic imports to keep these out of the main bundle for alg 1/2
  const { Readability, isProbablyReaderable } = await import('@mozilla/readability');
  const { convert } = await import('html-to-text');

  const isReadable = isProbablyReaderable(document);
  const readabilityResult = isReadable ? parseWithReadability(Readability) : null;
  const cleanedHtml = cleanDomForExtraction();
  const textContent = convertHtmlToText(convert, cleanedHtml);

  let finalContent = textContent;
  if (isReadable && readabilityResult?.content) {
    // Add readable article content as well
    const articleText = convertHtmlToText(convert, readabilityResult.content);
    finalContent = `--- Article Content ---\n${articleText}\n\n--- Full Page Text ---\n${textContent}`;
  }

  return {
    content: finalContent,
    originalLength: finalContent.length,
    truncatedLength: finalContent.length,
    algorithm: 3
  };
}

function stripInvisibleNodes(node: Element): void {
  node.querySelectorAll(':scope > *').forEach((child) => {
    const cs = window.getComputedStyle(child);
    if (
      cs.display === 'none' ||
      (child as HTMLElement).style.display === 'none' ||
      (child as HTMLElement).style.visibility === 'hidden' ||
      cs.visibility === 'hidden'
    ) {
      child.remove();
    } else {
      stripInvisibleNodes(child);
    }
  });
}

function cleanDomForExtraction(): string {
  const clone = document.body.cloneNode(true) as HTMLElement;

  clone.querySelectorAll(
    'script, noscript, link, style, template, [hidden], [aria-hidden="true"], svg, iframe, input, textarea, form'
  ).forEach(el => el.remove());

  clone.querySelectorAll('*').forEach(el => {
    if (el.tagName !== 'IMG' && !el.textContent?.trim()) {
      el.remove();
    }
  });

  stripInvisibleNodes(clone);

  return clone.innerHTML.replace(/<!--.*?-->/g, '');
}

function convertHtmlToText(convert: any, html: string): string {
  return convert(html, {
    wordwrap: null,
    selectors: [
      {
        selector: 'a',
        options: {
          baseUrl: window.location.origin,
          hideLinkHrefIfSameAsText: true,
        },
      },
      {
        selector: 'img',
        format: 'skip',
      },
    ],
  });
}

function parseWithReadability(ReadabilityClass: any): any {
  const docClone = document.cloneNode(true);
  return new ReadabilityClass(docClone).parse();
}
