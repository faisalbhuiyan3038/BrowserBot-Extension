import { parseJSONFromText } from './aiCommon';
import type { GroupCategory, TabInfo } from './ai';
import type { OrganizePlan, FlatFolder, FlatBookmark, OrganizeResult } from './bookmarks';
import { applyOrganizePlan } from './bookmarks';

export type ParsedActionType = 'tab_groups' | 'bookmarks' | 'chat';

export type ParsedAIAction =
  | { type: 'tab_groups'; categories: GroupCategory[] }
  | { type: 'bookmarks'; plan: OrganizePlan }
  | { type: 'chat'; content: string };

export interface ValidationResult {
  success: boolean;
  action?: ParsedAIAction;
  error?: string;
  actionableHint?: string;
}

const VALID_COLORS = new Set([
  'grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'
]);

/**
 * Validates and parses an AI response text into structured browser actions or chat content.
 * Handles markdown code fences (```json ... ```) and conversational text wrapper.
 */
export function validateAndParseAIResponse(
  rawText: string,
  expectedType: 'tab_groups' | 'bookmarks' | 'chat' | 'auto' = 'auto'
): ValidationResult {
  const text = (rawText || '').trim();
  if (!text) {
    return {
      success: false,
      error: 'Empty input.',
      actionableHint: 'Please paste the AI response text or JSON.'
    };
  }

  // If user explicitly asks for chat text or auto without JSON
  const parsedJson = parseJSONFromText<any>(text);

  // 1. Tab Grouping check
  if (expectedType === 'tab_groups' || (expectedType === 'auto' && parsedJson?.categories)) {
    if (!parsedJson || typeof parsedJson !== 'object') {
      return {
        success: false,
        error: 'Invalid JSON format for Tab Grouping.',
        actionableHint: 'Expected JSON object with a "categories" array. Example:\n{\n  "categories": [\n    { "name": "Work", "color": "blue", "tabIds": [1, 2] }\n  ]\n}'
      };
    }

    if (!Array.isArray(parsedJson.categories)) {
      return {
        success: false,
        error: 'Missing "categories" array.',
        actionableHint: 'The JSON must contain a top-level "categories" property holding an array of group objects.'
      };
    }

    if (parsedJson.categories.length === 0) {
      return {
        success: false,
        error: '"categories" array is empty.',
        actionableHint: 'Provide at least one category with "name" and "tabIds".'
      };
    }

    const validatedCategories: GroupCategory[] = [];
    for (let i = 0; i < parsedJson.categories.length; i++) {
      const item = parsedJson.categories[i];
      if (!item || typeof item !== 'object') {
        return {
          success: false,
          error: `Category at index ${i} is not a valid object.`,
          actionableHint: 'Each item in "categories" must be an object with { name, color, tabIds }.'
        };
      }

      if (typeof item.name !== 'string' || !item.name.trim()) {
        return {
          success: false,
          error: `Category at index ${i} is missing a string "name".`,
          actionableHint: 'Every category must have a non-empty name string.'
        };
      }

      if (!Array.isArray(item.tabIds) || item.tabIds.length === 0) {
        return {
          success: false,
          error: `Category "${item.name}" has no "tabIds" array.`,
          actionableHint: '"tabIds" must be a non-empty array of numbers (e.g. [12, 15]).'
        };
      }

      const validTabIds = item.tabIds
        .map((id: any) => Number(id))
        .filter((n: number) => !isNaN(n) && n > 0);

      if (validTabIds.length === 0) {
        return {
          success: false,
          error: `Category "${item.name}" has invalid or empty tab IDs.`,
          actionableHint: 'Ensure tabIds are valid numeric tab identifiers.'
        };
      }

      let color = (typeof item.color === 'string' ? item.color.toLowerCase() : 'blue').trim();
      if (!VALID_COLORS.has(color)) {
        color = 'blue';
      }

      validatedCategories.push({
        name: item.name.trim(),
        color,
        tabIds: validTabIds
      });
    }

    return {
      success: true,
      action: {
        type: 'tab_groups',
        categories: validatedCategories
      }
    };
  }

  // 2. Bookmarks check
  if (expectedType === 'bookmarks' || (expectedType === 'auto' && (parsedJson?.moves || parsedJson?.createFolders))) {
    if (!parsedJson || typeof parsedJson !== 'object') {
      return {
        success: false,
        error: 'Invalid JSON format for Bookmark Organization.',
        actionableHint: 'Expected JSON object with "moves" and/or "createFolders". Example:\n{\n  "createFolders": [{ "title": "Dev" }],\n  "moves": [{ "bookmarkId": "12", "targetFolderTitle": "Dev" }]\n}'
      };
    }

    const hasMoves = Array.isArray(parsedJson.moves);
    const hasCreate = Array.isArray(parsedJson.createFolders);

    if (!hasMoves && !hasCreate) {
      return {
        success: false,
        error: 'Missing both "moves" and "createFolders" arrays.',
        actionableHint: 'Provide either a "moves" array or a "createFolders" array in the JSON.'
      };
    }

    const plan: OrganizePlan = {
      createFolders: [],
      moves: []
    };

    if (hasCreate) {
      for (let i = 0; i < parsedJson.createFolders.length; i++) {
        const f = parsedJson.createFolders[i];
        if (f && typeof f.title === 'string' && f.title.trim()) {
          plan.createFolders.push({ title: f.title.trim() });
        }
      }
    }

    if (hasMoves) {
      for (let i = 0; i < parsedJson.moves.length; i++) {
        const m = parsedJson.moves[i];
        if (!m || !m.bookmarkId || !m.targetFolderTitle) {
          return {
            success: false,
            error: `Bookmark move at index ${i} is missing "bookmarkId" or "targetFolderTitle".`,
            actionableHint: 'Each move item must contain: { bookmarkId: "...", targetFolderTitle: "..." }.'
          };
        }
        plan.moves.push({
          bookmarkId: String(m.bookmarkId).trim(),
          targetFolderTitle: String(m.targetFolderTitle).trim()
        });
      }
    }

    if (plan.moves.length === 0 && plan.createFolders.length === 0) {
      return {
        success: false,
        error: 'Bookmark plan contains 0 moves and 0 folder creations.',
        actionableHint: 'Provide at least one bookmark move or new folder to create.'
      };
    }

    return {
      success: true,
      action: {
        type: 'bookmarks',
        plan
      }
    };
  }

  // 3. Fallback to chat response
  if (expectedType === 'chat' || expectedType === 'auto') {
    return {
      success: true,
      action: {
        type: 'chat',
        content: text
      }
    };
  }

  return {
    success: false,
    error: 'Unrecognized response format.',
    actionableHint: 'Please check that the AI output matches the expected JSON structure.'
  };
}

