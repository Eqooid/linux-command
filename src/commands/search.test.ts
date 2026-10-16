import { describe, expect, it } from "vitest";
import { find, grep } from "./definitions";
import {
  generateCommand,
  initialInputs,
  quoteShellArgument,
} from "./generation";
import type { CommandDefinition, CommandInputs } from "./types";
import { validateRegistry } from "./registry";

function build(definition: CommandDefinition, changes: CommandInputs = {}) {
  return generateCommand(definition, {
    ...initialInputs(definition),
    ...changes,
  });
}

describe("find", () => {
  it("defaults to one quoted current-directory starting point", () => {
    expect(build(find)).toEqual({ command: "find '.'", errors: [] });
    expect(initialInputs(find).start).toBe(".");
  });
  it("quotes filename globs for find, without shell expansion", () => {
    expect(build(find, { namePattern: "*.txt" }).command).toBe(
      "find '.' -name '*.txt'",
    );
    expect(
      build(find, {
        start: "/home/user",
        namePattern: "*.JPG",
        nameCase: "insensitive",
      }).command,
    ).toBe("find '/home/user' -iname '*.JPG'");
  });
  it.each([
    ["any", ""],
    ["file", " -type f"],
    ["directory", " -type d"],
  ])("selects entry type %s", (fileType, expected) => {
    expect(build(find, { fileType }).command).toBe("find '.'" + expected);
  });
  it.each(["c", "k", "M", "G"])(
    "supports all size comparisons with unit %s",
    (sizeUnit) => {
      for (const [sizeComparison, prefix] of [
        ["exact", ""],
        ["greater", "+"],
        ["less", "-"],
      ]) {
        expect(
          build(find, { useSize: true, size: "10", sizeUnit, sizeComparison })
            .command,
        ).toBe(`find '.' -size ${prefix}10${sizeUnit}`);
      }
    },
  );
  it.each([
    ["exact", ""],
    ["greater", "+"],
    ["less", "-"],
  ])("compares completed days using %s mode", (mtimeComparison, prefix) => {
    expect(
      build(find, { useMtime: true, mtime: "7", mtimeComparison }).command,
    ).toBe(`find '.' -mtime ${prefix}7`);
    expect(
      build(find, { useMtime: true, mtime: "0", mtimeComparison }).command,
    ).toBe(`find '.' -mtime ${prefix}0`);
  });
  it("places global depths before implicitly ANDed filters", () => {
    expect(
      build(find, {
        start: "My Projects",
        useMinDepth: true,
        minDepth: "0",
        useMaxDepth: true,
        maxDepth: "2",
        fileType: "file",
        namePattern: "*.log",
        nameCase: "insensitive",
        useSize: true,
        sizeComparison: "greater",
        size: "10",
        sizeUnit: "M",
        useMtime: true,
        mtimeComparison: "less",
        mtime: "7",
        empty: true,
      }).command,
    ).toBe(
      "find 'My Projects' -mindepth 0 -maxdepth 2 -type f -iname '*.log' -size +10M -mtime -7 -empty",
    );
  });
  it("supports zero depth and empty directory selection", () => {
    expect(
      build(find, {
        useMaxDepth: true,
        maxDepth: "0",
        fileType: "directory",
        empty: true,
      }).command,
    ).toBe("find '.' -maxdepth 0 -type d -empty");
  });
  it.each(["-exec", "--", "-delete", "!", "(", ")", "(folder)"])(
    "disambiguates expression-like starting path %s",
    (start) => {
      expect(build(find, { start }).command).toBe(
        "find " + quoteShellArgument("./" + start),
      );
    },
  );
  it("quotes shell metacharacters and apostrophes without adding actions", () => {
    const start = "user's $(id); folder",
      namePattern = "* -exec *.txt";
    expect(build(find, { start, namePattern }).command).toBe(
      `find ${quoteShellArgument(start)} -name ${quoteShellArgument(namePattern)}`,
    );
    expect(
      build(find, { start: "my folder", delete: true }).command,
    ).toBeNull();
  });
  it.each([
    "",
    " ",
    "0",
    "-1",
    "1.5",
    "1e3",
    "+10",
    "10M",
    "10;id",
    "9007199254740992",
  ])("rejects invalid size %j", (size) => {
    expect(build(find, { useSize: true, size }).command).toBeNull();
  });
  it.each(["-1", "1.5", "7d", " 7", "9007199254740992"])(
    "rejects invalid modification age %j",
    (mtime) => {
      expect(build(find, { useMtime: true, mtime }).command).toBeNull();
    },
  );
  it.each(["-1", "1.2", "two", "9007199254740992"])(
    "rejects invalid depth %j",
    (value) => {
      expect(
        build(find, { useMinDepth: true, minDepth: value }).command,
      ).toBeNull();
      expect(
        build(find, { useMaxDepth: true, maxDepth: value }).command,
      ).toBeNull();
    },
  );
  it("requires min <= max when both limits are enabled", () => {
    expect(
      build(find, {
        useMinDepth: true,
        minDepth: "3",
        useMaxDepth: true,
        maxDepth: "2",
      }).command,
    ).toBeNull();
  });
  it("rejects invalid choices, missing location, and control characters", () => {
    expect(
      build(find, { useSize: true, size: "10", sizeUnit: "MB" }).command,
    ).toBeNull();
    expect(
      build(find, { useSize: true, size: "10", sizeComparison: ">=" }).command,
    ).toBeNull();
    expect(
      build(find, { useMtime: true, mtime: "1", mtimeComparison: "<=" })
        .command,
    ).toBeNull();
    expect(build(find, { fileType: "executable" }).command).toBeNull();
    for (const start of ["", " ", "line\nbreak"])
      expect(build(find, { start }).command).toBeNull();
    expect(build(find, { namePattern: "*.txt\n-exec" }).command).toBeNull();
  });
  it("ignores disabled numeric filters and their stale choices", () => {
    expect(
      build(find, {
        size: "bad",
        sizeUnit: "bad",
        sizeComparison: "bad",
        mtime: "bad",
        mtimeComparison: "bad",
        minDepth: "-1",
        maxDepth: "-1",
      }).command,
    ).toBe("find '.'");
  });
});

