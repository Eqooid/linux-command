import { describe, expect, it } from "vitest";
import { cp, mv, rm } from "./definitions";
import {
  generateCommand,
  initialInputs,
  quoteShellArgument,
} from "./generation";
import { isBlockedRemovalTarget } from "./fileManagement";
import { getCommandWarnings } from "./warnings";
import type { CommandDefinition, CommandInputs } from "./types";

function build(definition: CommandDefinition, changes: CommandInputs = {}) {
  return generateCommand(definition, {
    ...initialInputs(definition),
    ...changes,
  });
}

describe("cp", () => {
  it("copies one source to a new name or destination directory", () => {
    expect(
      build(cp, { sources: ["file.txt"], destination: "backup.txt" }).command,
    ).toBe("cp -- 'file.txt' 'backup.txt'");
    expect(
      build(cp, { sources: ["file.txt"], destination: "./backup/" }).command,
    ).toBe("cp -- 'file.txt' './backup/'");
  });
  it("serializes multiple sources in order before the destination", () => {
    expect(
      build(cp, {
        sources: ["a", "My Notes", "-file"],
        destination: "-backup/",
      }).command,
    ).toBe("cp -- 'a' 'My Notes' '-file' '-backup/'");
  });
  it("supports recursive copying and permission preservation", () => {
    expect(
      build(cp, {
        sources: ["project/"],
        destination: "backup/",
        recursive: true,
        preserve: true,
      }).command,
    ).toBe("cp -r -p -- 'project/' 'backup/'");
  });
  it("archive mode omits redundant recursive and preservation flags", () => {
    expect(
      build(cp, {
        sources: ["project/"],
        destination: "backup/",
        copyMode: "archive",
        recursive: true,
        preserve: true,
      }).command,
    ).toBe("cp -a -- 'project/' 'backup/'");
  });
  it.each([
    ["interactive", "-i"],
    ["noClobber", "-n"],
  ])("supports overwrite mode %s", (overwrite, flag) => {
    expect(
      build(cp, { sources: ["a"], destination: "b", overwrite, verbose: true })
        .command,
    ).toBe(`cp ${flag} -v -- 'a' 'b'`);
  });
  it("supports update with interactive mode", () => {
    expect(
      build(cp, {
        sources: ["a"],
        destination: "b",
        overwrite: "interactive",
        update: true,
      }).command,
    ).toBe("cp -i -u -- 'a' 'b'");
  });
  it("rejects contradictory or redundant overwrite/update settings", () => {
    expect(
      build(cp, {
        sources: ["a"],
        destination: "b",
        overwrite: "noClobber",
        update: true,
      }).command,
    ).toBeNull();
    expect(
      build(cp, {
        sources: ["a"],
        destination: "b",
        interactive: true,
        noClobber: true,
      }).command,
    ).toBeNull();
    expect(
      build(cp, { sources: ["a"], destination: "b", overwrite: "force" })
        .command,
    ).toBeNull();
  });
});

describe("mv", () => {
  it.each([
    ["old.txt", "new.txt"],
    ["report.txt", "./documents/"],
    ["old-folder/", "new-folder/"],
  ])("moves or renames %s", (source, destination) => {
    expect(build(mv, { sources: [source], destination }).command).toBe(
      `mv -- '${source}' '${destination}'`,
    );
  });
  it("supports multiple sources and backup/verbose/update flags", () => {
    expect(
      build(mv, {
        sources: ["a", "b"],
        destination: "./archive/",
        update: true,
        verbose: true,
        backup: true,
      }).command,
    ).toBe("mv -u -v -b -- 'a' 'b' './archive/'");
  });
  it.each([
    ["interactive", "-i"],
    ["noClobber", "-n"],
    ["force", "-f"],
  ])("supports exactly one overwrite mode %s", (overwrite, flag) => {
    expect(
      build(mv, { sources: ["a"], destination: "b", overwrite }).command,
    ).toBe(`mv ${flag} -- 'a' 'b'`);
  });
  it("rejects no-clobber with backup or update and conflicting raw flags", () => {
    expect(
      build(mv, {
        sources: ["a"],
        destination: "b",
        overwrite: "noClobber",
        backup: true,
      }).command,
    ).toBeNull();
    expect(
      build(mv, {
        sources: ["a"],
        destination: "b",
        overwrite: "noClobber",
        update: true,
      }).command,
    ).toBeNull();
    expect(
      build(mv, {
        sources: ["a"],
        destination: "b",
        interactive: true,
        force: true,
      }).command,
    ).toBeNull();
  });
});

