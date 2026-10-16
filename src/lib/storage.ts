import type { Language } from "../commands/types";

export type Theme = "light" | "dark";
export interface SavedCommand {
  id: string;
  commandId: string;
  text: string;
  createdAt: string;
}
export interface StoredState {
  version: 1;
  language: Language;
  theme: Theme;
  favorites: string[];
  pins: SavedCommand[];
  recent: SavedCommand[];
}
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export const STORAGE_KEY = "linux-command-builder";

export function defaultState(): StoredState {
  return {
    version: 1,
    language: "id",
    theme: "light",
    favorites: [],
    pins: [],
    recent: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && /^[a-z][a-z0-9-]*$/.test(value);
}
function isSavedCommand(value: unknown): value is SavedCommand {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    value.id.length <= 100 &&
    isIdentifier(value.commandId) &&
    typeof value.text === "string" &&
    value.text.length > 0 &&
    value.text.length <= 10000 &&
    !/[\x00-\x1f\x7f]/.test(value.text) &&
    typeof value.createdAt === "string" &&
    Number.isFinite(Date.parse(value.createdAt))
  );
}

export function isStoredState(value: unknown): value is StoredState {
  return (
    isRecord(value) &&
    value.version === 1 &&
    (value.language === "id" || value.language === "en") &&
    (value.theme === "light" || value.theme === "dark") &&
    Array.isArray(value.favorites) &&
    value.favorites.every(isIdentifier) &&
    Array.isArray(value.pins) &&
    value.pins.every(isSavedCommand) &&
    Array.isArray(value.recent) &&
    value.recent.every(isSavedCommand)
  );
}

export function browserStorage(): StorageAdapter | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function loadState(
  storage: StorageAdapter | undefined = browserStorage(),
): StoredState {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    // Unknown schema versions reset to defaults until a migration is deliberately added.
    if (!isStoredState(parsed)) return defaultState();
    return {
      version: 1,
      language: parsed.language,
      theme: parsed.theme,
      favorites: [...new Set(parsed.favorites)],
      pins: parsed.pins,
      recent: parsed.recent,
    };
  } catch {
    return defaultState();
  }
}

export function saveState(
  state: StoredState,
  storage: StorageAdapter | undefined = browserStorage(),
): boolean {
  try {
    if (!storage || !isStoredState(state)) return false;
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
