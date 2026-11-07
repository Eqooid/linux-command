import { describe, expect, it } from "vitest";
import {
  pipeline,
  stdoutRedirection,
  stdinRedirection,
  stderrRedirection,
  background,
} from "./definitions";
import { generateCommand, initialInputs } from "./generation";
import { getCommand, commands, validateRegistry } from "./registry";
import { getStageCommand } from "./shellStageCommands";
import { getCommandWarnings } from "./warnings";
import {
  initialComposition,
  isShellComposition,
  moveStage,
} from "./shellComposition";
import { quoteShellArgument } from "./arguments";
import type {
  CommandDefinition,
  CommandInputs,
  CommandStage,
  ShellComposition,
  ShellRedirection,
} from "./types";

const literal = (executable: string, args: string[] = []): CommandStage => ({
  kind: "literal",
  executable,
  args,
});
const generate = (
  definition: CommandDefinition,
  stages: CommandStage[],
  redirections: ShellRedirection[] = [],
) => generateCommand(definition, { composition: { stages, redirections } });
const validPipe = () => [literal("ps", ["aux"]), literal("grep", ["nginx"])];

describe("structured pipelines", () => {
  it("keeps operators distinct from literal tokens in a two-stage pipeline", () => {
    expect(generate(pipeline, validPipe())).toEqual({
      command: "'ps' 'aux' | 'grep' 'nginx'",
      errors: [],
    });
  });
  it("supports three and four stages in the selected order", () => {
    const stages = [
      literal("cat", ["app.log"]),
      literal("grep", ["error"]),
      literal("sort"),
      literal("less"),
    ];
    expect(generate(pipeline, stages.slice(0, 3)).command).toBe(
      "'cat' 'app.log' | 'grep' 'error' | 'sort'",
    );
    expect(generate(pipeline, stages).command).toBe(
      "'cat' 'app.log' | 'grep' 'error' | 'sort' | 'less'",
    );
  });
  it("reuses an existing catalog generator without parsing or double quoting its output", () => {
    const ps = getStageCommand("ps")!;
    const first: CommandStage = {
      kind: "registry",
      commandId: "ps",
      inputs: { ...initialInputs(ps), mode: "bsd" } as Record<
        string,
        string | boolean | string[]
      >,
    };
    expect(
      generate(pipeline, [first, literal("grep", ["nginx"])]).command,
    ).toBe("ps aux | 'grep' 'nginx'");
    const cat = getStageCommand("cat")!;
    const file = "Owner's app.log";
    expect(
      generate(pipeline, [
        {
          kind: "registry",
          commandId: "cat",
          inputs: { ...initialInputs(cat), paths: [file] } as Record<
            string,
            string | boolean | string[]
          >,
        },
        literal("grep", ["error"]),
      ]).command,
    ).toBe(`cat -- ${quoteShellArgument(file)} | 'grep' 'error'`);
  });
  it("retains original catalog validation and exposes stdin-only use through literal stages", () => {
    const grep = getStageCommand("grep")!;
    const result = generate(pipeline, [
      literal("cat", ["app.log"]),
      {
        kind: "registry",
        commandId: "grep",
        inputs: { ...initialInputs(grep), pattern: "error" } as Record<
          string,
          string | boolean | string[]
        >,
      },
    ]);
    expect(result.command).toBeNull();
    expect(result.errors[0]!.en).toContain("Stage 2");
    expect(result.errors[0]!.id).toContain("Tahap 2");
    expect(
      generate(pipeline, [
        literal("cat", ["app.log"]),
        literal("grep", ["error"]),
      ]).errors,
    ).toEqual([]);
  });
  it.each([0, 1, 5])("rejects %s stages", (count) => {
    expect(
      generate(
        pipeline,
        Array.from({ length: count }, () => literal("cat")),
      ).command,
    ).toBeNull();
  });
  it.each([
    "",
    " ",
    "ps aux",
    "ls|cat",
    "ls;id",
    "$(id)",
    "`id`",
    "$SHELL",
    "ls > file",
    "x && y",
    "x || y",
    "/bin/x;id",
    "x\ncat",
  ])("rejects invalid stage executable %s", (executable) => {
    expect(
      generate(pipeline, [literal(executable), literal("cat")]).command,
    ).toBeNull();
  });
  it.each([
    "a b",
    "a'b",
    "|",
    "> file",
    "2>&1",
    "$(id)",
    "`id`",
    "$HOME",
    "*.log",
    "~",
    "&&",
    "||",
  ])("quotes argument %s without interpreting it", (arg) => {
    expect(
      generate(pipeline, [literal("printf", [arg]), literal("cat")]).command,
    ).toBe(`'printf' ${quoteShellArgument(arg)} | 'cat'`);
  });
  it("preserves deliberate empty arguments and accepts executable paths with spaces", () => {
    expect(
      generate(pipeline, [
        literal("/opt/My Tools/program", ["", " "]),
        literal("cat"),
      ]).command,
    ).toBe("'/opt/My Tools/program' '' ' ' | 'cat'");
  });
  it.each(["\0", "\n", "\r", "\x7f"])(
    "rejects control-character arguments",
    (arg) => {
      expect(
        generate(pipeline, [literal("printf", [arg]), literal("cat")]).command,
      ).toBeNull();
    },
  );
  it.each(["rm", "sudo", "background", "pipeline", "unknown"])(
    "rejects unsupported catalog stage %s",
    (commandId) => {
      expect(
        generate(pipeline, [
          { kind: "registry", commandId, inputs: {} },
          literal("cat"),
        ]).command,
      ).toBeNull();
    },
  );
  it("moves the entire stage configuration without mutating source state", () => {
    const value: ShellComposition = { stages: validPipe(), redirections: [] };
    const moved = moveStage(value, 1, -1);
    expect(generateCommand(pipeline, { composition: moved }).command).toBe(
      "'grep' 'nginx' | 'ps' 'aux'",
    );
    expect(value.stages[0]).toEqual(literal("ps", ["aux"]));
    expect(moveStage(value, 0, -1)).toBe(value);
    expect(moveStage(value, 1, 1)).toBe(value);
  });
});

