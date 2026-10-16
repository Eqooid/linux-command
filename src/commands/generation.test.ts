import { describe, expect, it } from "vitest";
import { cd, ls, mkdir, pwd, touch } from "./definitions";
import {
  generateCommand,
  initialInputs,
  quoteShellArgument,
} from "./generation";
import { isTouchTimestamp } from "./arguments";
import type { CommandDefinition, CommandInputs } from "./types";

function build(definition: CommandDefinition, changes: CommandInputs = {}) {
  return generateCommand(definition, {
    ...initialInputs(definition),
    ...changes,
  });
}

describe("pwd", () => {
  it.each([
    ["default", "pwd"],
    ["logical", "pwd -L"],
    ["physical", "pwd -P"],
  ])("builds %s mode", (mode, expected) => {
    expect(build(pwd, { mode })).toEqual({ command: expected, errors: [] });
  });
  it("rejects simultaneous and unknown modes", () => {
    expect(build(pwd, { mode: "logical physical" }).command).toBeNull();
    expect(build(pwd, { logical: true, physical: true }).command).toBeNull();
  });
});

describe("ls", () => {
  it("builds the default and compatible options in deterministic order", () => {
    expect(build(ls).command).toBe("ls");
    expect(
      build(ls, {
        layout: "long",
        visibility: "all",
        human: true,
        recursive: true,
        sort: "time",
        reverse: true,
        directory: true,
        path: "./src",
      }).command,
    ).toBe("ls -l -a -h -R -t -r -d -- './src'");
  });
  it.each([
    ["all", "-a"],
    ["almostAll", "-A"],
  ])("supports %s visibility", (visibility, flag) => {
    expect(build(ls, { visibility }).command).toBe(`ls ${flag}`);
  });
  it.each([
    ["time", "-t"],
    ["size", "-S"],
  ])("supports %s sorting", (sort, flag) => {
    expect(build(ls, { sort, reverse: true }).command).toBe(`ls ${flag} -r`);
  });
  it("supports one per line and optional literal paths", () => {
    expect(build(ls, { layout: "one", path: "My Notes" }).command).toBe(
      "ls -1 -- 'My Notes'",
    );
    expect(build(ls, { path: "-report" }).command).toBe("ls -- '-report'");
  });
  it("rejects conflicting flags and invalid sort choices", () => {
    expect(build(ls, { all: true, almostAll: true }).command).toBeNull();
    expect(build(ls, { time: true, size: true }).command).toBeNull();
    expect(build(ls, { sort: "time,size" }).command).toBeNull();
    expect(build(ls, { long: true, one: true }).command).toBeNull();
  });
});

describe("cd", () => {
  it.each([
    ["default", "cd"],
    ["home", "cd ~"],
    ["parent", "cd .."],
    ["previous", "cd -"],
    ["root", "cd /"],
  ])("builds %s navigation", (destination, expected) => {
    expect(build(cd, { destination }).command).toBe(expected);
  });
  it.each([
    "/var/log",
    "../projects",
    "My Notes",
    "-folder",
    "~/Documents",
    "$(id); *",
  ])("quotes custom path %s as literal data", (path) => {
    expect(build(cd, { destination: "custom", path }).command).toBe(
      "cd -- " + quoteShellArgument(path),
    );
  });
  it("distinguishes a literal dash from the previous directory", () => {
    expect(build(cd, { destination: "custom", path: "-" }).command).toBe(
      "cd -- './-'",
    );
  });
  it("preserves only the trusted home prefix and quotes the suffix", () => {
    expect(
      build(cd, { destination: "homePath", homePath: "Documents" }).command,
    ).toBe("cd -- ~/'Documents'");
    expect(
      build(cd, { destination: "homePath", homePath: "$(id)/My Notes" })
        .command,
    ).toBe("cd -- ~/'$(id)/My Notes'");
    expect(
      build(cd, { destination: "homePath", homePath: "/etc" }).command,
    ).toBeNull();
  });
  it("requires paths only when their corresponding preset is selected", () => {
    expect(build(cd, { destination: "custom", path: "" }).command).toBeNull();
    expect(
      build(cd, { destination: "homePath", homePath: "" }).command,
    ).toBeNull();
    expect(build(cd, { destination: "home", path: "\nbad" }).command).toBe(
      "cd ~",
    );
  });
});

