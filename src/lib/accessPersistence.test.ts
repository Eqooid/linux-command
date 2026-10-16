import { describe, expect, it } from "vitest";
import { sudo, su, chmod, chown } from "../commands/definitions";
import { generateCommand, initialInputs } from "../commands/generation";
import type { CommandDefinition, CommandInputs } from "../commands/types";
import { toggleFavorite, togglePin } from "./savedCommands";
import {
  defaultState,
  loadState,
  saveState,
  type StorageAdapter,
} from "./storage";

describe("T07 persistence compatibility", () => {
  it("keeps T06 records beside all four new favorites and configured pins", () => {
    const legacy = {
      id: "legacy",
      commandId: "groups",
      text: "groups -- 'alice' 'bob'",
      createdAt: "2026-10-16T00:00:00Z",
    };
    let raw = JSON.stringify({
      ...defaultState(),
      favorites: ["groups"],
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
      theme: "dark" as const,
      language: "en" as const,
    };
    const cases: { definition: CommandDefinition; inputs: CommandInputs }[] = [
      {
        definition: sudo,
        inputs: { user: "postgres", executable: "psql", arguments: ["-l"] },
      },
      { definition: su, inputs: { mode: "login", user: "alice" } },
      { definition: chmod, inputs: { numeric: "754", paths: ["My Script"] } },
      {
        definition: chown,
        inputs: { owner: "alice", group: "developers", paths: ["project/"] },
      },
    ];
    for (const { definition, inputs } of cases) {
      const result = generateCommand(definition, {
        ...initialInputs(definition),
        ...inputs,
      });
      expect(result.errors).toEqual([]);
      const pin = {
        id: definition.id,
        commandId: definition.id,
        text: result.command!,
        createdAt: "2026-10-16T01:00:00Z",
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
    expect(state.pins[0]).toEqual(legacy);
    expect(state.favorites).toEqual(["groups", "sudo", "su", "chmod", "chown"]);
    expect(state.pins.map((pin) => pin.text)).toEqual([
      legacy.text,
      "sudo -u 'postgres' -- 'psql' '-l'",
      "su -l -- 'alice'",
      "chmod -- '754' 'My Script'",
      "chown -- 'alice:developers' 'project/'",
    ]);
  });
});
