import { describe, expect, it } from "vitest";
import {
  defaultState,
  loadState,
  saveState,
  STORAGE_KEY,
  type StorageAdapter,
} from "./storage";

function memoryStorage(raw: string | null = null): StorageAdapter {
  let value = raw;
  return {
    getItem: (key) => (key === STORAGE_KEY ? value : null),
    setItem: (_key, next) => {
      value = next;
    },
  };
}

describe("versioned storage", () => {
  it("round trips preferences, favorites, pins, and prepared history", () => {
    const storage = memoryStorage();
    const pin = {
      id: "pin-1",
      commandId: "mkdir",
      text: "mkdir -- 'notes'",
      createdAt: "2026-10-14T00:00:00.000Z",
    };
    const state = {
      ...defaultState(),
      language: "en" as const,
      theme: "dark" as const,
      favorites: ["ls"],
      pins: [pin],
      recent: [pin],
    };
    expect(saveState(state, storage)).toBe(true);
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!)).toEqual(state);
    expect(loadState(storage)).toEqual(state);
  });
  it("resets missing, corrupt, incompatible, and malformed data", () => {
    for (const raw of [
      null,
      "{broken",
      "null",
      "[]",
      JSON.stringify({ ...defaultState(), version: 2 }),
      JSON.stringify({ ...defaultState(), language: "fr" }),
      JSON.stringify({ ...defaultState(), favorites: [123] }),
      JSON.stringify({ ...defaultState(), pins: [{ text: "ls" }] }),
      JSON.stringify({ ...defaultState(), recent: "ls" }),
    ]) {
      expect(loadState(memoryStorage(raw))).toEqual(defaultState());
    }
  });
  it("handles browser storage errors without crashing", () => {
    const blocked: StorageAdapter = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(loadState(blocked)).toEqual(defaultState());
    expect(saveState(defaultState(), blocked)).toBe(false);
  });
  it("rejects damaged saved commands and deduplicates favorite IDs", () => {
    const invalid = {
      id: "a",
      commandId: "ls",
      text: "ls\nrm",
      createdAt: "invalid",
    };
    expect(
      loadState(
        memoryStorage(JSON.stringify({ ...defaultState(), pins: [invalid] })),
      ),
    ).toEqual(defaultState());
    expect(
      loadState(
        memoryStorage(
          JSON.stringify({ ...defaultState(), favorites: ["ls", "ls"] }),
        ),
      ).favorites,
    ).toEqual(["ls"]);
  });
});
