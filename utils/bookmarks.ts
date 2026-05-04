// ─── Bookmark Utilities ───────────────────────────────────────

export interface FlatBookmark {
  id: string;
  title: string;
  url: string;
  parentId: string;
  parentTitle: string;
  depth: number;
  index: number;
}

export interface FlatFolder {
  id: string;
  title: string;
  parentId: string;
  depth: number;
}

export interface BookmarkTree {
  bookmarks: FlatBookmark[];
  folders: FlatFolder[];
}

// ─── Walk the browser bookmark tree and flatten it ───────────

export async function getBookmarkTree(): Promise<BookmarkTree> {
  const tree = await browser.bookmarks.getTree();
  const bookmarks: FlatBookmark[] = [];
  const folders: FlatFolder[] = [];

  function walk(nodes: browser.bookmarks.BookmarkTreeNode[], depth: number, parentTitle = '') {
    for (const node of nodes) {
      if (!node.url) {
        // It's a folder
        if (node.title && node.id !== '0' && node.id !== 'root________') {
          folders.push({
            id: node.id,
            title: node.title,
            parentId: node.parentId || '',
            depth,
          });
        }
        if (node.children) {
          walk(node.children, depth + 1, node.title || parentTitle);
        }
      } else {
        // It's a bookmark
        bookmarks.push({
          id: node.id,
          title: node.title || '(untitled)',
          url: node.url,
          parentId: node.parentId || '',
          parentTitle,
          depth,
          index: node.index ?? 0,
        });
      }
    }
  }

  walk(tree, 0);
  return { bookmarks, folders };
}

// ─── Build a human-readable text block for the AI ────────────

export function buildBookmarkListText(bookmarks: FlatBookmark[]): string {
  return bookmarks
    .map(b => `[${b.id}] "${b.title}" | ${b.url} | folder: "${b.parentTitle}"`)
    .join('\n');
}

export function buildFolderListText(folders: FlatFolder[]): string {
  // Only include user-created folders (depth >= 1 skips root wrappers)
  return folders
    .filter(f => f.depth >= 1)
    .map(f => `"${f.title}"`)
    .join(', ');
}

export function buildDomainList(bookmarks: FlatBookmark[]): string {
  const domains = new Set<string>();
  for (const b of bookmarks) {
    try {
      domains.add(new URL(b.url).hostname);
    } catch { /* skip invalid URLs */ }
  }
  return [...domains].slice(0, 60).join(', ');
}

// ─── Apply AI Organization Plan ───────────────────────────────

export interface OrganizePlan {
  // Folders to create first (parentId = '' means at Bookmarks Bar root)
  createFolders: { title: string; parentId: string }[];
  // Moves: bookmark id → target folder id (or title for newly created ones)
  moves: { bookmarkId: string; targetFolderTitle: string }[];
}

export interface OrganizeResult {
  foldersCreated: number;
  bookmarksMoved: number;
  errors: string[];
}

export async function applyOrganizePlan(
  plan: OrganizePlan,
  allFolders: FlatFolder[],
  restrictToExisting: boolean
): Promise<OrganizeResult> {
  const result: OrganizeResult = { foldersCreated: 0, bookmarksMoved: 0, errors: [] };

  // Build a map of folder title → id from existing folders
  const folderByTitle = new Map<string, string>();
  for (const f of allFolders) {
    folderByTitle.set(f.title.toLowerCase(), f.id);
  }

  // Get the "Bookmarks Bar" (or equivalent) to use as default parent for new folders
  let defaultParentId = '1'; // Chrome: '1' = Bookmarks bar
  try {
    const tree = await browser.bookmarks.getTree();
    const bar = tree[0]?.children?.find(c => c.id === '1' || c.title === 'Bookmarks bar' || c.title === 'Bookmarks Bar');
    if (bar) defaultParentId = bar.id;
  } catch { /* fall back to '1' */ }

  // Create new folders first (unless restricted to existing)
  const createdFolderIds = new Map<string, string>(); // title → id

  if (!restrictToExisting && plan.createFolders?.length) {
    for (const f of plan.createFolders) {
      const titleLower = f.title.toLowerCase();
      if (folderByTitle.has(titleLower)) {
        // Folder already exists — reuse it
        createdFolderIds.set(titleLower, folderByTitle.get(titleLower)!);
        continue;
      }
      try {
        const parentId = f.parentId || defaultParentId;
        const created = await browser.bookmarks.create({ parentId, title: f.title });
        createdFolderIds.set(titleLower, created.id);
        folderByTitle.set(titleLower, created.id);
        result.foldersCreated++;
      } catch (e: any) {
        result.errors.push(`Could not create folder "${f.title}": ${e.message}`);
      }
    }
  }

  // Apply moves
  for (const move of (plan.moves || [])) {
    const titleLower = move.targetFolderTitle.toLowerCase();
    const targetId = createdFolderIds.get(titleLower) ?? folderByTitle.get(titleLower);
    if (!targetId) {
      result.errors.push(`Folder not found: "${move.targetFolderTitle}" — bookmark skipped`);
      continue;
    }
    try {
      await browser.bookmarks.move(move.bookmarkId, { parentId: targetId });
      result.bookmarksMoved++;
    } catch (e: any) {
      result.errors.push(`Could not move bookmark ${move.bookmarkId}: ${e.message}`);
    }
  }

  return result;
}
