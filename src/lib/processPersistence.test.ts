import { describe, expect, it } from "vitest";
import { ps, top, kill, pkill, jobs } from "../commands/definitions";
import { generateCommand, initialInputs } from "../commands/generation";
import type { CommandDefinition, CommandInputs } from "../commands/types";
import { toggleFavorite, togglePin } from "./savedCommands";
import {
  defaultState,
  loadState,
  saveState,
  type StorageAdapter,
} from "./storage";

describe("T08 saved commands", () => {
  it("retains T07 records and preferences alongside all five new commands", () => {
    const legacy = {
      id: "legacy",
      commandId: "chmod",
      text: "chmod -- '754' 'My Script'",
      createdAt: "2026-10-16T00:00:00Z",
    };
    let raw = JSON.stringify({
      ...defaultState(),
      favorites: ["chmod"],
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
    const cases: {
      definition: CommandDefinition;
      inputs: CommandInputs;
      text: string;
    }[] = [
      { definition: ps, inputs: { mode: "bsd" }, text: "ps aux" },
      {
        definition: top,
        inputs: { batch: true, updates: "1" },
        text: "top -b -n 1",
      },
      {
        definition: kill,
        inputs: { pids: ["1234", "5678"] },
        text: "kill -TERM -- 1234 5678",
      },
      {
        definition: pkill,
        inputs: { pattern: "nginx", exact: true },
        text: "pkill -TERM -x -- 'nginx'",
      },
      {
        definition: jobs,
        inputs: { display: "long", jobspec: "%1" },
        text: "jobs -l -- '%1'",
      },
    ];
    for (const { definition, inputs, text } of cases) {
      const result = generateCommand(definition, {
        ...initialInputs(definition),
        ...inputs,
      });
      expect(result).toEqual({ command: text, errors: [] });
      const pin = {
        id: definition.id,
        commandId: definition.id,
        text,
        createdAt: "2026-10-18T00:00:00Z",
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
    expect(state.favorites).toEqual([
      "chmod",
      "ps",
      "top",
      "kill",
      "pkill",
      "jobs",
    ]);
  });
});
