import { describe, expect, it } from "vitest";
import { chgrp, htop } from "../commands/definitions";
import { generateCommand, initialInputs } from "../commands/generation";
import type { CommandDefinition, CommandInputs } from "../commands/types";
import { toggleFavorite, togglePin } from "./savedCommands";
import {
  defaultState,
  loadState,
  saveState,
  type StorageAdapter,
} from "./storage";

describe("T11 persistence", () => {
  it("roundtrips configured commands and favorites while preserving T10 syntax and preferences", () => {
    const legacy = {
      id: "old",
      commandId: "stderr-redirection",
      text: "'ls' 2>&1 > 'output.log'",
      createdAt: "2026-11-06T00:00:00Z",
    };
    let raw = JSON.stringify({
      ...defaultState(),
      language: "en",
      theme: "dark",
      favorites: ["stderr-redirection"],
      pins: [legacy],
    });
    const storage: StorageAdapter = {
      getItem: () => raw,
      setItem: (_key, value) => {
        raw = value;
      },
    };
    let state = loadState(storage);
    const cases: {
      definition: CommandDefinition;
      inputs: CommandInputs;
      text: string;
    }[] = [
      {
        definition: chgrp,
        inputs: {
          mode: "reference",
          reference: "group template",
          paths: ["project files"],
          recursive: true,
          sudo: true,
        },
        text: "sudo chgrp -R --reference='group template' -- 'project files'",
      },
      {
        definition: htop,
        inputs: {
          pids: "1234,,5678",
          delay: "20",
          sort: "PERCENT_MEM",
          tree: true,
          readonly: true,
        },
        text: "htop -p 1234,5678 -d 20 -s PERCENT_MEM -t --readonly",
      },
    ];
    for (const { definition, inputs, text } of cases) {
      expect(
        generateCommand(definition, {
          ...initialInputs(definition),
          ...inputs,
        }),
      ).toEqual({ command: text, errors: [] });
      const pin = {
        id: definition.id,
        commandId: definition.id,
        text,
        createdAt: "2026-11-07T00:00:00Z",
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
    expect(state.pins[0]).toEqual(legacy);
    expect(state.version).toBe(1);
    expect(state.favorites).toEqual(["stderr-redirection", "chgrp", "htop"]);
    expect(state.language).toBe("en");
    expect(state.theme).toBe("dark");
  });
});