// ─── Execution Pipelines ──────────────────────────────────────────────────────

/**
 * Executes tab grouping actions using existing browser.tabs.group and browser.tabGroups.update APIs.
 */
export async function executeTabGroups(
  categories: GroupCategory[],
  keepExisting: boolean = false,
  allTabs?: TabInfo[]
): Promise<{ created: number; totalTabs: number }> {
  if (!categories || categories.length === 0) {
    return { created: 0, totalTabs: 0 };
  }

  if (!keepExisting && allTabs && allTabs.length > 0) {
    try {
      const allTabIds = allTabs.map(t => t.id).filter(Boolean);
      if (allTabIds.length > 0) {
        await browser.tabs.ungroup(allTabIds as any);
      }
    } catch (_) {}
  }

  let created = 0;
  let totalTabs = 0;

  for (const cat of categories) {
    if (!cat.tabIds || cat.tabIds.length === 0) continue;
    try {
      const groupId = await browser.tabs.group({ tabIds: cat.tabIds as any });
      await browser.tabGroups.update(groupId, {
        title: cat.name,
        color: (cat.color || 'blue') as any,
      });
      created++;
      totalTabs += cat.tabIds.length;
    } catch (err) {
      console.warn(`BrowserBot: Failed to group tabs for "${cat.name}":`, err);
    }
  }

  return { created, totalTabs };
}

/**
 * Executes bookmark reorganization plan via existing applyOrganizePlan pipeline.
 */
export async function executeBookmarkPlan(
  plan: OrganizePlan,
  folders: FlatFolder[],
  bookmarks: FlatBookmark[] = [],
  restrictToExisting: boolean = false
): Promise<OrganizeResult> {
  return await applyOrganizePlan(plan, folders, bookmarks, restrictToExisting);
}
