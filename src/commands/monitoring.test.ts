import { describe, expect, it } from "vitest";
import { free, df, du, uptime, uname, lsblk } from "./definitions";
import { generateCommand, initialInputs } from "./generation";
import { commands, validateRegistry } from "./registry";
import type { CommandDefinition, CommandInputs } from "./types";

type Changes = Record<string, string | boolean | readonly string[] | undefined>;
function run(definition: CommandDefinition, changes: Changes = {}) {
  const inputs = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value])) as CommandInputs;
  return generateCommand(definition, { ...initialInputs(definition), ...inputs });
}
function command(definition: CommandDefinition, changes: Changes = {}) {
  const result = run(definition, changes);
  expect(result.errors).toEqual([]);
  return result.command;
}

describe("T15 registry and bilingual education", () => {
  it("reuses the system category and supplies all six translated definitions", () => {
    expect(commands.filter((definition) => definition.category === "system").map((definition) => definition.id)).toEqual(["free", "df", "du", "uptime", "uname", "lsblk"]);
    for (const definition of [free, df, du, uptime, uname, lsblk]) {
      expect(validateRegistry([definition])).toEqual([]);
      expect(definition.concepts?.length).toBe(11);
      expect(definition.concepts?.filter((concept) => concept.term.en.startsWith("Scenario:")).length).toBe(3);
      expect(new Set(definition.examples.map((entry) => entry.command)).size).toBe(definition.examples.length);
      const untranslated = { ...definition, explanation: { en: definition.explanation.en, id: "" } };
      expect(validateRegistry([untranslated])).toContain(`Missing translation: ${definition.id}`);
    }
  });
});

describe("free", () => {
  it.each([
    [{}, "free"], [{ unit: "h" }, "free -h"], [{ unit: "b" }, "free -b"],
    [{ unit: "k" }, "free -k"], [{ unit: "m" }, "free -m"], [{ unit: "g" }, "free -g"],
    [{ unit: "h", total: true }, "free -h -t"],
    [{ unit: "h", interval: "2", count: "5" }, "free -h -s 2 -c 5"],
    [{ interval: "0.5" }, "free -s 0.5"],
  ] as const)("builds %j", (inputs, expected) => expect(command(free, inputs)).toBe(expected));

  it.each([{ interval: "0" }, { interval: "-2" }, { interval: "NaN" }, { interval: "1;id" }, { interval: "1e999" }, { count: "2" }, { interval: "1", count: "1.5" }, { interval: "1", count: "0" }, { unit: "both" }, { unit: "h", bytes: true }])("rejects %j", (inputs) => {
    expect(run(free, inputs).command).toBeNull();
    expect(run(free, inputs).errors.every((error) => error.en && error.id)).toBe(true);
  });
});

describe("df", () => {
  it.each([
    [{}, "df"], [{ format: "h" }, "df -h"], [{ format: "H" }, "df -H"],
    [{ format: "h", types: true }, "df -h -T"], [{ inodes: true }, "df -i"],
    [{ all: true, local: true }, "df -a -l"],
    [{ format: "h", excludeType: "tmpfs" }, "df -h -x 'tmpfs'"],
    [{ format: "h", path: "/My Files" }, "df -h -- '/My Files'"],
    [{ path: "-option" }, "df -- '-option'"],
  ] as const)("builds %j", (inputs, expected) => expect(command(df, inputs)).toBe(expected));
  it.each([{ format: "both" }, { excludeType: "-x" }, { excludeType: "tmpfs;id" }, { path: "   " }, { path: "a\nb" }])("rejects %j", (inputs) => expect(run(df, inputs).command).toBeNull());
});

describe("du", () => {
  it.each([
    [{}, "du -- '.'"], [{ human: true, summary: true }, "du -h -s -- '.'"],
    [{ human: true, allFiles: true }, "du -h -a -- '.'"],
    [{ total: true, paths: ["one", "two"] }, "du -c -- 'one' 'two'"],
    [{ depth: "1" }, "du --max-depth 1 -- '.'"],
    [{ depth: "1", depthStyle: "short" }, "du -d 1 -- '.'"],
    [{ summary: true, depth: "0", allFiles: true }, "du -s -- '.'"],
    [{ oneFilesystem: true, apparent: true }, "du -x --apparent-size -- '.'"],
    [{ paths: ["-draft", "My Files"] }, "du -- '-draft' 'My Files'"],
  ] as const)("builds %j", (inputs, expected) => expect(command(du, inputs)).toBe(expected));
  it.each([{ paths: [] }, { paths: [""] }, { paths: ["   "] }, { depth: "-1" }, { depth: "1.5" }, { depth: "2147483648" }, { summary: true, depth: "1" }])("rejects %j", (inputs) => expect(run(du, inputs).command).toBeNull());
  it("keeps shell expressions as literal filename characters", () => {
    expect(command(du, { paths: ["a; echo secret", "$(id)", "it's mine"] }))
      .toBe("du -- 'a; echo secret' '$(id)' 'it'\"'\"'s mine'");
  });
});

describe("uptime", () => {
  it.each([[{}, "uptime"], [{ mode: "pretty" }, "uptime -p"], [{ mode: "since" }, "uptime -s"]] as const)("builds %j", (inputs, expected) => expect(command(uptime, inputs)).toBe(expected));
  it("rejects conflicting raw flags", () => expect(run(uptime, { pretty: true, since: true }).command).toBeNull());
});

describe("uname", () => {
  it("defaults to uname and combines compatible fields", () => {
    expect(command(uname)).toBe("uname");
    expect(command(uname, { kernel: true, release: true })).toBe("uname -s -r");
    expect(command(uname, { all: true, kernel: true, release: true })).toBe("uname -a");
  });
  it.each([["kernel", "s"], ["node", "n"], ["release", "r"], ["version", "v"], ["machine", "m"], ["processor", "p"], ["os", "o"]])("supports %s", (field, flag) => expect(command(uname, { [field]: true })).toBe(`uname -${flag}`));
});

describe("lsblk", () => {
  it.each([
    [{}, "lsblk"], [{ mode: "filesystem" }, "lsblk -f"], [{ paths: true }, "lsblk -p"],
    [{ bytes: true }, "lsblk -b"], [{ devicesOnly: true }, "lsblk -d"],
    [{ json: true }, "lsblk -J"], [{ list: true, json: true }, "lsblk -l -J"],
    [{ mode: "custom", columns: ["TYPE", "NAME", "SIZE"] }, "lsblk -o NAME,SIZE,TYPE"],
    [{ exclude: "7" }, "lsblk -e 7"], [{ exclude: "01,7" }, "lsblk -e 1,7"],
    [{ device: "/dev/nvme0n1p1" }, "lsblk -- '/dev/nvme0n1p1'"],
    [{ mode: "filesystem", columns: ["BOGUS"] }, "lsblk -f"],
  ] as const)("builds %j", (inputs, expected) => expect(command(lsblk, inputs)).toBe(expected));
  it.each([
    { mode: "custom", columns: [] }, { mode: "custom", columns: ["NAME", "NAME"] },
    { mode: "custom", columns: ["NAME;id"] }, { mode: "custom", columns: ["BOGUS"] },
    { exclude: "-1" }, { exclude: "7,,8" }, { exclude: "7;id" }, { exclude: "2147483648" },
    { device: "/etc/passwd" }, { device: "/dev/../sda" }, { device: "/dev/sda;id" },
    { device: "   " }, { device: "/dev/" }, { device: "/dev//" }, { mode: "both" },
  ])("rejects %j", (inputs) => expect(run(lsblk, inputs).command).toBeNull());
});
