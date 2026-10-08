export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

/**
 * Reads stored theme from browser.storage.local, defaulting to 'light'.
 */
export async function getStoredTheme(): Promise<Theme> {
  try {
    const data = await browser.storage.local.get(THEME_STORAGE_KEY);
    if (data && (data[THEME_STORAGE_KEY] === 'dark' || data[THEME_STORAGE_KEY] === 'light')) {
      return data[THEME_STORAGE_KEY] as Theme;
    }
  } catch {
    // Non-fatal, fallback to local storage
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(THEME_STORAGE_KEY);
      if (cached === 'dark' || cached === 'light') {
        return cached as Theme;
      }
    }
  } catch {
    // Non-fatal
  }

  return 'light';
}

/**
 * Stores theme into browser.storage.local and localStorage.
 */
export async function setStoredTheme(theme: Theme): Promise<void> {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  } catch {}

  try {
    await browser.storage.local.set({ [THEME_STORAGE_KEY]: theme });
  } catch (err) {
    console.error('[BrowserBot] Failed to save theme:', err);
  }
}

/**
 * Applies data-theme attribute to documentElement or target element/shadowRoot.
 */
export function applyTheme(theme: Theme, target?: HTMLElement | ShadowRoot | Document | null): void {
  try {
    if (target) {
      if (target instanceof Document) {
        target.documentElement?.setAttribute('data-theme', theme);
      } else if ('setAttribute' in target) {
        (target as HTMLElement).setAttribute('data-theme', theme);
      }
    } else if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  } catch {
    // Non-fatal
  }
}

/**
 * Initializes theme by reading storage and applying immediately.
 */
export async function initTheme(target?: HTMLElement | ShadowRoot | Document | null): Promise<Theme> {
  const theme = await getStoredTheme();
  applyTheme(theme, target);
  return theme;
}

/**
 * Listens for theme storage changes across pages and notifies callback.
 */
export function onThemeChange(callback: (theme: Theme) => void): () => void {
  const listener = (changes: any, area: string) => {
    if (area === 'local' && changes[THEME_STORAGE_KEY]) {
      const nextTheme = changes[THEME_STORAGE_KEY].newValue as Theme;
      if (nextTheme === 'dark' || nextTheme === 'light') {
        callback(nextTheme);
      }
    }
  };

  try {
    browser.storage.onChanged.addListener(listener);
    return () => {
      try {
        browser.storage.onChanged.removeListener(listener);
      } catch { /* noop */ }
    };
  } catch {
    return () => {};
  }
}