describe("redirection serialization", () => {
  it.each<
    [
      {
        operator: ">" | ">>" | "<" | "2>" | "2>>";
        definition: CommandDefinition;
      },
    ]
  >([
    [{ operator: ">", definition: stdoutRedirection }],
    [{ operator: ">>", definition: stdoutRedirection }],
    [{ operator: "<", definition: stdinRedirection }],
    [{ operator: "2>", definition: stderrRedirection }],
    [{ operator: "2>>", definition: stderrRedirection }],
  ])("supports $operator with a literal target", ({ operator, definition }) => {
    expect(
      generate(
        definition,
        [literal("cat")],
        [{ operator, path: "a file.txt" }],
      ),
    ).toEqual({ command: `'cat' ${operator} 'a file.txt'`, errors: [] });
  });
  it("duplicates stderr without requiring a file target", () => {
    expect(
      generate(stderrRedirection, [literal("ls")], [{ operator: "2>&1" }])
        .command,
    ).toBe("'ls' 2>&1");
  });
  it.each([">", ">>"] as const)(
    "preserves both descriptor orders with %s",
    (operator) => {
      const file = { operator, path: "output.log" };
      const merge = { operator: "2>&1" as const };
      expect(
        generate(stderrRedirection, [literal("ls")], [file, merge]).command,
      ).toBe(`'ls' ${operator} 'output.log' 2>&1`);
      expect(
        generate(stderrRedirection, [literal("ls")], [merge, file]).command,
      ).toBe(`'ls' 2>&1 ${operator} 'output.log'`);
    },
  );
  it.each([
    "-",
    "--file",
    "Owner's file.txt",
    "$(id);|>&2",
    "*.log",
    "~/notes.txt",
    "a\\b",
  ])("quotes redirection path %s once and preserves it literally", (path) => {
    expect(
      generate(
        stdoutRedirection,
        [literal("printf", ["hello"])],
        [{ operator: ">", path }],
      ).command,
    ).toBe(`'printf' 'hello' > ${quoteShellArgument(path)}`);
  });
  it.each(["", " ", "\nfile", "a\0b", "a\r", "a\x7f"])(
    "rejects missing/invalid path %s",
    (path) => {
      expect(
        generate(stdoutRedirection, [literal("ls")], [{ operator: ">", path }])
          .command,
      ).toBeNull();
    },
  );
  it("requires one command for each redirection builder", () => {
    for (const definition of [
      stdoutRedirection,
      stdinRedirection,
      stderrRedirection,
    ]) {
      const redirections = initialComposition(definition.id).redirections.map(
        (item) => ("path" in item ? { ...item, path: "x" } : item),
      );
      expect(generate(definition, [], redirections).command).toBeNull();
      expect(
        generate(definition, validPipe(), redirections).command,
      ).toBeNull();
    }
  });
  it("rejects incompatible redirection combinations", () => {
    expect(
      generate(pipeline, validPipe(), [{ operator: ">", path: "x" }]).command,
    ).toBeNull();
    expect(
      generate(
        stdoutRedirection,
        [literal("ls")],
        [{ operator: "<", path: "x" }],
      ).command,
    ).toBeNull();
    expect(
      generate(
        stdinRedirection,
        [literal("ls")],
        [{ operator: ">>", path: "x" }],
      ).command,
    ).toBeNull();
    expect(
      generate(
        stderrRedirection,
        [literal("ls")],
        [{ operator: "2>", path: "x" }, { operator: "2>&1" }],
      ).command,
    ).toBeNull();
    expect(generate(stderrRedirection, [literal("ls")], []).command).toBeNull();
  });
});

