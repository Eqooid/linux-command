import { describe, expect, it } from "vitest";
import {
  pipeline,
  stdoutRedirection,
  stdinRedirection,
  stderrRedirection,
} from "../commands/definitions";
import { generateCommand } from "../commands/generation";
import type { CommandDefinition, ShellRedirection } from "../commands/types";
import { toggleFavorite, togglePin } from "./savedCommands";
import {
  defaultState,
  loadState,
  saveState,
  type StorageAdapter,
} from "./storage";

describe("T10 favorites and pins", () => {
  it("preserves complete syntax, prior entries, and preferences using storage version 1", () => {
    const old = {
      id: "old",
      commandId: "journalctl",
      text: "journalctl -u 'nginx.service' -n 50",
      createdAt: "2026-10-21T00:00:00Z",
    };
    let raw = JSON.stringify({
      ...defaultState(),
      favorites: ["journalctl"],
      pins: [old],
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
    const cases: {
      definition: CommandDefinition;
      redirections: ShellRedirection[];
      text: string;
    }[] = [
      { definition: pipeline, redirections: [], text: "'ls' | 'cat'" },
      {
        definition: stdoutRedirection,
        redirections: [{ operator: ">>", path: "a file" }],
        text: "'ls' >> 'a file'",
      },
      {
        definition: stdinRedirection,
        redirections: [{ operator: "<", path: "a file" }],
        text: "'ls' < 'a file'",
      },
      {
        definition: stderrRedirection,
        redirections: [{ operator: "2>&1" }, { operator: ">", path: "a file" }],
        text: "'ls' 2>&1 > 'a file'",
      },
    ];
    for (const { definition, redirections, text } of cases) {
      const result = generateCommand(definition, {
        composition: {
          stages: [
            { kind: "literal", executable: "ls", args: [] },
            ...(definition === pipeline
              ? [{ kind: "literal" as const, executable: "cat", args: [] }]
              : []),
          ],
          redirections,
        },
      });
      expect(result).toEqual({ command: text, errors: [] });
      const pin = {
        id: definition.id,
        commandId: definition.id,
        text,
        createdAt: "2026-11-06T00:00:00Z",
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
    expect(state.pins[0]).toEqual(old);
    expect(state.favorites).toEqual([
      "journalctl",
      "pipeline",
      "stdout-redirection",
      "stdin-redirection",
      "stderr-redirection",
    ]);
    expect(state.version).toBe(1);
    expect(state.theme).toBe("dark");
    expect(state.language).toBe("en");
  });
});
