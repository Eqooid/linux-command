import { describe, expect, it } from "vitest";
import { man, whoami, id, groups } from "./definitions";
import { generateCommand, initialInputs } from "./generation";
import { generateHelpCommand, helpTargets } from "./help";
import { commands, getCommand, validateRegistry } from "./registry";
import type { CommandDefinition, CommandInputs } from "./types";

function generate(definition: CommandDefinition, inputs: CommandInputs = {}) {
  return generateCommand(definition, {
    ...initialInputs(definition),
    ...inputs,
  });
}

describe("man lookup", () => {
  it("quotes a basic manual topic", () => {
    expect(generate(man, { topic: "ls" }).command).toBe("man -- 'ls'");
  });
  it.each(["1", "2", "3", "4", "5", "6", "7", "8"])(
    "selects section %s explicitly",
    (section) => {
      expect(generate(man, { topic: "printf", section }).command).toBe(
        `man -s ${section} -- 'printf'`,
      );
    },
  );
  it.each([
    ["keyword", "-k"],
    ["short", "-f"],
    ["all", "-a"],
    ["path", "-w"],
  ])("supports %s lookup", (lookup, flag) => {
    expect(generate(man, { topic: "network", lookup }).command).toBe(
      `man ${flag} -- 'network'`,
    );
  });
  it("combines section filtering with keyword search", () => {
    expect(
      generate(man, { topic: "network", lookup: "keyword", section: "1" })
        .command,
    ).toBe("man -k -s 1 -- 'network'");
  });
  it.each(["", "   ", "1", "123", "ls\nwhoami", "bad\0topic"])(
    "rejects ambiguous/missing topic %j",
    (topic) => {
      expect(generate(man, { topic }).command).toBeNull();
    },
  );
  it.each(["9", "1; echo bad", "", "3p"])(
    "rejects unsupported section %j",
    (section) => {
      expect(generate(man, { topic: "ls", section }).command).toBeNull();
    },
  );
  it("rejects contradictory modes and raw flags", () => {
    expect(
      generate(man, { topic: "ls", lookup: "keyword,path" }).command,
    ).toBeNull();
    expect(
      generate(man, { topic: "ls", keywordMode: true, pathMode: true }).command,
    ).toBeNull();
  });
  it.each([
    "-P",
    "printf(3)",
    "my topic",
    "$(whoami);echo bad",
    "user's manual",
  ])("serializes literal topic %j", (topic) => {
    const result = generate(man, { topic });
    expect(result.errors).toEqual([]);
    expect(result.command).toBe(
      "man -- '" + topic.replaceAll("'", "'\"'\"'") + "'",
    );
  });
  it("includes translated sections, shortcuts, and pager limitations", () => {
    expect(man.shortcuts?.items.some((item) => item.keys === "q")).toBe(true);
    expect(
      man.choices?.find((choice) => choice.id === "section")?.items,
    ).toHaveLength(9);
    expect(man.options.some((option) => option.flag === "-P")).toBe(false);
    expect(man.warnings[0]?.en).toContain("-P");
    expect(validateRegistry([man])).toEqual([]);
  });
});

describe("GNU-style help utility", () => {
  it.each(helpTargets)("generates %s --help", (target) => {
    expect(generateHelpCommand(target)).toEqual({
      command: `${target} --help`,
      errors: [],
    });
  });
  it.each(["my-tool", "tool_2", "tool.name", "g++", "_helper"])(
    "allows a single custom token %s",
    (name) => {
      expect(generateHelpCommand("custom", name).command).toBe(
        `${name} --help`,
      );
    },
  );
  it.each([
    "",
    " ",
    "two words",
    "ls;whoami",
    "ls|cat",
    "$(id)",
    "`id`",
    "ls>out",
    "ls&cat",
    "a\nb",
    "./tool",
    "/bin/ls",
    "--help",
    "NAME=x",
    "'ls'",
  ])("rejects non-executable input %j", (name) => {
    expect(generateHelpCommand("custom", name).command).toBeNull();
  });
  it.each(["cd", "pwd", "help", "if", "time", "for", "echo", "exec"])(
    "guides shell word %s to builtin help",
    (name) => {
      const result = generateHelpCommand("custom", name);
      expect(result.command).toBeNull();
      expect(result.errors[0]?.en).toContain("Bash");
      expect(result.errors[0]?.id).toContain("Bash");
    },
  );
  it("does not register --help or pretend every executable supports it", () => {
    expect(getCommand("--help")).toBeUndefined();
    expect(getCommand("help")).toBeUndefined();
    expect(helpTargets).not.toContain("cd");
    expect(generateHelpCommand("unknown").command).toBeNull();
    expect(generateHelpCommand("custom", "x".repeat(201)).command).toBeNull();
  });
});

