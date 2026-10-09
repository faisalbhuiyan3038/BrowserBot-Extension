/**
 * HTML to Markdown conversion using Turndown.
 * Optimized for AI/LLM consumption.
 */
import TurndownService from 'turndown';
import type { ExtractedTable } from './table-detect';
import type { SmartData } from './smart-extract';
import type { StructuredDataResult } from './structured-data';

export interface DecantMetadata {
  title: string;
  url: string;
  domain: string;
  siteName: string;
  excerpt: string;
  wordCount: number;
  imageCount: number;
  estimatedTokens: number;
  tokensByModel: Record<string, any>;
  extractedAt: string;
  tables: number;
  smartData?: SmartData;
  structuredData?: StructuredDataResult;
  llmsTxtLink?: string;
}

export interface MarkdownOptions {
  includeImages?: boolean;
  tables?: ExtractedTable[];
}

export interface ArticleInput {
  title?: string;
  content: string;
  textContent: string;
  length?: number;
  siteName?: string;
  excerpt?: string;
}

// Create and configure the Turndown instance
function createTurndown(options: MarkdownOptions = {}): TurndownService {
  const td = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    fence: '```',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: 'inlined',
    linkReferenceStyle: 'full',
  });

  // Remove empty links
  td.addRule('removeEmptyLinks', {
    filter: (node: HTMLElement) => node.nodeName === 'A' && !node.textContent?.trim(),
    replacement: () => '',
  });

  // Clean up images
  if (options.includeImages) {
    td.addRule('cleanImages', {
      filter: 'img',
      replacement: (_content: string, node: HTMLElement) => {
        const alt = node.getAttribute('alt') || '';
        const src = node.getAttribute('src') || node.getAttribute('data-src') || '';
        if (!src) return '';
        return `![${alt}](${src})`;
      },
    });
  } else {
    td.addRule('removeImages', {
      filter: 'img',
      replacement: () => '',
    });
  }

  // Better code blocks
  td.addRule('fencedCodeBlock', {
    filter: (node: HTMLElement) => {
      return node.nodeName === 'PRE' && !!node.querySelector('code');
    },
    replacement: (_content: string, node: HTMLElement) => {
      const code = node.querySelector('code');
      if (!code) return '';
      const lang = detectLanguage(code);
      const text = code.textContent || '';
      return `\n\`\`\`${lang}\n${text}\n\`\`\`\n`;
    },
  });

  // Table handling — keep clean markdown tables
  td.addRule('tableCell', {
    filter: ['th', 'td'],
    replacement: (content: string) => {
      return ` ${content.replace(/\n/g, ' ').trim()} |`;
    },
  });

  td.addRule('tableRow', {
    filter: 'tr',
    replacement: (content: string) => {
      return `|${content}\n`;
    },
  });

  td.addRule('tableHead', {
    filter: 'thead',
    replacement: (content: string) => {
      const cols = content.trim().split('|').filter(Boolean).length;
      const separator = '|' + ' --- |'.repeat(cols);
      return `${content}${separator}\n`;
    },
  });

  td.addRule('table', {
    filter: 'table',
    replacement: (content: string) => {
      return `\n${content}\n`;
    },
  });

  td.addRule('tableBody', {
    filter: 'tbody',
    replacement: (content: string) => content,
  });

  // Remove common noise & interactive elements from Turndown output
  td.remove([
    'script', 'style', 'noscript', 'iframe',
    'button', 'input', 'select', 'textarea', 'fieldset',
    'nav', 'form',
  ]);

  td.addRule('removeSvg', {
    filter: (node: HTMLElement) => node.nodeName.toUpperCase() === 'SVG',
    replacement: () => '',
  });

  // Remove elements that contain only whitespace or tiny "action" text
  td.addRule('removeNoiseSpans', {
    filter: (node: HTMLElement) => {
      // Remove empty or whitespace-only spans/divs
      if ((node.nodeName === 'SPAN' || node.nodeName === 'DIV') && !node.textContent?.trim()) {
        return true;
      }
      return false;
    },
    replacement: () => '',
  });

  return td;
}

/**
 * Detect programming language from a code element's class names and attributes.
 * Supports: standard language-*, Prism, Rouge, SyntaxHighlighter, Pandoc, data attributes.
 * @param codeElement
 * @returns Normalized language identifier or empty string
 */
