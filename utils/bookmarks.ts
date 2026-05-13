// ─── Bookmark Utilities ───────────────────────────────────────

export interface FlatBookmark {
  id: string;
  title: string;
  url: string;
  parentId: string;
  parentTitle: string;
  /** The id of the direct child of the bookmark root that contains this bookmark
   * e.g. toolbar_____, unfiled_____, mobile______, '1', '2', '3' */
  rootParentId: string;
  /** The title of the root parent folder (e.g. "Bookmarks Toolbar") */
  rootParentTitle: string;
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

/** IDs of the virtual root node across browsers */
const ROOT_IDS = new Set(['0', 'root________']);

export async function getBookmarkTree(): Promise<BookmarkTree> {
  const tree = await browser.bookmarks.getTree();
  const bookmarks: FlatBookmark[] = [];
  const folders: FlatFolder[] = [];

  function walk(
    nodes: browser.bookmarks.BookmarkTreeNode[],
    depth: number,
    parentTitle = '',
    rootParentId = '',
    rootParentTitle = ''
  ) {
    for (const node of nodes) {
      // Determine root parent: direct children of the virtual root become the rootParent
      const isRootChild = ROOT_IDS.has(node.parentId || '');
      const myRootParentId    = isRootChild ? node.id    : rootParentId;
      const myRootParentTitle = isRootChild ? (node.title || '') : rootParentTitle;

      if (!node.url) {
        // It's a folder
        if (node.title && !ROOT_IDS.has(node.id)) {
          folders.push({
            id: node.id,
            title: node.title,
            parentId: node.parentId || '',
            depth,
          });
        }
        if (node.children) {
          walk(node.children, depth + 1, node.title || parentTitle, myRootParentId, myRootParentTitle);
        }
      } else {
        // It's a bookmark
        bookmarks.push({
          id: node.id,
          title: node.title || '(untitled)',
          url: node.url,
          parentId: node.parentId || '',
          parentTitle,
          rootParentId: myRootParentId,
          rootParentTitle: myRootParentTitle,
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
    .map(b => `[${b.id}] "${b.title}" | ${b.url} | folder: "${b.parentTitle}" | root: "${b.rootParentTitle}"`)
    .join('\n');
}

/** Returns a deduplicated list of root parent titles present in the bookmark set */
export function buildRootParentList(bookmarks: FlatBookmark[]): string {
  const roots = new Set(bookmarks.map(b => b.rootParentTitle).filter(Boolean));
  return [...roots].join(', ');
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
  // Folders to create first
  createFolders: { title: string }[];
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
  allBookmarks: FlatBookmark[],
  restrictToExisting: boolean
): Promise<OrganizeResult> {
  const result: OrganizeResult = { foldersCreated: 0, bookmarksMoved: 0, errors: [] };

  // Build a map of folder title → id from existing folders
  const folderByTitle = new Map<string, string>();
  for (const f of allFolders) {
    folderByTitle.set(f.title.toLowerCase(), f.id);
  }

  // Build a map of bookmark id → rootParentId so we know where to create new folders
  const bookmarkRootParent = new Map<string, string>();
  for (const b of allBookmarks) {
    bookmarkRootParent.set(b.id, b.rootParentId);
  }

  // Resolve the root parent for each new folder by looking at which bookmarks will go into it.
  // This ensures "Developer Tools" gets created inside the same root (Toolbar/Mobile/Other)
  // as the bookmarks that belong there — not in some arbitrary default location.
  function resolveParentForFolder(folderTitle: string, fallbackRootId: string): string {
    const titleLower = folderTitle.toLowerCase();
    // Find all moves targeting this folder
    const targetingMoves = plan.moves?.filter(
      m => m.targetFolderTitle.toLowerCase() === titleLower
    ) || [];
    // Pick the rootParentId of the first bookmark that will go here
    for (const move of targetingMoves) {
      const root = bookmarkRootParent.get(move.bookmarkId);
      if (root) return root;
    }
    return fallbackRootId;
  }

  // Determine a fallback root parent (used only if no bookmark context is available)
  let fallbackRootId = '1';
  try {
    const tree = await browser.bookmarks.getTree();
    const rootChildren = tree[0]?.children || [];
    const bar   = rootChildren.find(c => c.id === '1' || c.id === 'toolbar_____' || /^bookmarks\s*(bar|toolbar)$/i.test(c.title || ''));
    const other = rootChildren.find(c => c.id === '2' || c.id === 'unfiled_____' || /^(other|unfiled)\s*bookmarks$/i.test(c.title || ''));
    const mobile = rootChildren.find(c => c.id === '3' || c.id === 'mobile______' || /^mobile\s*bookmarks$/i.test(c.title || ''));
    // Prefer bar for desktop, mobile if bar doesn't exist, then other
    if (bar) fallbackRootId = bar.id;
    else if (mobile) fallbackRootId = mobile.id;
    else if (other) fallbackRootId = other.id;
    else if (rootChildren.length > 0) fallbackRootId = rootChildren[0].id;
  } catch { /* keep '1' */ }

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
        // Derive the correct root parent from where the bookmarks heading here currently live
        const parentId = resolveParentForFolder(f.title, fallbackRootId);
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
