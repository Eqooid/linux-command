import { describe, expect, it } from "vitest";
import { pgrep, pkill } from "./definitions";
import { generateCommand, initialInputs } from "./generation";
import { getCommand, validateRegistry } from "./registry";
import type { CommandInputs } from "./types";

function generate(inputs: CommandInputs = {}) {
  return generateCommand(pgrep, { ...initialInputs(pgrep), ...inputs });
}
const missingCriteria: CommandInputs[] = [
  {},
  { output: "count" },
  { matching: "full" },
  { exact: true },
  { ignoreCase: true },
  { age: "newest" },
  { age: "oldest" },
];

describe("pgrep output and matching", () => {
  it("defaults to PID-only regex matching without signals", () => {
    expect(generate({ pattern: "nginx" })).toEqual({
      command: "pgrep -- 'nginx'",
      errors: [],
    });
    expect(initialInputs(pgrep).output).toBe("pids");
    expect(initialInputs(pgrep)).not.toHaveProperty("signal");
  });
  it.each([
    ["pids", ""],
    ["name", " -l"],
    ["command", " -a"],
    ["count", " -c"],
  ])("supports output %s", (output, flag) => {
    expect(generate({ pattern: "nginx", output }).command).toBe(
      `pgrep${flag} -- 'nginx'`,
    );
  });
  it("separates full output from full matching", () => {
    expect(generate({ pattern: "node", output: "command" }).command).toBe(
      "pgrep -a -- 'node'",
    );
    expect(
      generate({ pattern: "node server.js", matching: "full" }).command,
    ).toBe("pgrep -f -- 'node server.js'");
    expect(
      generate({
        pattern: "node server.js",
        matching: "full",
        output: "command",
      }).command,
    ).toBe("pgrep -f -a -- 'node server.js'");
  });
  it("combines whole-string and case-insensitive regex modes", () => {
    expect(
      generate({ pattern: "nginx.*", exact: true, ignoreCase: true }).command,
    ).toBe("pgrep -x -i -- 'nginx.*'");
  });
  it.each([
    ["newest", "-n"],
    ["oldest", "-o"],
  ])("selects %s matches", (age, flag) => {
    expect(generate({ pattern: "python", age }).command).toBe(
      `pgrep ${flag} -- 'python'`,
    );
    expect(generate({ pattern: "python", age, output: "count" }).command).toBe(
      `pgrep -c ${flag} -- 'python'`,
    );
  });
  it.each([
    "-nginx",
    "user's process",
    "$(id); | >",
    "[",
    "error|warning",
    " node server.js ",
  ])("quotes pattern %j without evaluating it", (pattern) => {
    expect(generate({ pattern }).command).toBe(
      "pgrep -- '" + pattern.replaceAll("'", "'\"'\"'") + "'",
    );
  });
  it("keeps existing pkill output unchanged after sharing matching metadata", () => {
    expect(
      generateCommand(pkill, {
        ...initialInputs(pkill),
        pattern: "nginx",
        full: true,
        exact: true,
        ignoreCase: true,
        echo: true,
        username: "alice",
      }).command,
    ).toBe("pkill -TERM -f -x -i -e -u 'alice' -- 'nginx'");
  });
});

describe("pgrep selection criteria", () => {
  it("supports effective and real user filters with and without patterns", () => {
    expect(generate({ pattern: "sshd", username: "root" }).command).toBe(
      "pgrep -u 'root' -- 'sshd'",
    );
    expect(generate({ username: "root" }).command).toBe("pgrep -u 'root'");
    expect(generate({ pattern: "bash", realUsername: "alice" }).command).toBe(
      "pgrep -U 'alice' -- 'bash'",
    );
    expect(generate({ realUsername: "alice" }).command).toBe(
      "pgrep -U 'alice'",
    );
  });
  it("supports a parent PID without fabricating a pattern or empty operand", () => {
    expect(generate({ parentPid: "1234" })).toEqual({
      command: "pgrep -P 1234",
      errors: [],
    });
    expect(generate({ parentPid: "001234", output: "name" }).command).toBe(
      "pgrep -l -P 1234",
    );
    expect(generate({ parentPid: "2147483647", pattern: "node" }).command).toBe(
      "pgrep -P 2147483647 -- 'node'",
    );
  });
  it("combines compatible criteria deterministically", () => {
    expect(
      generate({
        matching: "full",
        exact: true,
        ignoreCase: true,
        output: "command",
        age: "newest",
        username: "service-user",
        realUsername: "alice",
        parentPid: "1234",
        pattern: "node .*",
      }).command,
    ).toBe(
      "pgrep -f -x -i -a -n -u 'service-user' -U 'alice' -P 1234 -- 'node .*'",
    );
  });
  it.each(missingCriteria)("rejects missing criteria %j", (inputs) => {
    const result = generate(inputs);
    expect(result.command).toBeNull();
    expect(result.errors[0]?.en).toContain("pattern");
    expect(result.errors[0]?.id).toContain("pola");
  });
  it.each([
    "0",
    "-1",
    "1.2",
    "1e3",
    "+2",
    "1,2",
    " ",
    "1234 ",
    "$(id)",
    "2147483648",
  ])("rejects invalid parent PID %j", (parentPid) => {
    expect(generate({ parentPid, pattern: "nginx" }).command).toBeNull();
    expect(generate({ parentPid }).command).toBeNull();
  });
  it.each([" ", "0", "alice,bob", "-root", "$(id)", "user name", "alice;id"])(
    "rejects invalid username %j in either user field",
    (name) => {
      expect(generate({ username: name, pattern: "node" }).command).toBeNull();
      expect(
        generate({ realUsername: name, pattern: "node" }).command,
      ).toBeNull();
    },
  );
  it.each([" ", "\t", "a\nb", "a\0b"])(
    "rejects blank/control pattern %j even with another filter",
    (pattern) => {
      expect(generate({ pattern, parentPid: "1234" }).command).toBeNull();
    },
  );
  it("rejects conflicting modes, raw flags, signal options, and malformed types", () => {
    const invalidInputs: CommandInputs[] = [
      { output: "name,command" },
      { age: "newest,oldest" },
      { newestSelection: true, oldestSelection: true },
      { nameOutput: true, commandOutput: true },
      { signal: "TERM" },
      { full: true },
      { matching: "regex" },
      { parentPid: true },
      { realUsername: ["alice"] },
      { exact: "true" },
    ];
    for (const inputs of invalidInputs)
      expect(generate({ ...inputs, pattern: "nginx" }).command).toBeNull();
  });
  it("registers complete bilingual content, groups, and comparison metadata", () => {
    expect(getCommand("pgrep")).toBe(pgrep);
    expect(validateRegistry([pgrep])).toEqual([]);
    expect(pgrep.comparison?.map((row) => row.command)).toEqual([
      "ps",
      "pgrep",
      "kill",
      "pkill",
    ]);
    expect(pgrep.explanation.en).toContain("AND");
    expect(pgrep.explanation.id).toContain("AND");
    expect(pgrep.examples).toHaveLength(12);
    expect(validateRegistry([{ ...pgrep, comparison: [] }])).toContain(
      "Invalid comparison: pgrep",
    );
    expect(
      validateRegistry([
        {
          ...pgrep,
          comparison: [{ command: "ps", description: { en: "Text", id: "" } }],
        },
      ]),
    ).toContain("Missing translation: pgrep");
    expect(
      validateRegistry([
        {
          ...pgrep,
          comparison: [pgrep.comparison![0]!, pgrep.comparison![0]!],
        },
      ]),
    ).toContain("Invalid comparison: pgrep");
  });
});
