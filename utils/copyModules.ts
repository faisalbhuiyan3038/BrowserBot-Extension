import type { TabInfo, ExistingGroup } from './ai';
import { buildTabGroupPrompt, buildBookmarkOrganizePrompt, interpolatePrompt, OUTPUT_FORMAT_INSTRUCTION, BOOKMARK_OUTPUT_FORMAT } from './ai';
import type { OrganizeBookmarksOptions } from './ai';
import type { ChatMsg } from './storage';
import { DEFAULT_TAB_GROUP_PROMPT, DEFAULT_BOOKMARK_ORGANIZE_PROMPT } from './storage';

/**
 * ==============================================================================
 * EXTENSION POINT: Adding a new copy module
 * ==============================================================================
 * To add a new copyable module:
 * 1. Add a new object to the `COPY_MODULES` array below.
 * 2. Define its `id`, user-facing `label`, display `order`, optional `isAvailable(ctx)` check,
 *    and its `build(ctx)` function.
 *
 * NO OTHER FILES need to be modified. All UI views (Ask Page panel, popup, DevTools)
 * dynamically read from `getAvailableCopyModules(context)` and render matching options.
 * ==============================================================================
 */

export interface PromptContext {
  scope: 'ask-page' | 'tab-group' | 'bookmarks' | 'devtools';

  // User input
  userPrompt?: string;

  // System or template prompt
  systemPrompt?: string;

  // Browser-derived data for Ask Page
  pageTitle?: string;
  pageUrl?: string;
  selectedText?: string;
  pageContent?: string;
  attachedTabs?: Array<{ id: number; title: string; url: string; content: string }>;

  // Browser-derived data for Tab Grouping
  tabs?: TabInfo[];
  existingGroups?: ExistingGroup[];
  customInstructions?: string;
  keepExistingGroups?: boolean;

  // Browser-derived data for Bookmarks
  bookmarkOptions?: OrganizeBookmarksOptions;

  // Browser-derived data for DevTools
  devtoolsPreamble?: string;
  devtoolsContextData?: string;
  buildDevtoolsSystemPrompt?: () => Promise<string> | string;

  // Conversation history
  historyMessages?: ChatMsg[];
}

export interface CopyModule {
  id: string;
  label: string;
  order: number;
  isAvailable?: (context: PromptContext) => boolean;
  build: (context: PromptContext) => Promise<string> | string;
}

export const MARKDOWN_FORMAT_INSTRUCTION =
  '\n\nIMPORTANT: Always format your responses using markdown. Use headings, bullet points, code blocks, bold, italic, and other markdown features to make your responses well-structured and readable.';

// ─── Builder implementations ──────────────────────────────────────────────────

function buildPromptOnly(context: PromptContext): string {
  switch (context.scope) {
    case 'tab-group': {
      let text = context.systemPrompt || DEFAULT_TAB_GROUP_PROMPT.prompt;
      // Strip data interpolation variables
      text = text.replace(/\{tabList\}/g, '[Tab List placeholder]')
                 .replace(/\{existingGroups\}/g, '[Existing Groups placeholder]');
      if (context.customInstructions?.trim()) {
        text += '\n\nAdditional instructions:\n' + context.customInstructions.trim();
      }
      text += OUTPUT_FORMAT_INSTRUCTION;
      return text.trim();
    }
    case 'bookmarks': {
      let text = context.systemPrompt || DEFAULT_BOOKMARK_ORGANIZE_PROMPT;
      text = text.replace(/\{bookmarkList\}/g, '[Bookmark List placeholder]')
                 .replace(/\{folderList\}/g, '[Folder List placeholder]')
                 .replace(/\{domainList\}/g, '[Domain List placeholder]')
                 .replace(/\{rootParentList\}/g, '[Root Parent List placeholder]');
      if (context.bookmarkOptions?.customInstructions?.trim()) {
        text += '\n\nAdditional instructions:\n' + context.bookmarkOptions.customInstructions.trim();
      }
      text += BOOKMARK_OUTPUT_FORMAT;
      return text.trim();
    }
    case 'devtools': {
      const preamble = context.devtoolsPreamble || context.systemPrompt || 'You are an expert web developer and debugger AI assistant.';
      const parts = [`System Instruction:\n${preamble}`];
      if (context.userPrompt?.trim()) {
        parts.push(`User Prompt:\n${context.userPrompt.trim()}`);
      }
      return parts.join('\n\n').trim();
    }
    case 'ask-page':
    default: {
      const parts: string[] = [];
      const sys = (context.systemPrompt || '')
        .replace(/\{pageTitle\}/g, context.pageTitle || '')
        .replace(/\{pageUrl\}/g, context.pageUrl || '')
        .replace(/\{selectedText\}/g, context.selectedText || '')
        .replace(/\{pageContent\}/g, '[Extracted Page Content]')
        .replace(/\{tabContext\}/g, '[Attached Tabs Context]');
      if (sys.trim()) {
        parts.push(`System Instruction:\n${sys.trim()}${MARKDOWN_FORMAT_INSTRUCTION}`);
      }
      if (context.userPrompt?.trim()) {
        parts.push(`User Prompt:\n${context.userPrompt.trim()}`);
      }
      return parts.join('\n\n').trim();
    }
  }
}

