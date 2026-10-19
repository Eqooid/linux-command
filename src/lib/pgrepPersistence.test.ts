import { describe, expect, it } from "vitest";
import { pgrep } from "../commands/definitions";
import { generateCommand, initialInputs } from "../commands/generation";
import type { CommandInputs } from "../commands/types";
import { toggleFavorite, togglePin } from "./savedCommands";
import {
  defaultState,
  loadState,
  saveState,
  type StorageAdapter,
} from "./storage";

describe("pgrep T08 extension persistence", () => {
  it("preserves existing T08 records while saving pattern-free and configured pgrep pins", () => {
    const legacy = {
      id: "legacy",
      commandId: "pkill",
      text: "pkill -TERM -x -- 'nginx'",
      createdAt: "2026-10-18T00:00:00Z",
    };
    let raw = JSON.stringify({
      ...defaultState(),
      favorites: ["pkill"],
      pins: [legacy],
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
    state.favorites = toggleFavorite(state.favorites, "pgrep");
    const configurations: CommandInputs[] = [
      { parentPid: "1234" },
      { pattern: "nginx", exact: true, output: "name" },
    ];
    for (const inputs of configurations) {
      const result = generateCommand(pgrep, {
        ...initialInputs(pgrep),
        ...inputs,
      });
      expect(result.errors).toEqual([]);
      const pin = {
        id: String(state.pins.length),
        commandId: "pgrep",
        text: result.command!,
        createdAt: "2026-10-19T00:00:00Z",
      };
      state = { ...state, pins: togglePin(state.pins, pin) };
      expect(togglePin(state.pins, { ...pin, id: "duplicate" })).toHaveLength(
        state.pins.length - 1,
      );
    }
    expect(saveState(state, storage)).toBe(true);
    expect(loadState(storage)).toEqual(state);
    expect(state.version).toBe(1);
    expect(state.pins[0]).toEqual(legacy);
    expect(state.pins.map((pin) => pin.text)).toEqual([
      legacy.text,
      "pgrep -P 1234",
      "pgrep -x -l -- 'nginx'",
    ]);
    expect(state.favorites).toEqual(["pkill", "pgrep"]);
    expect(toggleFavorite(state.favorites, "pgrep")).toEqual(["pkill"]);
  });
});