describe("mkdir", () => {
  it("builds single and multiple directories without automatic -p", () => {
    expect(build(mkdir, { paths: ["projects"] }).command).toBe(
      "mkdir -- 'projects'",
    );
    expect(
      build(mkdir, { paths: ["docs", "My Images", "-backups"] }).command,
    ).toBe("mkdir -- 'docs' 'My Images' '-backups'");
  });
  it("supports parents and verbose output", () => {
    expect(
      build(mkdir, {
        parents: true,
        verbose: true,
        paths: ["projects/react/src"],
      }).command,
    ).toBe("mkdir -p -v -- 'projects/react/src'");
  });
  it.each(["755", "0700", "000", "2755"])(
    "supports octal mode %s",
    (permissions) => {
      expect(
        build(mkdir, { setMode: true, permissions, paths: ["shared"] }).command,
      ).toBe(`mkdir -m ${permissions} -- 'shared'`);
    },
  );
  it.each(["", "888", "75", "00755", "u=rwx", "755;id", " 755"])(
    "rejects invalid mode %s",
    (permissions) => {
      expect(
        build(mkdir, { setMode: true, permissions, paths: ["shared"] }).command,
      ).toBeNull();
    },
  );
  it("does not validate or emit an inactive permission field", () => {
    expect(
      build(mkdir, { paths: ["shared"], permissions: "invalid" }).command,
    ).toBe("mkdir -- 'shared'");
  });
  it.each([[], [""], ["docs", ""], ["   "]].map((paths) => ({ paths })))(
    "rejects missing or blank directory rows $paths",
    ({ paths }) => {
      expect(build(mkdir, { paths }).command).toBeNull();
    },
  );
});

describe("touch", () => {
  it("builds single and multiple files", () => {
    expect(build(touch, { paths: ["notes.txt"] }).command).toBe(
      "touch -- 'notes.txt'",
    );
    expect(
      build(touch, { paths: ["a.txt", "My Notes.txt", "-"] }).command,
    ).toBe("touch -- 'a.txt' 'My Notes.txt' './-'");
  });
  it("supports no-create and access/modification selection", () => {
    expect(
      build(touch, { paths: ["report.txt"], noCreate: true, modify: true })
        .command,
    ).toBe("touch -m -c -- 'report.txt'");
    expect(
      build(touch, { paths: ["a"], access: true, modify: true }).command,
    ).toBe("touch -a -m -- 'a'");
    expect(build(touch, { paths: ["a"], access: true }).command).toBe(
      "touch -a -- 'a'",
    );
  });
  it("quotes a reference filename, including a leading hyphen", () => {
    expect(
      build(touch, {
        paths: ["target.txt"],
        source: "reference",
        reference: "-reference file",
      }).command,
    ).toBe("touch -r '-reference file' -- 'target.txt'");
  });
  it.each(["202610140930", "202402290930.59", "200002290000.00"])(
    "supports valid timestamp %s",
    (timestamp) => {
      expect(
        build(touch, {
          paths: ["document.txt"],
          source: "timestamp",
          timestamp,
        }).command,
      ).toBe(`touch -t ${timestamp} -- 'document.txt'`);
    },
  );
  it.each([
    "",
    "202602290930",
    "190002290930",
    "202613140930",
    "202604310930",
    "202610142430",
    "202610140960",
    "202610140930.60",
    "10140930",
    "202610140930;id",
    "000010140930",
  ])("rejects invalid timestamp %s", (timestamp) => {
    expect(isTouchTimestamp(timestamp)).toBe(false);
    expect(
      build(touch, { paths: ["a"], source: "timestamp", timestamp }).command,
    ).toBeNull();
  });
  it("rejects missing targets, references, and conflicting sources", () => {
    expect(build(touch).command).toBeNull();
    expect(build(touch, { paths: [] }).command).toBeNull();
    expect(build(touch, { paths: ["a", ""] }).command).toBeNull();
    expect(
      build(touch, { paths: ["a"], source: "reference", reference: "" })
        .command,
    ).toBeNull();
    expect(
      build(touch, {
        paths: ["a"],
        referenceSource: true,
        explicitSource: true,
      }).command,
    ).toBeNull();
    expect(
      build(touch, { paths: ["a"], source: "reference,timestamp" }).command,
    ).toBeNull();
  });
  it("ignores inactive source values", () => {
    expect(
      build(touch, { paths: ["a"], reference: "stale", timestamp: "invalid" })
        .command,
    ).toBe("touch -- 'a'");
  });
});

describe("generation boundaries", () => {
  it("quotes apostrophes and shell metacharacters", () => {
    expect(quoteShellArgument("user's notes")).toBe("'user'\"'\"'s notes'");
    expect(quoteShellArgument("$(whoami); *.txt")).toBe("'$(whoami); *.txt'");
    expect(build(touch, { paths: ["user's notes"] }).command).toBe(
      "touch -- 'user'\"'\"'s notes'",
    );
  });
  it("rejects control characters and wrong input types without throwing", () => {
    expect(build(ls, { path: "line\nbreak" }).command).toBeNull();
    expect(build(mkdir, { paths: ["\0bad"] }).command).toBeNull();
    expect(build(touch, { paths: "one.txt" }).command).toBeNull();
    expect(build(ls, { human: "yes" }).command).toBeNull();
    expect(build(pwd, { mode: ["logical", "physical"] }).command).toBeNull();
  });
  it("refuses oversized output before it can be pinned", () => {
    expect(build(touch, { paths: ["x".repeat(10000)] }).command).toBeNull();
  });
  it("does not pretend an unimplemented builder is functional", () => {
    for (const id of ["future", "constructor"])
      expect(build({ ...pwd, id }).command).toBeNull();
  });
});
