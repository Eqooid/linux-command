import { describe, expect, it } from "vitest";
import { ssh, sshKeygen, sshCopyId, scp, sftp } from "../commands/definitions";
import { generateCommand, initialInputs } from "../commands/generation";
import { toggleFavorite, togglePin } from "./savedCommands";
import { defaultState, loadState, saveState, type StorageAdapter } from "./storage";

describe("T13 persistence compatibility", () => {
  it("saves new favorites and exact pins while preserving T12 data and preferences", () => {
    const old = { id: "old", commandId: "curl", text: "curl 'https://example.com'", createdAt: "2026-11-10T00:00:00Z" };
    let raw = JSON.stringify({ ...defaultState(), language: "en", theme: "dark", favorites: ["curl"], pins: [old] });
    const storage: StorageAdapter = { getItem: () => raw, setItem: (_key, value) => { raw = value; } };
    let state = loadState(storage);
    const cases = [
      [ssh, { host: "example.com", username: "developer" }],
      [sshKeygen, { comment: "laptop" }],
      [sshCopyId, { host: "example.com", publicKey: "~/.ssh/id_ed25519.pub" }],
      [scp, { host: "example.com", localPath: "./file", remotePath: "/tmp/file" }],
      [sftp, { host: "example.com" }],
    ] as const;
    for (const [definition, changes] of cases) {
      const generated = generateCommand(definition, { ...initialInputs(definition), ...changes });
      expect(generated.errors).toEqual([]);
      state = { ...state, favorites: toggleFavorite(state.favorites, definition.id), pins: togglePin(state.pins, { id: definition.id, commandId: definition.id, text: generated.command!, createdAt: "2026-11-11T00:00:00Z" }) };
      expect(saveState(state, storage)).toBe(true);
      expect(loadState(storage)).toEqual(state);
    }
    expect(state.pins[0]).toEqual(old);
    expect(state.favorites).toEqual(["curl", "ssh", "ssh-keygen", "ssh-copy-id", "scp", "sftp"]);
    expect(state.version).toBe(1);
  });
});
