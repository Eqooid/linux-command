import { describe, expect, it } from "vitest";
import { background, fg, bg, jobs } from "./definitions";
import { generateCommand, initialInputs } from "./generation";
import { commands, getCommand, validateRegistry } from "./registry";
import { quoteShellArgument } from "./arguments";
import { isBackgroundExecutable } from "./jobControl";
import type { CommandDefinition, CommandInputs } from "./types";

const generate = (definition: CommandDefinition, inputs: CommandInputs = {}) =>
  generateCommand(definition, { ...initialInputs(definition), ...inputs });

describe("background command composition", () => {
  it.each([
    ["sleep", [], "'sleep' &"],
    ["sleep", ["120"], "'sleep' '120' &"],
    ["python3", ["server.py"], "'python3' 'server.py' &"],
    ["npm", ["run", "dev"], "'npm' 'run' 'dev' &"],
    ["ping", ["example.com"], "'ping' 'example.com' &"],
    [
      "/opt/My Tools/program",
      ["a file.txt"],
      "'/opt/My Tools/program' 'a file.txt' &",
    ],
    [
      "./My Tools/program",
      ["--option", "-file"],
      "'./My Tools/program' '--option' '-file' &",
    ],
  ])(
    "serializes %s and literal argument rows",
    (executable, arguments_, expected) => {
      expect(
        generate(background, { executable, arguments: arguments_ }),
      ).toEqual({ command: expected, errors: [] });
    },
  );
  it("treats an untouched empty row as no arguments, preserving intentional empty rows", () => {
    expect(generate(background, { executable: "sleep" }).command).toBe(
      "'sleep' &",
    );
    expect(
      generate(background, { executable: "printf", arguments: ["", " "] })
        .command,
    ).toBe("'printf' '' ' ' &");
  });
  it.each([
    "&",
    "a;b",
    "|",
    "> file",
    "$(whoami)",
    "`id`",
    "$HOME",
    "*.txt",
    "a'b",
    "a\\b",
  ])(
    "keeps metacharacter argument %s inside quotes before the one trusted operator",
    (argument) => {
      expect(
        generate(background, { executable: "printf", arguments: [argument] }),
      ).toEqual({
        command: `'printf' ${quoteShellArgument(argument)} &`,
        errors: [],
      });
    },
  );
  it.each([
    "",
    " ",
    "sleep 120",
    "sleep &",
    "sleep;id",
    "sleep|id",
    "$(id)",
    "`id`",
    "$SHELL",
    "sh > file",
    "-bad",
    "./tool;id",
    "/bin/$(id)",
    "/bin/x\nwhoami",
    '"sleep"',
    "A=B sleep",
  ])("rejects unsupported executable input %s", (executable) => {
    const result = generate(background, { executable });
    expect(result.command).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
    for (const error of result.errors) {
      expect(error.en).not.toBe("");
      expect(error.id).not.toBe("");
    }
  });
  it("accepts a literal apostrophe in an executable path but never expands it", () => {
    const path = "/opt/Owner's Tools/program";
    expect(isBackgroundExecutable(path)).toBe(true);
    expect(generate(background, { executable: path }).command).toBe(
      `${quoteShellArgument(path)} &`,
    );
  });
  it.each(["\n", "\r", "\x00", "\x7f"])(
    "rejects control characters in arguments",
    (argument) => {
      expect(
        generate(background, { executable: "printf", arguments: [argument] })
          .command,
      ).toBeNull();
    },
  );
  it("does not weaken sudo/su's existing executable-token subset", () => {
    const sudo = getCommand("sudo")!;
    expect(
      generate(sudo, { executable: "/opt/My Tools/program" }).command,
    ).toBeNull();
  });
});

describe.each([fg, bg])("$name job control", (definition) => {
  it.each([
    [{}, ""],
    [{ selection: "explicit-current" }, " %+"],
    [{ selection: "previous" }, " %-"],
    [{ selection: "number", jobNumber: "1" }, " %1"],
    [{ selection: "number", jobNumber: "2" }, " %2"],
    [{ selection: "number", jobNumber: "00012" }, " %12"],
  ])("generates a trusted job specification for %j", (inputs, suffix) => {
    expect(generate(definition, inputs)).toEqual({
      command: definition.name + suffix,
      errors: [],
    });
  });
  it.each([
    "",
    "0",
    "-1",
    "+1",
    "1.2",
    "1e2",
    "%1",
    "1;id",
    "$(id)",
    "2147483648",
    " 1 ",
  ])("rejects invalid job number %s", (jobNumber) => {
    const result = generate(definition, { selection: "number", jobNumber });
    expect(result.command).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });
  it("rejects invalid selection modes and conflicting raw fields", () => {
    expect(generate(definition, { selection: "all" }).command).toBeNull();
    expect(generate(definition, { previous: true }).command).toBeNull();
  });
  it("ignores a stale hidden number when selecting current or previous", () => {
    expect(
      generate(definition, { selection: "current", jobNumber: "invalid" })
        .command,
    ).toBe(definition.name);
    expect(
      generate(definition, { selection: "previous", jobNumber: "invalid" })
        .command,
    ).toBe(`${definition.name} %-`);
  });
});

describe("job-control registry and learning metadata", () => {
  it("models a shell operator separately from executable commands and Bash builtins", () => {
    expect(background.kind).toBe("shell-operator");
    expect(background.name).toBe("command &");
    expect(getCommand("&")).toBeUndefined();
    expect(getCommand("command &")).toBeUndefined();
    for (const definition of [fg, bg, jobs])
      expect(definition.kind).toBe("builtin");
    expect(validateRegistry(commands)).toEqual([]);
    expect(validateRegistry([{ ...background, kind: "executable" }])).toContain(
      "Missing or invalid identity/syntax: background",
    );
    expect(validateRegistry([{ ...background, name: "&" }])).toContain(
      "Missing or invalid identity/syntax: background",
    );
  });
  it("requires both languages throughout new educational content", () => {
    for (const definition of [background, fg, bg]) {
      expect(validateRegistry([definition])).toEqual([]);
      expect(
        validateRegistry([
          { ...definition, explanation: { en: "Text", id: "" } },
        ]),
      ).toContain(`Missing translation: ${definition.id}`);
      expect(definition.shortcuts!.items.map((item) => item.keys)).toEqual([
        "Ctrl + Z",
        "Ctrl + C",
      ]);
      for (const concept of definition.concepts!)
        for (const language of ["en", "id"] as const) {
          expect(concept.term[language].trim()).not.toBe("");
          expect(concept.description[language].trim()).not.toBe("");
        }
      expect(
        definition.examples.some((example) =>
          example.command.includes("# Ctrl + Z"),
        ),
      ).toBe(true);
      expect(
        definition.examples.some((example) =>
          example.description.en.includes("actual job"),
        ),
      ).toBe(true);
    }
  });
});
