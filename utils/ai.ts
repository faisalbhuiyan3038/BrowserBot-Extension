import { AppStorage, StorageState, OpenAIProvider, SystemPrompt } from './storage';
import type { OrganizePlan } from './bookmarks';
import {
  getLanguageModel,
  getChromeAIAvailability,
  normalizeOpenAIEndpoint,
  buildOpenAIHeaders,
  buildOpenAIPayload,
  normalizeOllamaEndpoint,
  parseJSONFromText,
} from './aiCommon';

export type TabInfo = {
  id: number;
  url: string;
  title: string;
};

export type ExistingGroup = {
  id?: number;
  title: string;
  color: string;
  tabIds: number[];
};

export type GroupCategory = {
  name: string;
  color: string;
  tabIds: number[];
};

/**
 * Interpolate prompt template variables with actual tab data.
 */
export function interpolatePrompt(
  template: string,
  tabs: TabInfo[],
  existingGroups: ExistingGroup[]
): string {
  const ungroupedIds = tabs
    .filter(t => !existingGroups.some(g => g.tabIds.includes(t.id)))
    .map(t => t.id);

  const replacements: Record<string, string> = {
    '{tabList}': JSON.stringify(tabs.map(t => ({ id: t.id, title: t.title, url: t.url })), null, 2),
    '{tabCount}': String(tabs.length),
    '{tabIds}': tabs.map(t => t.id).join(', '),
    '{tabTitles}': tabs.map(t => t.title).join('\n'),
    '{tabUrls}': tabs.map(t => t.url).join('\n'),
    '{tabTitleUrlPairs}': tabs.map(t => `${t.title} — ${t.url}`).join('\n'),
    '{existingGroups}': JSON.stringify(existingGroups, null, 2),
    '{ungroupedTabIds}': ungroupedIds.join(', '),
  };

  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replaceAll(key, value);
  }
  return result;
}

// The output format is always appended programmatically — users
// don't need to include it in their custom prompts.
export const OUTPUT_FORMAT_INSTRUCTION = `

Return a JSON object with the following structure:
{
  "categories": [
    {
      "name": "Category Name",
      "color": "blue",
      "tabIds": [1, 2, 3]
    }
  ]
}

"color" must be one of: grey, blue, red, yellow, green, pink, purple, cyan, orange.
"tabIds" must contain tab IDs from the provided list.
Only return valid JSON, no markdown blocks or conversational text.`;

export interface GroupTabsOptions {
  promptId?: string;           // override the active prompt
  customInstructions?: string; // extra instructions appended to the prompt
  keepExistingGroups?: boolean; // programmatic instruction to preserve existing groups
}

export function buildTabGroupPrompt(
  templateText: string,
  tabs: TabInfo[],
  existingGroups: ExistingGroup[] = [],
  options: GroupTabsOptions = {}
): string {
  let promptText = templateText;

  if (options.keepExistingGroups && existingGroups.length > 0) {
    promptText += `\n\nIMPORTANT: The user wants to keep their existing tab groups intact.\nHere is the data for existing groups:\n{existingGroups}\n\nIf a tab currently belongs to an existing group, you MUST keep it in that group by assigning it the EXACT same "name" and "color". You may also add ungrouped tabs to these existing groups. Do not rename existing groups or change their colors.`;
  }

  let fullPrompt = interpolatePrompt(promptText, tabs, existingGroups);

  if (options.customInstructions?.trim()) {
    fullPrompt += '\n\nAdditional instructions:\n' + options.customInstructions.trim();
  }

  fullPrompt += OUTPUT_FORMAT_INSTRUCTION;
  return fullPrompt;
}

export async function groupTabsWithAI(
  tabs: TabInfo[],
  existingGroups: ExistingGroup[] = [],
  options: GroupTabsOptions = {}
): Promise<GroupCategory[]> {
  const state = await AppStorage.get();

  // Resolve which prompt to use
  let promptTemplate: SystemPrompt;
  if (options.promptId) {
    promptTemplate = state.tabGroupPrompts.find(p => p.id === options.promptId)
      ?? await AppStorage.getActiveTabGroupPrompt();
  } else {
    promptTemplate = await AppStorage.getActiveTabGroupPrompt();
  }

  const fullPrompt = buildTabGroupPrompt(promptTemplate.prompt, tabs, existingGroups, options);

  let jsonResponse = '';

  if (state.activeProvider === 'chrome_ai') {
    jsonResponse = await generateWithChromeAI(fullPrompt);
  } else if (state.activeProvider === 'ollama') {
    jsonResponse = await generateWithOllama(fullPrompt, state);
  } else if (state.activeProvider === 'openai') {
    const provider = state.openaiProviders.find(p => p.id === state.activeOpenAIProviderId);
    if (!provider) throw new Error('No active OpenAI provider configured. Please check Settings.');
    jsonResponse = await generateWithOpenAI(fullPrompt, provider);
  }

  const parsed = parseJSONFromText(jsonResponse);
  if (!parsed || !parsed.categories) {
    throw new Error(`AI returned invalid format. Raw response:\n${jsonResponse.substring(0, 300)}`);
  }
  return parsed.categories;
}

// ─── Chrome AI (Prompt API) ──────────────────────────────────

