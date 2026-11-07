import { describe, expect, it } from "vitest";
import { chgrp, htop } from "./definitions";
import { generateCommand, initialInputs } from "./generation";
import { getCommand, validateRegistry } from "./registry";
import { getCommandWarnings } from "./warnings";
import { groupOperand, isGroupNameOrGid } from "./ownership";
import { htopPids, htopSortKeys } from "./htop";
import { quoteShellArgument } from "./arguments";
import type { CommandDefinition, CommandInputs } from "./types";

const generate = (definition: CommandDefinition, values: CommandInputs = {}) =>
  generateCommand(definition, { ...initialInputs(definition), ...values });
const group = (values: CommandInputs = {}) =>
  generate(chgrp, { group: "developers", paths: ["app.log"], ...values });

describe("chgrp", () => {
  it("requires a group and target by default without selecting sudo or recursion", () => {
    expect(generate(chgrp).command).toBeNull();
    expect(initialInputs(chgrp)).toMatchObject({
      mode: "direct",
      sudo: false,
      recursive: false,
    });
    expect(group()).toEqual({
      command: "chgrp -- 'developers' 'app.log'",
      errors: [],
    });
  });
  it.each(["staff", "www-data", "_team", "team.dev"])(
    "supports group name %s",
    (value) => {
      expect(group({ group: value }).command).toBe(
        `chgrp -- '${value}' 'app.log'`,
      );
    },
  );
  it.each([
    ["0", "+0"],
    ["1001", "+1001"],
    ["0001001", "+1001"],
    ["4294967294", "+4294967294"],
  ])("disambiguates numeric GID %s", (value, operand) => {
    expect(isGroupNameOrGid(value)).toBe(true);
    expect(groupOperand(value)).toBe(operand);
    expect(group({ group: value }).command).toBe(
      `chgrp -- '${operand}' 'app.log'`,
    );
  });
  it.each([
    "",
    " ",
    "-1",
    "+1",
    "1.2",
    "1e3",
    "4294967295",
    "999999999999999999999",
    "team name",
    "-staff",
    "$(id)",
    "a;id",
    "a:b",
    "a'b",
  ])("rejects invalid group/GID %s", (value) => {
    expect(group({ group: value }).command).toBeNull();
  });
  it("supports multiple targets, reporting modes, recursion and explicit sudo", () => {
    expect(
      group({
        paths: ["a", "b"],
        recursive: true,
        reporting: "verbose",
        sudo: true,
      }).command,
    ).toBe("sudo chgrp -R -v -- 'developers' 'a' 'b'");
    expect(group({ reporting: "changes" }).command).toBe(
      "chgrp -c -- 'developers' 'app.log'",
    );
  });
  it("requires reference instead of group in reference mode and ignores hidden stale values", () => {
    expect(group({ mode: "reference" }).command).toBeNull();
    expect(
      group({
        mode: "reference",
        group: "$(invalid)",
        reference: "template.txt",
      }).command,
    ).toBe("chgrp --reference='template.txt' -- 'app.log'");
    expect(group({ reference: "$(ignored)" }).command).toBe(
      "chgrp -- 'developers' 'app.log'",
    );
  });
  it.each([
    "file with spaces",
    "Owner's file",
    "-option",
    "$(id); > file",
    "~/file",
    "*.txt",
  ])("quotes literal targets and reference paths %s", (path) => {
    expect(group({ paths: [path] }).command).toBe(
      `chgrp -- 'developers' ${quoteShellArgument(path)}`,
    );
    expect(
      group({ mode: "reference", reference: path, paths: [path] }).command,
    ).toBe(
      `chgrp --reference=${quoteShellArgument(path)} -- ${quoteShellArgument(path)}`,
    );
  });
  it("preserves the shared path helper's lone-hyphen behavior", () => {
    expect(group({ paths: ["-"] }).command).toBe("chgrp -- 'developers' './-'");
  });
  it.each<CommandInputs>([
    { paths: [] },
    { paths: [""] },
    { paths: ["a", " "] },
    { paths: ["a\nfile"] },
    { mode: "reference", reference: "a\0b" },
    { mode: "both" },
    { reporting: "both" },
    { verboseReport: true },
    { sudo: "yes" },
  ])("rejects invalid configuration %j", (values) => {
    expect(group(values).command).toBeNull();
  });
  it("shows recursive and explicit privilege warnings in both languages", () => {
    const warnings = getCommandWarnings(chgrp, {
      ...initialInputs(chgrp),
      recursive: true,
      sudo: true,
    });
    expect(
      warnings.some(
        (warning) =>
          warning.text.en.includes("Recursive") &&
          warning.text.id.includes("rekursif"),
      ),
    ).toBe(true);
    expect(
      warnings.some(
        (warning) =>
          warning.text.en.includes("Explicit sudo") &&
          warning.text.id.includes("Sudo eksplisit"),
      ),
    ).toBe(true);
  });
});

