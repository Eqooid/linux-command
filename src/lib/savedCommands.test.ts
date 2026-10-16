import { describe, expect, it } from "vitest";
import {
  cat,
  cd,
  cp,
  find,
  grep,
  less,
  mkdir,
  mv,
  nano,
  rm,
  touch,
} from "../commands/definitions";
import { generateCommand, initialInputs } from "../commands/generation";
import { toggleFavorite, togglePin } from "./savedCommands";
import {
  defaultState,
  loadState,
  saveState,
  STORAGE_KEY,
  type SavedCommand,
  type StorageAdapter,
} from "./storage";

describe("saved command interactions and reload persistence", () => {
  it("preserves older records when saving find and grep configurations", () => {
    const oldPin = {
      id: "legacy",
      commandId: "nano",
      text: "nano -B -- 'notes'",
      createdAt: "2026-10-14T00:00:00Z",
    };
    let raw = JSON.stringify({
      ...defaultState(),
      favorites: ["cat"],
      pins: [oldPin],
    });
    const storage: StorageAdapter = {
      getItem: () => raw,
      setItem: (_key, value) => {
        raw = value;
      },
    };
    let state = {
      ...loadState(storage),
      language: "en" as const,
      theme: "dark" as const,
    };
    for (const definition of [find, grep]) {
      const inputs: Record<string, string | boolean | string[]> = {
        ...initialInputs(definition),
        ...(definition.id === "find"
          ? { namePattern: "*.txt" }
          : { pattern: "-error", paths: ["My Notes"], matchMode: "fixed" }),
      };
      const result = generateCommand(definition, inputs);
      expect(result.errors).toEqual([]);
      const pin = {
        id: definition.id,
        commandId: definition.id,
        text: result.command!,
        createdAt: "2026-10-15T00:00:00Z",
      };
      state = {
        ...state,
        favorites: toggleFavorite(state.favorites, definition.id),
        pins: togglePin(state.pins, pin),
      };
    }
    expect(saveState(state, storage)).toBe(true);
    expect(loadState(storage)).toEqual(state);
    expect(state.pins[0]).toEqual(oldPin);
    expect(state.favorites).toEqual(["cat", "find", "grep"]);
    expect(state.version).toBe(1);
  });
  it("keeps existing records while saving T04 favorites and exact command text", () => {
    const oldPin = {
      id: "old",
      commandId: "cp",
      text: "cp -a -- 'src' 'backup'",
      createdAt: "2026-10-14T00:00:00Z",
    };
    let raw = JSON.stringify({
      ...defaultState(),
      favorites: ["rm"],
      pins: [oldPin],
    });
    const storage: StorageAdapter = {
      getItem: () => raw,
      setItem: (_key, value) => {
        raw = value;
      },
    };
    let state = {
      ...loadState(storage),
      language: "en" as const,
      theme: "dark" as const,
    };
    for (const definition of [cat, less, nano]) {
      const inputs: Record<string, string | boolean | string[]> = {
        ...initialInputs(definition),
        ...(definition.id === "cat"
          ? { paths: ["My Notes"] }
          : { path: "My Notes" }),
      };
      const result = generateCommand(definition, inputs);
      expect(result.errors).toEqual([]);
      const pin = {
        id: definition.id,
        commandId: definition.id,
        text: result.command!,
        createdAt: "2026-10-15T00:00:00Z",
      };
      state = {
        ...state,
        favorites: toggleFavorite(state.favorites, definition.id),
        pins: togglePin(state.pins, pin),
      };
    }
    expect(saveState(state, storage)).toBe(true);
    expect(loadState(storage)).toEqual(state);
    expect(state.pins[0]).toEqual(oldPin);
    expect(state.favorites).toEqual(["rm", "cat", "less", "nano"]);
    expect(state.version).toBe(1);
  });
  it("persists T03 favorites/pins beside previous records using schema version 1", () => {
    let raw = JSON.stringify({
      ...defaultState(),
      favorites: ["pwd"],
      pins: [
        {
          id: "old",
          commandId: "ls",
          text: "ls -l",
          createdAt: "2026-10-14T00:00:00Z",
        },
      ],
    });
    const storage: StorageAdapter = {
      getItem: () => raw,
      setItem: (_key, value) => {
        raw = value;
      },
    };
    let state = loadState(storage);
    for (const definition of [cp, mv, rm]) {
      const inputs = {
        ...initialInputs(definition),
        ...(definition.id === "rm"
          ? { paths: ["temporary.txt"], confirmation: "each" }
          : { sources: ["old.txt"], destination: "new.txt" }),
      };
      const result = generateCommand(definition, inputs);
      expect(result.errors).toEqual([]);
      const pin = {
        id: definition.id,
        commandId: definition.id,
        text: result.command!,
        createdAt: "2026-10-15T00:00:00Z",
      };
      state = {
        ...state,
        favorites: toggleFavorite(state.favorites, definition.id),
        pins: togglePin(state.pins, pin),
      };
    }
    expect(saveState(state, storage)).toBe(true);
    expect(loadState(storage)).toEqual(state);
    expect(state.version).toBe(1);
    expect(state.pins[0].text).toBe("ls -l");
    expect(state.favorites).toEqual(["pwd", "cp", "mv", "rm"]);
  });
  it("preserves old version-1 records alongside new T02 commands", () => {
    let raw = JSON.stringify({
      ...defaultState(),
      favorites: ["ls"],
      pins: [
        {
          id: "old",
          commandId: "mkdir",
          text: "mkdir -p -- 'notes'",
          createdAt: "2026-10-14T00:00:00Z",
        },
      ],
    });
    const storage: StorageAdapter = {
      getItem: (key) => (key === STORAGE_KEY ? raw : null),
      setItem: (_key, value) => {
        raw = value;
      },
    };
    const oldState = loadState(storage);
    let state = {
      ...oldState,
      language: "en" as const,
      theme: "dark" as const,
    };
    for (const definition of [cd, mkdir, touch]) {
      const inputs = {
        ...initialInputs(definition),
        ...(definition.id === "cd" ? {} : { paths: ["My Notes"] }),
      };
      const text = generateCommand(definition, inputs).command!;
      const pin: SavedCommand = {
        id: definition.id,
        commandId: definition.id,
        text,
        createdAt: "2026-10-14T01:00:00Z",
      };
      state = {
        ...state,
        favorites: toggleFavorite(state.favorites, definition.id),
        pins: togglePin(state.pins, pin),
      };
    }
    expect(saveState(state, storage)).toBe(true);
    expect(loadState(storage)).toEqual(state);
    expect(state.pins[0]).toEqual(oldState.pins[0]);
    expect(state.version).toBe(1);
    expect(state.favorites).toEqual(["ls", "cd", "mkdir", "touch"]);
  });
  it("toggles exact pins without duplicating or removing different configurations", () => {
    const first: SavedCommand = {
      id: "a",
      commandId: "ls",
      text: "ls",
      createdAt: "2026-10-14T00:00:00Z",
    };
    const second = { ...first, id: "b", text: "ls -l" };
    const pins = togglePin(togglePin([], first), second);
    expect(pins).toHaveLength(2);
    expect(togglePin(pins, { ...first, id: "new" })).toEqual([second]);
    expect(toggleFavorite(["ls", "cd"], "cd")).toEqual(["ls"]);
  });
});