function buildBrowserContextOnly(context: PromptContext): string {
  switch (context.scope) {
    case 'tab-group': {
      const lines: string[] = [];
      if (context.tabs && context.tabs.length > 0) {
        lines.push(`## Open Tabs (${context.tabs.length}):`);
        lines.push(JSON.stringify(context.tabs.map(t => ({ id: t.id, title: t.title, url: t.url })), null, 2));
      }
      if (context.existingGroups && context.existingGroups.length > 0) {
        lines.push(`\n## Existing Tab Groups:`);
        lines.push(JSON.stringify(context.existingGroups, null, 2));
      }
      return lines.join('\n').trim();
    }
    case 'bookmarks': {
      const b = context.bookmarkOptions;
      if (!b) return '';
      const lines: string[] = [
        `## Bookmarks (${b.bookmarkCount}):\n${b.bookmarkListText}`,
        `\n## Existing Folders (${b.totalFolderCount}):\n${b.folderListText}`,
        `\n## Root Parents:\n${b.rootParentList}`,
        `\n## Domains:\n${b.domainList}`
      ];
      return lines.join('\n').trim();
    }
    case 'devtools': {
      return context.devtoolsContextData?.trim() || '';
    }
    case 'ask-page':
    default: {
      const lines: string[] = [];
      if (context.pageTitle || context.pageUrl) {
        lines.push(`Page Title: ${context.pageTitle || 'Untitled'}`);
        lines.push(`Page URL: ${context.pageUrl || 'unknown'}`);
      }
      if (context.selectedText?.trim()) {
        lines.push(`\nSelected Text:\n${context.selectedText.trim()}`);
      }
      if (context.pageContent?.trim()) {
        lines.push(`\nPage Content:\n${context.pageContent.trim()}`);
      }
      if (context.attachedTabs && context.attachedTabs.length > 0) {
        lines.push('\nAttached Tabs Context:');
        for (const tab of context.attachedTabs) {
          lines.push(`--- ${tab.title} (${tab.url}) ---\n${tab.content}`);
        }
      }
      return lines.join('\n').trim();
    }
  }
}

