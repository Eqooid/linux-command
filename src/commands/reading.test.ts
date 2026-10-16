import { describe, expect, it } from "vitest";
import { cat, less, nano } from "./definitions";
import {
  generateCommand,
  initialInputs,
  quoteShellArgument,
} from "./generation";
import { validateRegistry } from "./registry";
import type { CommandDefinition, CommandInputs } from "./types";

function build(definition: CommandDefinition, changes: CommandInputs = {}) {
  return generateCommand(definition, {
    ...initialInputs(definition),
    ...changes,
  });
}

describe("cat", () => {
  it("serializes one or multiple files in row order", () => {
    expect(build(cat, { paths: ["notes.txt"] }).command).toBe(
      "cat -- 'notes.txt'",
    );
    expect(build(cat, { paths: ["first.txt", "My Notes"] }).command).toBe(
      "cat -- 'first.txt' 'My Notes'",
    );
  });
  it.each([
    ["all", "-n"],
    ["nonempty", "-b"],
  ])("supports %s line numbering", (numbering, flag) => {
    expect(build(cat, { paths: ["notes.txt"], numbering }).command).toBe(
      `cat ${flag} -- 'notes.txt'`,
    );
  });
  it("supports repeated-empty-line suppression and individual invisible markers", () => {
    expect(
      build(cat, {
        paths: ["output.log"],
        squeeze: true,
        ends: true,
        tabs: true,
      }).command,
    ).toBe("cat -s -E -T -- 'output.log'");
  });
  it("show-all omits redundant -E and -T even if they were previously selected", () => {
    expect(
      build(cat, {
        paths: ["config.txt"],
        showAll: true,
        ends: true,
        tabs: true,
        numbering: "nonempty",
        squeeze: true,
      }).command,
    ).toBe("cat -b -s -A -- 'config.txt'");
  });
  it("rejects contradictory numbering and unknown modes", () => {
    expect(
      build(cat, {
        paths: ["notes.txt"],
        numberAll: true,
        numberNonempty: true,
      }).command,
    ).toBeNull();
    expect(
      build(cat, { paths: ["notes.txt"], numbering: "both" }).command,
    ).toBeNull();
  });
  it("requires at least one non-empty file path instead of standard input", () => {
    for (const paths of [[], [""], ["a", " "], ["line\nbreak"]])
      expect(build(cat, { paths }).command).toBeNull();
    expect(build(cat).command).toBeNull();
    expect(build(cat, { paths: "notes.txt" }).command).toBeNull();
  });
  it("distinguishes the literal hyphen filename from stdin and protects flags", () => {
    expect(build(cat, { paths: ["-", "-n"] }).command).toBe(
      "cat -- './-' '-n'",
    );
  });
});

describe("less", () => {
  it("builds a default viewer command", () => {
    expect(build(less, { path: "notes.txt" }).command).toBe(
      "less -- 'notes.txt'",
    );
  });
  it("generates all compatible flags and trusted +G before the operand delimiter", () => {
    expect(
      build(less, {
        path: "server.log",
        numbers: true,
        chop: true,
        searchCase: "smart",
        quitIfFits: true,
        colors: true,
        end: true,
      }).command,
    ).toBe("less -N -S -i -F -R +G -- 'server.log'");
  });
  it.each([
    ["default", ""],
    ["smart", "-i "],
    ["ignore", "-I "],
  ])("selects case mode %s", (searchCase, flag) => {
    expect(build(less, { path: "a", searchCase }).command).toBe(
      `less ${flag}-- 'a'`,
    );
  });
  it("rejects conflicting raw search flags and invalid modes", () => {
    expect(
      build(less, { path: "a", smartCase: true, ignoreCase: true }).command,
    ).toBeNull();
    expect(build(less, { path: "a", searchCase: "both" }).command).toBeNull();
  });
  it.each(["", " ", "line\nbreak", "\0bad"])(
    "rejects invalid file path %j",
    (path) => {
      expect(build(less, { path }).command).toBeNull();
    },
  );
  it("treats leading plus and hyphen names as filenames", () => {
    expect(build(less, { path: "+G" }).command).toBe("less -- './+G'");
    expect(build(less, { path: "-R" }).command).toBe("less -- '-R'");
    expect(build(less, { path: "-" }).command).toBe("less -- './-'");
    expect(build(less, { path: "--" }).command).toBe("less -- './--'");
  });
});

