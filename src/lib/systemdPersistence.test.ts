import { describe, expect, it } from "vitest";
import { systemctl, journalctl } from "../commands/definitions";
import { generateCommand, initialInputs } from "../commands/generation";
import type { CommandDefinition, CommandInputs } from "../commands/types";
import { toggleFavorite, togglePin } from "./savedCommands";
import {
  defaultState,
  loadState,
  saveState,
  type StorageAdapter,
} from "./storage";

describe("T09 saved commands", () => {
  it("roundtrips new favorites and full command pins without replacing prior saved data", () => {
    const oldPin = {
      id: "legacy",
      commandId: "background",
      text: "'sleep' '120' &",
      createdAt: "2026-10-20T00:00:00Z",
    };
    let raw = JSON.stringify({
      ...defaultState(),
      theme: "dark",
      language: "en",
      favorites: ["background"],
      pins: [oldPin],
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
        definition: systemctl,
        inputs: { action: "enable", unit: "nginx", now: true, sudo: true },
        text: "sudo systemctl --now enable -- 'nginx'",
      },
      {
        definition: journalctl,
        inputs: {
          unit: "my-app.service",
          scope: "user",
          count: "50",
          output: "json",
          noPager: true,
        },
        text: "journalctl --user -u 'my-app.service' -n 50 -o json --no-pager",
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
        createdAt: "2026-10-21T00:00:00Z",
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
    expect(state.pins[0]).toEqual(oldPin);
    expect(state.favorites).toEqual(["background", "systemctl", "journalctl"]);
    expect(state.version).toBe(1);
    expect(state.language).toBe("en");
    expect(state.theme).toBe("dark");
  });
});