describe("htop", () => {
  it("generates htop without unnecessary required fields", () => {
    expect(generate(htop)).toEqual({ command: "htop", errors: [] });
  });
  it.each(["developer", "root", "www-data", "_user"])(
    "quotes username %s",
    (username) => {
      expect(generate(htop, { username }).command).toBe(
        `htop -u '${username}'`,
      );
    },
  );
  it.each([
    " ",
    "1001",
    "-root",
    "a b",
    "a;id",
    "$(id)",
    "a'b",
    "DOMAIN\\alice",
  ])("rejects invalid username %s", (username) => {
    expect(generate(htop, { username }).command).toBeNull();
  });
  it.each([
    ["1234", "1234"],
    ["1234,5678", "1234,5678"],
    [" 1234, ,5678, ", "1234,5678"],
    ["0012,,00034", "12,34"],
    ["2147483647", "2147483647"],
  ])("normalizes PID list %s", (pids, expected) => {
    expect(generate(htop, { pids }).command).toBe(`htop -p ${expected}`);
  });
  it("accepts empty/whitespace-only optional PID input but not comma-only accidental filters", () => {
    expect(htopPids("1, ,2,")).toEqual(["1", "2"]);
    expect(generate(htop, { pids: " " }).command).toBe("htop");
    expect(generate(htop, { pids: ", ," }).command).toBeNull();
  });
  it.each([
    "0",
    "-1",
    "+1",
    "1.2",
    "1e3",
    "123 456",
    "1,0",
    "1,-2",
    "1;id",
    "$(id)",
    "2147483648",
    "1\n,2",
  ])("rejects invalid PIDs %s", (pids) => {
    expect(generate(htop, { pids }).command).toBeNull();
  });
  it.each(["1", "10", "20", "100"])(
    "accepts positive tenths delay %s",
    (delay) => {
      expect(generate(htop, { delay }).command).toBe(`htop -d ${delay}`);
    },
  );
  it.each(["0", "-1", "+1", "1.5", "101", "1000", " ", "20ms", "20;id"])(
    "rejects invalid delay %s",
    (delay) => {
      expect(generate(htop, { delay }).command).toBeNull();
    },
  );
  it.each(htopSortKeys)("uses documented sort key %s", (sort) => {
    expect(generate(htop, { sort }).command).toBe(`htop -s ${sort}`);
  });
  it("supports tree/read-only and compatible combined filters in deterministic order", () => {
    expect(generate(htop, { tree: true }).command).toBe("htop -t");
    expect(generate(htop, { readonly: true }).command).toBe("htop --readonly");
    expect(
      generate(htop, {
        username: "alice",
        pids: "0012,,34",
        delay: "020",
        sort: "PERCENT_CPU",
        tree: true,
        readonly: true,
      }).command,
    ).toBe("htop -u 'alice' -p 12,34 -d 20 -s PERCENT_CPU -t --readonly");
  });
  it.each<CommandInputs>([
    { sort: "CPU" },
    { sort: "PERCENT_CPU;id" },
    { pids: ["1"] },
    { tree: "true" },
    { readonly: "true" },
    { sudo: true },
  ])("rejects malformed or unsupported input %j", (values) => {
    expect(generate(htop, values).command).toBeNull();
  });
});

describe("T11 educational metadata", () => {
  it("registers existing categories and complete bilingual content", () => {
    expect(getCommand("chgrp")).toBe(chgrp);
    expect(getCommand("htop")).toBe(htop);
    expect(chgrp.category).toBe("permissions");
    expect(htop.category).toBe("processes");
    for (const definition of [chgrp, htop]) {
      expect(validateRegistry([definition])).toEqual([]);
      expect(
        validateRegistry([
          { ...definition, explanation: { en: "Text", id: "" } },
        ]),
      ).toContain(`Missing translation: ${definition.id}`);
    }
    expect(chgrp.comparison!.map((row) => row.command)).toEqual([
      "chmod",
      "chown",
      "chgrp",
    ]);
    expect(htop.comparison!.map((row) => row.command)).toEqual([
      "ps",
      "top",
      "htop",
      "pgrep",
    ]);
  });
  it("includes all required shortcuts and documentation-only installation guidance", () => {
    expect(htop.shortcuts!.items.map((item) => item.keys)).toEqual([
      "F1",
      "F2",
      "F3",
      "F4",
      "F5",
      "F6",
      "F9",
      "F10",
    ]);
    expect(
      htop.shortcuts!.items.find((item) => item.keys === "F9")!.description.en,
    ).toContain("interrupt");
    expect(
      htop.examples.some(
        (example) =>
          example.command === "sudo apt install htop" &&
          example.description.en.includes("documentation") &&
          example.description.id.includes("dokumentasi"),
      ),
    ).toBe(true);
    expect(
      chgrp.examples.some(
        (example) =>
          example.command === "sudo chgrp -R developers /srv/project" &&
          example.description.en.includes("does not automatically grant"),
      ),
    ).toBe(true);
  });
});
