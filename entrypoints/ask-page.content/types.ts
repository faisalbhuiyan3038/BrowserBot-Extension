export interface AttachedTab {
  id: number;
  title: string;
  url: string;
  content: string;
}

export type SlashMode = 'root' | 'model' | 'prompt' | 'tab';

export interface SlashOption {
  key: string;
  title: string;
  desc: string;
  hint?: string;
  active?: boolean;
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