describe("composition boundaries and learning", () => {
  it.each([
    null,
    {},
    "ps | cat",
    { stages: ["ps", "cat"], redirections: [] },
    {
      stages: [{ kind: "literal", executable: "ps", args: "aux" }],
      redirections: [],
    },
    { stages: validPipe(), redirections: [{ operator: "&&" }] },
    { stages: validPipe(), redirections: [], raw: "x" },
    {
      stages: [literal("cat")],
      redirections: [{ operator: "2>&1", path: "x" }],
    },
  ])("rejects malformed structure %j", (composition) => {
    expect(isShellComposition(composition)).toBe(false);
    expect(
      generateCommand(pipeline, { composition } as unknown as CommandInputs)
        .command,
    ).toBeNull();
  });
  it("rejects extra top-level raw fields and limits generated text", () => {
    expect(
      generateCommand(pipeline, {
        composition: { stages: validPipe(), redirections: [] },
        raw: "| cat",
      }).command,
    ).toBeNull();
    expect(
      generate(pipeline, [
        literal("printf", ["x".repeat(10001)]),
        literal("cat"),
      ]).command,
    ).toBeNull();
  });
  it("propagates catalog generation errors instead of silently producing an empty stage", () => {
    const definition = getStageCommand("cat")!;
    const stage: CommandStage = {
      kind: "registry",
      commandId: "cat",
      inputs: {
        ...initialInputs(definition),
        paths: ["x".repeat(10001)],
      } as Record<string, string | boolean | string[]>,
    };
    for (const result of [
      generate(pipeline, [stage, literal("grep", ["error"])]),
      generate(
        stdoutRedirection,
        [stage],
        [{ operator: ">", path: "out.txt" }],
      ),
    ]) {
      expect(result.command).toBeNull();
      expect(result.errors[0]!.en).toContain("too long");
      expect(result.errors[0]!.id).toContain("terlalu panjang");
    }
  });
  it("warns about actual overwrite operators, not operator-like argument text", () => {
    const warnings = (operator: ">" | ">>" | "2>" | "2>>") =>
      getCommandWarnings(
        operator.startsWith("2") ? stderrRedirection : stdoutRedirection,
        {
          composition: {
            stages: [literal("printf", [">"])],
            redirections: [{ operator, path: "x" }],
          },
        },
      );
    expect(
      warnings(">").some(
        (warning) =>
          warning.level === "warning" &&
          warning.text.en.includes("truncate") &&
          warning.text.id.includes("mengosongkan"),
      ),
    ).toBe(true);
    expect(warnings("2>").some((warning) => warning.level === "warning")).toBe(
      true,
    );
    expect(warnings(">>").every((warning) => warning.level === "note")).toBe(
      true,
    );
    expect(warnings("2>>").every((warning) => warning.level === "note")).toBe(
      true,
    );
    expect(
      getCommandWarnings(pipeline, {
        composition: {
          stages: [literal("printf", [">"]), literal("cat")],
          redirections: [],
        },
      }).every((warning) => warning.level === "note"),
    ).toBe(true);
  });
  it("registers four bilingual operator features without executables called operators", () => {
    expect(commands.filter((command) => command.category === "pipes")).toEqual([
      pipeline,
      stdoutRedirection,
      stdinRedirection,
      stderrRedirection,
    ]);
    for (const token of ["|", ">", ">>", "<", "2>", "2>>", "2>&1"])
      expect(getCommand(token)).toBeUndefined();
    for (const definition of [
      pipeline,
      stdoutRedirection,
      stdinRedirection,
      stderrRedirection,
    ]) {
      expect(definition.kind).toBe("shell-operator");
      expect(validateRegistry([definition])).toEqual([]);
      expect(
        definition.concepts!.some((concept) =>
          concept.description.en.includes("2>&1 > output.log"),
        ),
      ).toBe(true);
      expect(
        definition.examples.some(
          (example) => example.command === "cat app.log | grep error",
        ),
      ).toBe(true);
      expect(
        validateRegistry([
          { ...definition, explanation: { en: "Text", id: "" } },
        ]),
      ).toContain(`Missing translation: ${definition.id}`);
    }
  });
  it("preserves existing background execution generation", () => {
    expect(
      generateCommand(background, {
        ...initialInputs(background),
        executable: "sleep",
        arguments: ["120"],
      }),
    ).toEqual({ command: "'sleep' '120' &", errors: [] });
  });
});