export function detectLanguage(codeElement: Element | null): string {
  if (!codeElement) return '';

  // Collect all class + attribute hints from element and parent
  const candidates = [
    codeElement.className || '',
    codeElement.parentElement?.className || '',
    codeElement.getAttribute('data-lang') || '',
    codeElement.getAttribute('data-language') || '',
  ].join(' ');

  // Patterns ordered by specificity
  const patterns = [
    /(?:language|lang|hljs|highlight)-(\w[\w+#]*)/,      // Standard: language-js, hljs-python
    /brush:\s*(\w+)/,                                      // SyntaxHighlighter: brush:python
    /prism-(\w+)/,                                         // Prism.js
    /rouge-(\w+)/,                                         // Rouge (Jekyll/GitHub Pages)
    /sourceCode\s+(\w+)/,                                  // Pandoc
    /\b(javascript|typescript|python|ruby|go|rust|java|kotlin|swift|scala|php|perl|bash|shell|zsh|powershell|sql|html|css|scss|less|json|yaml|toml|xml|markdown|dockerfile|graphql|terraform|hcl|lua|elixir|clojure|haskell|ocaml|r|matlab|dart|zig|nim|crystal|vue|jsx|tsx)\b/i,
  ];

  for (const pattern of patterns) {
    const match = candidates.match(pattern);
    if (match) return normalizeLang(match[1]);
  }

  return '';
}

/**
 * Normalize language identifiers to common names.
 */
function normalizeLang(lang: string): string {
  const map: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    rb: 'ruby',
    sh: 'bash',
    zsh: 'bash',
    yml: 'yaml',
    md: 'markdown',
    cs: 'csharp',
    'c++': 'cpp',
    'c#': 'csharp',
    dockerfile: 'docker',
    tf: 'terraform',
  };
  const lower = lang.toLowerCase();
  return map[lower] || lower;
}

/**
 * Convert article HTML to AI-optimized Markdown.
 */
export function toMarkdown(article: ArticleInput, metadata: DecantMetadata, options: MarkdownOptions = {}): string {
  const td = createTurndown(options);
  let md = '';

  // Header with metadata (helps LLMs understand context)
  md += `# ${metadata.title}\n\n`;
  md += `> **Source:** ${metadata.url}\n`;
  if (metadata.siteName) md += `> **Site:** ${metadata.siteName}\n`;
  if (metadata.excerpt) md += `> **Summary:** ${metadata.excerpt}\n`;
  md += `> **Extracted:** ${metadata.extractedAt} | ${metadata.wordCount} words\n`;
  if (metadata.llmsTxtLink) md += `> **llms.txt:** ${metadata.llmsTxtLink}\n`;
  md += '\n---\n\n';

  // Main content
  const content = td.turndown(article.content);

  // Post-process: aggressive whitespace minification
  md += content
    .replace(/\t/g, ' ')              // Tabs → single space
    .replace(/\xA0/g, ' ')            // NBSP → space
    .replace(/\u200B/g, '')           // Zero-width space → remove
    .replace(/ {2,}/g, ' ')           // Collapse multiple spaces
    .replace(/^ +| +$/gm, '')        // Trim each line
    .replace(/\n{3,}/g, '\n\n')       // Max 1 blank line
    .trim();

  // Append tables section if separately extracted
  if (options.tables && options.tables.length > 0) {
    md += '\n\n---\n\n## Extracted Tables\n\n';
    options.tables.forEach((table, i) => {
      md += `### Table ${i + 1}${table.caption ? `: ${table.caption}` : ''}\n\n`;
      md += table.markdown;
      md += '\n\n';
    });
  }

  // Append smart data if present
  if (metadata.smartData && Object.keys(metadata.smartData).length > 0) {
    md += '\n\n---\n\n## Extracted Data\n\n';
    const sd = metadata.smartData;
    if (sd.emails?.length) md += `**Emails:** ${sd.emails.join(', ')}\n\n`;
    if (sd.dates?.length) md += `**Dates:** ${sd.dates.join(', ')}\n\n`;
    if (sd.prices?.length) md += `**Prices:** ${sd.prices.join(', ')}\n\n`;
    if (sd.phones?.length) md += `**Phone numbers:** ${sd.phones.join(', ')}\n\n`;
  }

  // Append structured data if present (JSON-LD)
  if (metadata.structuredData?.jsonLd && metadata.structuredData.jsonLd.length > 0) {
    md += '\n\n---\n\n## Structured Data\n\n';
    md += '```json\n';
    md += JSON.stringify(metadata.structuredData.jsonLd, null, 2);
    md += '\n```\n';
  }

  return md;
}
