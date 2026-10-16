import { describe, expect, it } from "vitest";
import { commands, getCommand, validateRegistry } from "./registry";
import { ls, pwd } from "./definitions";

describe("command registry", () => {
  it("validates the representative catalog and looks up real commands only", () => {
    expect(commands.map((command) => command.id)).toEqual([
      "pwd",
      "ls",
      "cd",
      "mkdir",
      "touch",
      "cp",
      "mv",
      "rm",
      "cat",
      "less",
      "nano",
      "find",
      "grep",
      "man",
      "whoami",
      "id",
      "groups",
      "sudo",
      "su",
      "chmod",
      "chown",
    ]);
    expect(
      commands
        .filter((command) => command.category === "navigation")
        .map((command) => command.id),
    ).toEqual(["pwd", "ls", "cd"]);
    expect(validateRegistry(commands)).toEqual([]);
    expect(
      commands
        .filter((command) => command.category === "reading")
        .map((command) => command.id),
    ).toEqual(["cat", "less", "nano"]);
    expect(getCommand("ls")).toBe(ls);
    expect(getCommand("rm")?.name).toBe("rm");
    expect(getCommand("find")?.name).toBe("find");
    expect(getCommand("chmod")?.name).toBe("chmod");
    expect(getCommand("setfacl")).toBeUndefined();
  });
  it("rejects duplicate identifiers and missing translations", () => {
    expect(validateRegistry([pwd, pwd])).toContain("Duplicate command: pwd");
    expect(
      validateRegistry([{ ...pwd, description: { en: "Directory", id: "" } }]),
    ).toContain("Missing translation: pwd");
  });
  it("rejects ambiguous field IDs and invalid flags", () => {
    const invalid = {
      ...ls,
      options: [...ls.options, { ...ls.options[0]!, flag: "bad flag" }],
    };
    expect(validateRegistry([invalid])).toContain(
      "Invalid field identifiers: ls",
    );
    expect(validateRegistry([invalid])).toContain("Invalid flag: ls");
  });
  it("requires translations for every choice, item, input, example, and note", () => {
    for (const definition of commands) {
      expect(validateRegistry([definition])).toEqual([]);
      for (const choice of definition.choices ?? []) {
        expect(
          validateRegistry([
            {
              ...definition,
              choices: [
                {
                  ...choice,
                  items: choice.items.map((item) => ({
                    ...item,
                    label: { en: item.label.en, id: "" },
                  })),
                },
              ],
            },
          ]),
        ).toContain(`Missing translation: ${definition.id}`);
      }
    }
  });
  it("rejects a choice with an unavailable default", () => {
    expect(
      validateRegistry([
        {
          ...pwd,
          choices: pwd.choices!.map((choice) => ({
            ...choice,
            defaultValue: "both",
          })),
        },
      ]),
    ).toContain("Invalid choice: pwd/mode");
  });
});
