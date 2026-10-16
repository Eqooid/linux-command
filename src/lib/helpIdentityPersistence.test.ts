import { describe, expect, it } from "vitest";
import { man, whoami, id, groups } from "../commands/definitions";
import { generateCommand, initialInputs } from "../commands/generation";
import { toggleFavorite, togglePin } from "./savedCommands";
import {
  defaultState,
  loadState,
  saveState,
  type StorageAdapter,
} from "./storage";

describe("T06 persistence compatibility", () => {
  it("preserves old commands alongside all new favorites and configured pins", () => {
    const oldPin = {
      id: "legacy",
      commandId: "grep",
      text: "grep -F -e 'error' -- 'app.log'",
      createdAt: "2026-10-15T00:00:00Z",
    };
    let raw = JSON.stringify({
      ...defaultState(),
      favorites: ["grep"],
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
      theme: "dark" as const,
      language: "en" as const,
    };
    for (const definition of [man, whoami, id, groups]) {
      const inputs = {
        ...initialInputs(definition),
        ...(definition.id === "man" ? { topic: "passwd", section: "5" } : {}),
        ...(definition.id === "id"
          ? { output: "groups", names: true, username: "alice" }
          : {}),
        ...(definition.id === "groups" ? { usernames: ["alice", "bob"] } : {}),
      };
      const result = generateCommand(definition, inputs);
      expect(result.errors).toEqual([]);
      const pin = {
        id: definition.id,
        commandId: definition.id,
        text: result.command!,
        createdAt: "2026-10-15T01:00:00Z",
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
    }
    expect(state.version).toBe(1);
    expect(state.pins[0]).toEqual(oldPin);
    expect(state.favorites).toEqual(["grep", "man", "whoami", "id", "groups"]);
    expect(state.pins.map((pin) => pin.text)).toEqual([
      oldPin.text,
      "man -s 5 -- 'passwd'",
      "whoami",
      "id -G -n -- 'alice'",
      "groups -- 'alice' 'bob'",
    ]);
  });
});