async function generateWithChromeAI(prompt: string): Promise<string> {
  const lm = getLanguageModel();
  if (!lm) {
    throw new Error('Chrome AI Prompt API is not available. Make sure you are using Chrome 131+ and enable the following flags in chrome://flags:\n• #optimization-guide-on-device-model → Enabled\n• #prompt-api-for-gemini-nano-multimodal-input → Enabled');
  }

  const availability = await getChromeAIAvailability(lm);

  // Accept both old ('readily') and new ('available') return values
  if (availability === 'no' || availability === 'unavailable') {
    throw new Error(`Chrome AI model is not available (status: "${availability}"). Requires desktop with 22 GB+ free space and a supported GPU.`);
  }

  if (['after-download', 'downloadable', 'downloading'].includes(availability)) {
    throw new Error('Chrome AI model needs to be downloaded first. Please go to the Ask Page or Settings and trigger the download.');
  }

  // 'readily' or 'available' — proceed
  const session = await lm.create();
  try {
    return await session.prompt(prompt);
  } finally {
    session.destroy();
  }
}

// ─── Ollama ──────────────────────────────────────────────────

async function generateWithOllama(prompt: string, state: StorageState): Promise<string> {
  const url = normalizeOllamaEndpoint(state.ollamaEndpoint, '/api/generate');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: state.ollamaModel,
      prompt,
      stream: false,
      format: 'json'
    })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Ollama error ${res.status}: ${body || res.statusText}`);
  }
  const data = await res.json();
  return data.response;
}

// ─── OpenAI Compatible ──────────────────────────────────────

async function generateWithOpenAI(prompt: string, provider: OpenAIProvider): Promise<string> {
  const url = normalizeOpenAIEndpoint(provider.endpoint);
  const headers = buildOpenAIHeaders(provider.apiKey);
  const body = buildOpenAIPayload(provider.model, [{ role: 'user', content: prompt }], {
    reasoning: provider.reasoning,
  });

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`${provider.name} error ${res.status}: ${errBody || res.statusText}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ─── Organize Bookmarks with AI ──────────────────────────────

export interface OrganizeBookmarksOptions {
  bookmarkListText: string;
  folderListText: string;
  domainList: string;
  rootParentList: string;   // e.g. "Bookmarks Toolbar, Mobile Bookmarks"
  bookmarkCount: number;
  rootFolderCount: number;
  totalFolderCount: number;
  restrictToExisting?: boolean;
  customInstructions?: string;
}

export const BOOKMARK_OUTPUT_FORMAT = `

IMPORTANT — Root Folder Rules:
Browsers organize bookmarks under a few fixed "root" parent folders (e.g. "Bookmarks Toolbar", "Other Bookmarks", "Mobile Bookmarks").
Each bookmark in the list above shows its root parent after "root:". You MUST respect these boundaries:
- NEVER move a bookmark from one root parent to another (e.g. do NOT move a "Bookmarks Toolbar" bookmark into "Mobile Bookmarks").
- When you specify a targetFolderTitle, it must be a subfolder that lives (or will be created) inside the same root parent as the bookmark.
- Do NOT include the root parent folders themselves in "createFolders" or as move targets.

Return a JSON object with this exact structure:
{
  "createFolders": [
    { "title": "Folder Name" }
  ],
  "moves": [
    { "bookmarkId": "123", "targetFolderTitle": "Folder Name" }
  ]
}

Rules:
- "createFolders" lists new SUBFOLDERS to create (not root-level folders like "Bookmarks Toolbar").
- "moves" lists every bookmark by its EXACT original id (do NOT modify, shorten, or fabricate IDs) and the title of the subfolder it should go into.
- Every bookmark must have exactly one move entry.
- Only return valid JSON. No markdown, no explanation.`;

export function buildBookmarkOrganizePrompt(
  templatePrompt: string,
  options: OrganizeBookmarksOptions
): string {
  let prompt = (templatePrompt || '')
    .replace(/{bookmarkList}/g,     options.bookmarkListText)
    .replace(/{bookmarkCount}/g,    String(options.bookmarkCount))
    .replace(/{folderList}/g,       options.folderListText)
    .replace(/{rootFolderCount}/g,  String(options.rootFolderCount))
    .replace(/{totalFolderCount}/g, String(options.totalFolderCount))
    .replace(/{domainList}/g,       options.domainList)
    .replace(/{rootParentList}/g,   options.rootParentList)
    .replace(/{timestamp}/g,        new Date().toISOString());

  if (options.restrictToExisting) {
    prompt += `\n\nIMPORTANT: Only use the EXISTING folders listed above. Do NOT create any new folders. All bookmarks must be moved into one of the existing folders only.`;
  }

  if (options.customInstructions?.trim()) {
    prompt += '\n\nAdditional instructions:\n' + options.customInstructions.trim();
  }

  prompt += BOOKMARK_OUTPUT_FORMAT;
  return prompt;
}

export async function organizeBookmarksWithAI(
  options: OrganizeBookmarksOptions
): Promise<OrganizePlan> {
  const state = await AppStorage.get();

  const prompt = buildBookmarkOrganizePrompt(state.bookmarkOrganizePrompt, options);

  let jsonResponse = '';
  if (state.activeProvider === 'chrome_ai') {
    jsonResponse = await generateWithChromeAI(prompt);
  } else if (state.activeProvider === 'ollama') {
    jsonResponse = await generateWithOllama(prompt, state);
  } else if (state.activeProvider === 'openai') {
    const provider = state.openaiProviders.find(p => p.id === state.activeOpenAIProviderId);
    if (!provider) throw new Error('No active OpenAI provider configured. Please check Settings.');
    jsonResponse = await generateWithOpenAI(prompt, provider);
  }

  const parsed = parseJSONFromText(jsonResponse);
  if (!parsed || (!parsed.moves && !parsed.createFolders)) {
    throw new Error(`AI returned invalid format.\n\nRaw response:\n${jsonResponse.substring(0, 400)}`);
  }
  return {
    createFolders: parsed.createFolders || [],
    moves: parsed.moves || [],
  };
}
