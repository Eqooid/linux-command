import { describe, expect, it } from "vitest";
import { free, df, du, uptime, uname, lsblk } from "../commands/definitions";
import { generateCommand, initialInputs } from "../commands/generation";
import { toggleFavorite, togglePin } from "./savedCommands";
import { defaultState, loadState, saveState, type StorageAdapter } from "./storage";

describe("T15 persisted state", () => {
  it("restores all six favorites and exact pins alongside older records", () => {
    const old = { id: "old", commandId: "apt", text: "apt update", createdAt: "2026-11-11T00:00:00Z" };
    let raw = JSON.stringify({ ...defaultState(), language: "en", theme: "dark", favorites: ["apt"], pins: [old] });
    const storage: StorageAdapter = { getItem: () => raw, setItem: (_key, value) => { raw = value; } };
    let state = loadState(storage);
    for (const definition of [free, df, du, uptime, uname, lsblk]) {
      const generated = generateCommand(definition, initialInputs(definition));
      expect(generated.errors).toEqual([]);
      const pin = { id: definition.id, commandId: definition.id, text: generated.command!, createdAt: "2026-11-16T00:00:00Z" };
      state = { ...state, favorites: toggleFavorite(state.favorites, definition.id), pins: togglePin(state.pins, pin) };
      expect(saveState(state, storage)).toBe(true);
      expect(loadState(storage)).toEqual(state);
      expect(togglePin(state.pins, pin)).toHaveLength(state.pins.length - 1);
    }
    expect(state.pins[0]).toEqual(old);
    expect(state.favorites).toEqual(["apt", "free", "df", "du", "uptime", "uname", "lsblk"]);
    expect(state.version).toBe(1);
    expect(state.language).toBe("en");
    expect(state.theme).toBe("dark");
  });
});