async function buildFullPrompt(context: PromptContext): Promise<string> {
  switch (context.scope) {
    case 'tab-group': {
      return buildTabGroupPrompt(
        context.systemPrompt || DEFAULT_TAB_GROUP_PROMPT.prompt,
        context.tabs || [],
        context.existingGroups || [],
        {
          customInstructions: context.customInstructions,
          keepExistingGroups: context.keepExistingGroups
        }
      );
    }
    case 'bookmarks': {
      if (!context.bookmarkOptions) return '';
      return buildBookmarkOrganizePrompt(
        context.systemPrompt || DEFAULT_BOOKMARK_ORGANIZE_PROMPT,
        context.bookmarkOptions
      );
    }
    case 'devtools': {
      if (context.buildDevtoolsSystemPrompt) {
        const sys = await context.buildDevtoolsSystemPrompt();
        const parts = [sys];
        if (context.historyMessages && context.historyMessages.length > 0) {
          parts.push('## Previous Conversation:');
          for (const m of context.historyMessages) {
            if (m.role === 'error') continue;
            parts.push(`[${m.role.toUpperCase()}]: ${m.content}`);
          }
        }
        if (context.userPrompt?.trim()) {
          parts.push(`[USER]: ${context.userPrompt.trim()}`);
        }
        return parts.join('\n\n').trim();
      }
      return buildPromptOnly(context);
    }
    case 'ask-page':
    default: {
      let sysContent = (context.systemPrompt || '')
        .replaceAll('{pageTitle}', context.pageTitle || '')
        .replaceAll('{pageUrl}', context.pageUrl || '')
        .replaceAll('{selectedText}', context.selectedText || '');

      if (sysContent.includes('{pageContent}')) {
        sysContent = sysContent.replaceAll('{pageContent}', context.pageContent || '(Could not extract page content)');
      }

      const attachedTabsContext = (context.attachedTabs || []).map(t => t.content).join('\n\n---\n\n');
      if (attachedTabsContext) {
        if (sysContent.includes('{tabContext}')) {
          sysContent = sysContent.replaceAll('{tabContext}', attachedTabsContext);
        } else {
          sysContent += '\n\nContext from attached tabs:\n' + attachedTabsContext;
        }
      } else {
        sysContent = sysContent.replaceAll('{tabContext}', '');
      }

      sysContent += MARKDOWN_FORMAT_INSTRUCTION;

      const fullSections: string[] = [`[SYSTEM INSTRUCTION]\n${sysContent}`];

      if (context.attachedTabs && context.attachedTabs.length > 0) {
        fullSections.push(
          `[ATTACHED TABS CONTEXT]\n${context.attachedTabs.map(t => `--- ${t.title} (${t.url}) ---\n${t.content}`).join('\n\n')}`
        );
      }

      if (context.historyMessages && context.historyMessages.length > 0) {
        for (const msg of context.historyMessages) {
          if (msg.role === 'error') continue;
          fullSections.push(`[${msg.role.toUpperCase()}]\n${msg.content}`);
        }
      }

      if (context.userPrompt?.trim()) {
        fullSections.push(`[USER]\n${context.userPrompt.trim()}`);
      }

      return fullSections.join('\n\n');
    }
  }
}

// ─── Module Registry ──────────────────────────────────────────────────────────

export const COPY_MODULES: CopyModule[] = [
  {
    id: 'full_prompt',
    label: 'Full Prompt',
    order: 1,
    build: ctx => buildFullPrompt(ctx),
  },
  {
    id: 'prompt',
    label: 'Prompt',
    order: 2,
    build: ctx => buildPromptOnly(ctx),
  },
  {
    id: 'browser_context',
    label: 'Browser Context',
    order: 3,
    build: ctx => buildBrowserContextOnly(ctx),
  },
];

/**
 * Returns available copy modules for the current context, sorted by `order`.
 */
export function getAvailableCopyModules(context: PromptContext): CopyModule[] {
  return COPY_MODULES
    .filter(m => (m.isAvailable ? m.isAvailable(context) : true))
    .sort((a, b) => a.order - b.order);
}

/**
 * Builds the content string for a given module ID.
 */
export async function buildModuleContent(moduleId: string, context: PromptContext): Promise<string> {
  const mod = COPY_MODULES.find(m => m.id === moduleId);
  if (!mod) {
    throw new Error(`Unknown copy module: "${moduleId}"`);
  }
  return await mod.build(context);
}

/**
 * Copies arbitrary text to clipboard with fallback for restricted extension contexts.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) {
    // Fallback to execCommand
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error('BrowserBot: Clipboard copy failed', err);
    return false;
  }
}
