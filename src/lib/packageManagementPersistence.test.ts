import { describe, expect, it } from "vitest";
import { apt, aptCache, dpkg } from "../commands/definitions";
import { generateCommand, initialInputs } from "../commands/generation";
import type { CommandDefinition, CommandInputs } from "../commands/types";
import { toggleFavorite, togglePin } from "./savedCommands";
import { defaultState, loadState, saveState, type StorageAdapter } from "./storage";

describe("T14 storage compatibility", () => {
  it("preserves previous pins and preferences while saving three package builders", () => {
    const old = { id: "old", commandId: "ssh", text: "ssh 'example.com'", createdAt: "2026-11-10T00:00:00Z" };
    let raw = JSON.stringify({ ...defaultState(), language: "en", theme: "dark", favorites: ["ssh"], pins: [old] });
    const storage: StorageAdapter = { getItem: () => raw, setItem: (_key, value) => { raw = value; } };
    let state = loadState(storage);
    const cases: Array<[CommandDefinition, CommandInputs]> = [
      [apt, { action: "install", packages: ["nginx"] }],
      [aptCache, { action: "policy", package: "nginx" }],
      [dpkg, { operation: "contents", archivePath: "./package.deb" }],
    ];
    for (const [definition, changes] of cases) {
      const generated = generateCommand(definition, { ...initialInputs(definition), ...changes });
      expect(generated.errors).toEqual([]);
      state = { ...state, favorites: toggleFavorite(state.favorites, definition.id), pins: togglePin(state.pins, { id: definition.id, commandId: definition.id, text: generated.command!, createdAt: "2026-11-11T00:00:00Z" }) };
      expect(saveState(state, storage)).toBe(true);
      expect(loadState(storage)).toEqual(state);
    }
    expect(state.pins[0]).toEqual(old);
    expect(state.favorites).toEqual(["ssh", "apt", "apt-cache", "dpkg"]);
    expect(state.version).toBe(1);
  });
});