describe("user identity builders", () => {
  it("generates whoami without any configuration", () => {
    expect(initialInputs(whoami)).toEqual({});
    expect(generate(whoami)).toEqual({ command: "whoami", errors: [] });
    expect(generate(whoami, { username: "alice" }).command).toBeNull();
  });
  it("generates full id with optional account", () => {
    expect(generate(id).command).toBe("id");
    expect(generate(id, { username: "alice" }).command).toBe("id -- 'alice'");
  });
  it.each([
    ["user", "-u"],
    ["group", "-g"],
    ["groups", "-G"],
  ])("supports %s with GNU-compatible modifiers", (output, flag) => {
    expect(generate(id, { output }).command).toBe(`id ${flag}`);
    expect(generate(id, { output, names: true }).command).toBe(`id ${flag} -n`);
    expect(generate(id, { output, real: true }).command).toBe(`id ${flag} -r`);
    expect(generate(id, { output, zero: true }).command).toBe(`id ${flag} -z`);
    expect(
      generate(id, {
        output,
        names: true,
        real: true,
        zero: true,
        username: "alice",
      }).command,
    ).toBe(`id ${flag} -n -r -z -- 'alice'`);
  });
  it("omits stale incompatible modifiers after selecting full identity", () => {
    expect(generate(id, { names: true, real: true, zero: true }).command).toBe(
      "id",
    );
  });
  it("rejects conflicting output modes, raw aliases, and malformed options", () => {
    expect(generate(id, { output: "user,group" }).command).toBeNull();
    expect(
      generate(id, { userOutput: true, groupOutput: true }).command,
    ).toBeNull();
    expect(generate(id, { output: "user", names: "true" }).command).toBeNull();
  });
  it("supports current, single, and multiple account group lists", () => {
    expect(generate(groups).command).toBe("groups");
    expect(generate(groups, { usernames: [] }).command).toBe("groups");
    expect(generate(groups, { usernames: ["alice"] }).command).toBe(
      "groups -- 'alice'",
    );
    expect(generate(groups, { usernames: ["alice", "bob"] }).command).toBe(
      "groups -- 'alice' 'bob'",
    );
  });
  it.each(["alice", "user-name", "user.name", "_service", "host$", "User_2"])(
    "quotes common account name %s literally",
    (username) => {
      expect(generate(id, { username }).command).toBe(`id -- '${username}'`);
      expect(generate(groups, { usernames: [username] }).command).toBe(
        `groups -- '${username}'`,
      );
    },
  );
  it.each([
    " ",
    "alice bob",
    "--help",
    "-alice",
    "$(id)",
    "a;b",
    "a'b",
    "1000",
    "domain\\user",
    "a\nb",
  ])("rejects unsupported username %j", (username) => {
    expect(generate(id, { username }).command).toBeNull();
    expect(generate(groups, { usernames: [username] }).command).toBeNull();
  });
  it.each([
    ["alice", ""],
    ["", "bob"],
    ["", ""],
  ])("rejects incomplete multiple username rows %j", (...usernames) => {
    expect(generate(groups, { usernames }).command).toBeNull();
  });
  it("validates the executable definitions and bilingual content", () => {
    expect(commands).toHaveLength(26);
    expect(validateRegistry(commands)).toEqual([]);
    for (const definition of [man, whoami, id, groups]) {
      expect(getCommand(definition.id)).toBe(definition);
      expect(definition.explanation.en).not.toBe(definition.explanation.id);
    }
  });
});