describe("nano", () => {
  it("opens an unnamed buffer with no delimiter or file operand", () => {
    expect(build(nano)).toEqual({ command: "nano", errors: [] });
    expect(build(nano, { numbers: true, view: true }).command).toBe(
      "nano -l -v",
    );
  });
  it("opens a named file or view-only file", () => {
    expect(build(nano, { path: "notes.txt" }).command).toBe(
      "nano -- 'notes.txt'",
    );
    expect(build(nano, { path: "readonly.txt", view: true }).command).toBe(
      "nano -v -- 'readonly.txt'",
    );
  });
  it("serializes all supported options deterministically", () => {
    expect(
      build(nano, {
        path: "My Notes",
        numbers: true,
        mouse: true,
        indent: true,
        backup: true,
        view: true,
        position: true,
      }).command,
    ).toBe("nano -l -m -i -B -v -c -- 'My Notes'");
  });
  it("supports a backup request while editing", () => {
    expect(build(nano, { path: "important.conf", backup: true }).command).toBe(
      "nano -B -- 'important.conf'",
    );
  });
  it("protects startup-position/search syntax and literal stdin names", () => {
    expect(build(nano, { path: "+42" }).command).toBe("nano -- './+42'");
    expect(build(nano, { path: "+/search" }).command).toBe(
      "nano -- './+/search'",
    );
    expect(build(nano, { path: "-" }).command).toBe("nano -- './-'");
    expect(build(nano, { path: "-v" }).command).toBe("nano -- '-v'");
    expect(build(nano, { path: "--" }).command).toBe("nano -- './--'");
  });
  it("rejects invalid types and control characters but keeps optional whitespace literal", () => {
    expect(build(nano, { path: "line\nbreak" }).command).toBeNull();
    expect(build(nano, { path: true }).command).toBeNull();
    expect(build(nano, { mouse: "yes" }).command).toBeNull();
    expect(build(nano, { path: " " }).command).toBe("nano -- ' '");
  });
});

describe.each([cat, less, nano])(
  "$name literal file serialization",
  (definition) => {
    it("quotes apostrophes, spaces, wildcards, variables, and shell metacharacters", () => {
      const path = "user's $(id); *.txt";
      const inputs: CommandInputs =
        definition.id === "cat" ? { paths: [path] } : { path };
      expect(build(definition, inputs).command).toBe(
        `${definition.name} -- ${quoteShellArgument(path)}`,
      );
    });
  },
);

describe("shortcut metadata and localization completeness", () => {
  it("contains the requested terminal references and bilingual content", () => {
    expect(less.shortcuts!.items.map((item) => item.keys)).toEqual([
      "Space",
      "b",
      "j / k",
      "g",
      "G",
      "/text",
      "?text",
      "n",
      "N",
      "q",
    ]);
    expect(nano.shortcuts!.items.map((item) => item.keys)).toEqual([
      "Ctrl + O",
      "Ctrl + X",
      "Ctrl + K",
      "Ctrl + U",
      "Ctrl + W",
      "Ctrl + \\",
      "Ctrl + G",
      "Alt + U",
      "Alt + E",
      "Ctrl + _",
    ]);
    expect(nano.shortcuts!.description.en).toContain("^ means Ctrl");
    expect(nano.shortcuts!.description.en).toContain("M- means Meta");
    expect(nano.shortcuts!.description.id).toContain("versi");
    expect(validateRegistry([cat, less, nano])).toEqual([]);
  });
  it("rejects missing shortcut translations and empty/duplicate keys", () => {
    const reference = less.shortcuts!;
    expect(
      validateRegistry([
        {
          ...less,
          shortcuts: { ...reference, description: { en: "Help", id: "" } },
        },
      ]),
    ).toContain("Missing translation: less");
    expect(
      validateRegistry([
        {
          ...less,
          shortcuts: {
            ...reference,
            items: [{ keys: "q", description: { en: "Quit", id: "" } }],
          },
        },
      ]),
    ).toContain("Missing translation: less");
    expect(
      validateRegistry([{ ...less, shortcuts: { ...reference, items: [] } }]),
    ).toContain("Invalid shortcuts: less");
    expect(
      validateRegistry([
        {
          ...less,
          shortcuts: {
            ...reference,
            items: [reference.items[0], reference.items[0]],
          },
        },
      ]),
    ).toContain("Invalid shortcuts: less");
  });
});
