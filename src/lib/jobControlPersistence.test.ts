import { describe, expect, it } from "vitest";
import { background, fg, bg } from "../commands/definitions";
import { generateCommand, initialInputs } from "../commands/generation";
import { toggleFavorite, togglePin } from "./savedCommands";
import {
  defaultState,
  loadState,
  saveState,
  type StorageAdapter,
} from "./storage";

describe("job-control persistence", () => {
  it("preserves old pins/preferences while storing, restoring, and removing all three features", () => {
    const legacy = {
      id: "old-pin",
      commandId: "pgrep",
      text: "pgrep -- 'nginx'",
      createdAt: "2026-10-19T00:00:00Z",
    };
    let raw = JSON.stringify({
      ...defaultState(),
      favorites: ["pgrep"],
      pins: [legacy],
      theme: "dark",
      language: "en",
    });
    const storage: StorageAdapter = {
      getItem: () => raw,
      setItem: (_key, value) => {
        raw = value;
      },
    };
    let state = loadState(storage);
    for (const definition of [background, fg, bg]) {
      const result = generateCommand(definition, {
        ...initialInputs(definition),
        ...(definition === background
          ? { executable: "sleep", arguments: ["120"] }
          : { selection: "number", jobNumber: "2" }),
      });
      expect(result.errors).toEqual([]);
      const pin = {
        id: definition.id,
        commandId: definition.id,
        text: result.command!,
        createdAt: "2026-10-20T00:00:00Z",
      };
      state = {
        ...state,
        favorites: toggleFavorite(state.favorites, definition.id),
        pins: togglePin(state.pins, pin),
      };
      expect(saveState(state, storage)).toBe(true);
      expect(loadState(storage)).toEqual(state);
      expect(togglePin(state.pins, { ...pin, id: "duplicate" })).toHaveLength(
        state.pins.length - 1,
      );
      expect(toggleFavorite(state.favorites, definition.id)).not.toContain(
        definition.id,
      );
    }
    expect(state.version).toBe(1);
    expect(state.theme).toBe("dark");
    expect(state.language).toBe("en");
    expect(state.pins[0]).toEqual(legacy);
    expect(state.favorites).toEqual(["pgrep", "background", "fg", "bg"]);
    expect(state.pins.map((pin) => pin.text)).toEqual([
      legacy.text,
      "'sleep' '120' &",
      "fg %2",
      "bg %2",
    ]);
  });
});