describe.each([cp, mv])("$name shared transfer validation", (definition) => {
  it.each([
    { sources: [], destination: "backup" },
    { sources: [""], destination: "backup" },
    { sources: ["a", "   "], destination: "backup" },
    { sources: ["a"], destination: "" },
    { sources: ["a"], destination: "  " },
    { sources: ["line\nbreak"], destination: "backup" },
    { sources: ["a"], destination: "bad\0path" },
  ])("rejects invalid operands %j", (changes) => {
    expect(build(definition, changes).command).toBeNull();
  });
  it("quotes spaces, apostrophes and shell expressions without evaluating them", () => {
    const source = "user's $(id); * notes";
    expect(
      build(definition, { sources: [source], destination: "-destination" })
        .command,
    ).toBe(
      `${definition.name} -- ${quoteShellArgument(source)} '-destination'`,
    );
  });
  it("explains the destination-directory requirement for multiple sources", () => {
    const warnings = getCommandWarnings(definition, {
      ...initialInputs(definition),
      sources: ["a", "b"],
    });
    expect(
      warnings.some((warning) =>
        warning.text.en.includes(
          "Multiple sources require an existing destination directory",
        ),
      ),
    ).toBe(true);
  });
});

describe("rm", () => {
  it("has no force or recursive flags by default", () => {
    expect(build(rm, { paths: ["notes.txt"] }).command).toBe(
      "rm -- 'notes.txt'",
    );
    expect(initialInputs(rm)).toMatchObject({
      recursive: false,
      confirmation: "default",
    });
  });
  it("supports multiple literal targets, including a hyphen filename", () => {
    expect(build(rm, { paths: ["My Notes", "-important", "-"] }).command).toBe(
      "rm -- 'My Notes' '-important' './-'",
    );
  });
  it.each([
    ["each", "-i"],
    ["once", "-I"],
    ["force", "-f"],
  ])("supports confirmation mode %s", (confirmation, flag) => {
    expect(
      build(rm, {
        paths: ["old-project/"],
        recursive: true,
        confirmation,
        verbose: true,
      }).command,
    ).toBe(`rm -r ${flag} -v -- 'old-project/'`);
  });
  it("does not combine conflicting confirmation modes", () => {
    expect(
      build(rm, { paths: ["a"], each: true, force: true }).command,
    ).toBeNull();
    expect(
      build(rm, { paths: ["a"], confirmation: "each,force" }).command,
    ).toBeNull();
  });
  it.each([
    "/",
    "//",
    "/./",
    "/tmp/..",
    ".",
    "./",
    "./.",
    "..",
    "../",
    "folder/..",
  ])("blocks root/current/parent target %s in all modes", (path) => {
    expect(build(rm, { paths: [path] }).command).toBeNull();
    expect(
      build(rm, { paths: [path], recursive: true, confirmation: "force" })
        .command,
    ).toBeNull();
  });
  it.each([
    "/etc",
    "//etc/",
    "/etc/passwd",
    "/usr/local",
    "/var",
    "/tmp",
    "/root",
    "/home",
    "/home/alice/",
    "/Users/alice",
    "~",
    "~/",
    "~/folder/..",
    "~alice",
    "$HOME",
    "${HOME}/.",
    "/home/alice/../alice",
  ])("blocks obvious recursive system/home target %s", (path) => {
    expect(isBlockedRemovalTarget(path, true)).toBe(true);
    expect(build(rm, { paths: [path], recursive: true }).command).toBeNull();
  });
  it.each([
    "build/",
    "/tmp/project-build",
    "/home/alice/old-project",
    "etc-backup",
    "notes with spaces",
  ])("allows specific targets without claiming they are safe: %s", (path) => {
    expect(
      build(rm, { paths: [path], recursive: true }).command,
    ).not.toBeNull();
  });
  it("blocks the whole preview when any target is blocked", () => {
    expect(
      build(rm, { paths: ["build", "/"], recursive: true }).command,
    ).toBeNull();
  });
  it("rejects missing targets, blank rows, wrong input types, and control characters", () => {
    for (const paths of [[], [""], ["a", " "], ["line\nbreak"]])
      expect(build(rm, { paths }).command).toBeNull();
    expect(build(rm, { paths: "a" }).command).toBeNull();
  });
  it("escalates warnings for recursive+force without suggesting safety", () => {
    const base = initialInputs(rm);
    expect(
      getCommandWarnings(rm, base).some((warning) =>
        warning.text.en.includes("recycle bin"),
      ),
    ).toBe(true);
    expect(
      getCommandWarnings(rm, { ...base, recursive: true }).some(
        (warning) =>
          warning.level === "warning" &&
          warning.text.en.includes("Recursive removal"),
      ),
    ).toBe(true);
    const strongest = getCommandWarnings(rm, {
      ...base,
      recursive: true,
      confirmation: "force",
    }).find((warning) => warning.level === "danger")!;
    expect(strongest.text.en).toContain("HIGH RISK");
    expect(strongest.text.id).toContain("RISIKO TINGGI");
    expect(strongest.text.en).toContain("cannot guarantee safety");
  });
});