describe("grep", () => {
  const operands = { pattern: "error", paths: ["application.log"] };
  it("uses basic regex by default with an explicit -e pattern", () => {
    expect(build(grep, operands).command).toBe(
      "grep -e 'error' -- 'application.log'",
    );
  });
  it("supports ignore case, numbers, inversion, and whole words", () => {
    expect(
      build(grep, {
        ...operands,
        ignoreCase: true,
        numbers: true,
        invert: true,
        word: true,
      }).command,
    ).toBe("grep -i -n -v -w -e 'error' -- 'application.log'");
  });
  it("whole-line mode omits a previously enabled whole-word flag", () => {
    expect(build(grep, { ...operands, word: true, line: true }).command).toBe(
      "grep -x -e 'error' -- 'application.log'",
    );
  });
  it.each([
    ["none", ""],
    ["recursive", "-r "],
    ["follow", "-R "],
  ])("selects recursive mode %s", (recursiveMode, flag) => {
    expect(build(grep, { ...operands, recursiveMode }).command).toBe(
      `grep ${flag}-e 'error' -- 'application.log'`,
    );
  });
  it.each([
    ["basic", ""],
    ["extended", "-E "],
    ["fixed", "-F "],
  ])(
    "selects matching mode %s without changing the pattern",
    (matchMode, flag) => {
      expect(
        build(grep, { pattern: "error|user.name", paths: ["a"], matchMode })
          .command,
      ).toBe(`grep ${flag}-e 'error|user.name' -- 'a'`);
    },
  );
  it.each([
    ["files", "-l"],
    ["counts", "-c"],
  ])("omits line numbers for %s output", (outputMode, flag) => {
    expect(
      build(grep, { ...operands, outputMode, numbers: true }).command,
    ).toBe(`grep ${flag} -e 'error' -- 'application.log'`);
  });
  it("serializes multiple literal paths, including leading hyphens and stdin-like names", () => {
    expect(
      build(grep, {
        pattern: "-n",
        paths: ["My Notes", "-report", "-", "*.ts"],
      }).command,
    ).toBe("grep -e '-n' -- 'My Notes' '-report' './-' '*.ts'");
  });
  it("preserves meaningful whitespace patterns and shell metacharacters", () => {
    expect(build(grep, { pattern: " ", paths: ["a"] }).command).toBe(
      "grep -e ' ' -- 'a'",
    );
    const pattern = "user's $(id);.*";
    expect(
      build(grep, { pattern, paths: ["a"], matchMode: "fixed" }).command,
    ).toBe(`grep -F -e ${quoteShellArgument(pattern)} -- 'a'`);
  });
  it("does not pretend to validate regex syntax with a JavaScript engine", () => {
    expect(build(grep, { pattern: "[", paths: ["a"] }).command).toBe(
      "grep -e '[' -- 'a'",
    );
  });
  it("requires a pattern and explicit file paths", () => {
    expect(build(grep).command).toBeNull();
    expect(build(grep, { pattern: "", paths: ["a"] }).command).toBeNull();
    expect(build(grep, { pattern: "x", paths: [] }).command).toBeNull();
    expect(build(grep, { pattern: "x", paths: ["a", " "] }).command).toBeNull();
    expect(
      build(grep, { pattern: "line\nbreak", paths: ["a"] }).command,
    ).toBeNull();
    expect(build(grep, { pattern: "x", paths: "a" }).command).toBeNull();
  });
  it("rejects conflicting modes and unknown raw flag fields", () => {
    const conflicts: CommandInputs[] = [
      { matchMode: "both" },
      { recursiveMode: "both" },
      { outputMode: "all" },
      { extended: true, fixed: true },
      { recursive: true, follow: true },
      { filenames: true, counts: true },
    ];
    for (const changes of conflicts) {
      expect(build(grep, { ...operands, ...changes }).command).toBeNull();
    }
  });
});

describe("search registry and bilingual metadata", () => {
  it("validates grouped forms and requires translated group headings", () => {
    expect(validateRegistry([find, grep])).toEqual([]);
    if (find.form.kind !== "grouped")
      throw new Error("Expected grouped find form");
    expect(
      validateRegistry([
        {
          ...find,
          form: {
            ...find.form,
            groups: find.form.groups.map((group) => ({
              ...group,
              title: { en: group.title.en, id: "" },
            })),
          },
        },
      ]),
    ).toContain("Missing translation: find");
    expect(
      validateRegistry([{ ...find, form: { ...find.form, groups: [] } }]),
    ).toContain("Invalid form groups: find");
  });
  it("returns bilingual validation messages", () => {
    for (const definition of [find, grep]) {
      const result = build(
        definition,
        definition.id === "find" ? { useMaxDepth: true, maxDepth: "-1" } : {},
      );
      expect(result.errors.length).toBeGreaterThan(0);
      for (const error of result.errors) {
        expect(error.en.trim()).not.toBe("");
        expect(error.id.trim()).not.toBe("");
      }
    }
  });
});
