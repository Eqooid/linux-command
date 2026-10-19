import { describe, expect, it } from "vitest";
import { chmod, chown, sudo, su } from "./definitions";
import { generateCommand, initialInputs } from "./generation";
import type { CommandDefinition, CommandInputs } from "./types";
import { isExecutable, serializeInnerCommand } from "./privileges";
import {
  isOctalPermission,
  numericPermissionRows,
  parseSymbolicClause,
  permissionLetters,
  serializeSymbolicClause,
  togglePermission,
} from "./permissions";
import { getCommandWarnings } from "./warnings";
import { commands, validateRegistry } from "./registry";

function generate(
  definition: CommandDefinition,
  overrides: CommandInputs = {},
) {
  return generateCommand(definition, {
    ...initialInputs(definition),
    ...overrides,
  });
}

// Decode only the single-quote serialization produced by our composer. This is
// deliberately a test helper, not a production shell parser or shell execution.
function decodeQuotedTokens(text: string): string[] {
  const values: string[] = [];
  let value = "",
    inQuote = false,
    started = false;
  for (let index = 0; index < text.length; index++) {
    if (inQuote && text.slice(index, index + 5) === "'\"'\"'") {
      value += "'";
      index += 4;
      started = true;
    } else if (text[index] === "'") {
      inQuote = !inQuote;
      started = true;
    } else if (text[index] === " " && !inQuote) {
      if (started) values.push(value);
      value = "";
      started = false;
    } else {
      value += text[index];
      started = true;
    }
  }
  if (inQuote) throw new Error("Unbalanced composer output");
  if (started) values.push(value);
  return values;
}

describe("sudo composer", () => {
  it("requires a program and uses explicit root by default", () => {
    expect(generate(sudo).command).toBeNull();
    expect(
      generate(sudo, { executable: "apt", arguments: ["update"] }).command,
    ).toBe("sudo -u 'root' -- 'apt' 'update'");
  });
  it("supports target user, group, executable path, and multiple arguments", () => {
    expect(
      generate(sudo, {
        user: "www-data",
        group: "developers",
        executable: "/usr/bin/id",
        arguments: ["-u", "-n"],
      }).command,
    ).toBe("sudo -u 'www-data' -g 'developers' -- '/usr/bin/id' '-u' '-n'");
  });
  it.each([
    ["login", "-i"],
    ["shell", "-s"],
    ["list", "-l"],
    ["validate", "-v"],
  ])("supports exclusive %s mode", (mode, flag) => {
    expect(
      generate(sudo, {
        mode,
        user: "postgres",
        executable: "$(ignored)",
        arguments: ["\n"],
      }).command,
    ).toBe(`sudo -u 'postgres' ${flag}`);
  });
  it("emits standalone -k without stale user/group/command input", () => {
    expect(
      generate(sudo, {
        mode: "invalidate",
        user: "bad user",
        group: "bad group",
        executable: "bad script",
      }).command,
    ).toBe("sudo -k");
  });
  it.each([
    "",
    " ",
    "apt update",
    "ls|cat",
    "$(id)",
    "`id`",
    "ls>out",
    "x;y",
    "NAME=x",
    "--help",
    "~/tool",
    "a\nb",
    "/path with spaces/tool",
  ])("rejects unsupported executable %j", (executable) => {
    expect(generate(sudo, { executable }).command).toBeNull();
  });
  it.each(["my-tool", "/usr/bin/id", "./tools/check", "../bin/check", "g++"])(
    "allows constrained executable %s",
    (name) => {
      expect(isExecutable(name)).toBe(true);
    },
  );
  it("quotes arguments as literal tokens and preserves intentional empty rows", () => {
    const args = [
      "file with spaces",
      "user's file",
      "$(id); > x | y",
      "",
      "--flag",
      "~/$HOME",
    ];
    const text = generate(sudo, {
      executable: "tool",
      arguments: args,
    }).command!;
    const tokens = decodeQuotedTokens(text.slice(text.indexOf("-- ") + 3));
    expect(tokens).toEqual(["tool", ...args]);
  });
  it("rejects incompatible modes, raw mode flags, and invalid account names", () => {
    expect(generate(sudo, { mode: "login,shell" }).command).toBeNull();
    expect(
      generate(sudo, { executable: "id", loginMode: true }).command,
    ).toBeNull();
    expect(
      generate(sudo, { executable: "id", group: "x:y" }).command,
    ).toBeNull();
    expect(generate(sudo, { executable: "id", user: "" }).command).toBeNull();
    expect(
      generate(sudo, { executable: "id", arguments: ["bad\0arg"] }).command,
    ).toBeNull();
  });
});

describe("su composer", () => {
  it("supports default and named user switching", () => {
    expect(generate(su).command).toBe("su");
    expect(generate(su, { user: "alice" }).command).toBe("su -- 'alice'");
  });
  it("supports login mode and ignores stale environment preservation", () => {
    expect(generate(su, { mode: "login" }).command).toBe("su -l");
    expect(
      generate(su, { mode: "login", user: "alice", preserve: true }).command,
    ).toBe("su -l -- 'alice'");
  });
  it("supports shell selection and preservation outside login mode", () => {
    expect(
      generate(su, { shell: "/bin/bash", preserve: true, user: "alice" })
        .command,
    ).toBe("su -m -s '/bin/bash' -- 'alice'");
  });
  it("requires a constrained program in command mode and fixes the POSIX shell", () => {
    expect(generate(su, { mode: "command" }).command).toBeNull();
    const text = generate(su, {
      mode: "command",
      user: "alice",
      executable: "id",
      arguments: ["-u"],
      shell: "bad shell",
    }).command!;
    const outer = decodeQuotedTokens(text);
    expect(outer).toEqual([
      "su",
      "-s",
      "/bin/sh",
      "-c",
      "'id' '-u'",
      "--",
      "alice",
    ]);
  });
  it.each([
    "plain",
    "with spaces",
    "user's file",
    'a"b',
    "$(touch x)",
    "`id`",
    ";|>&",
    "",
    "\\",
    "~/$HOME",
  ])(
    "preserves nested literal argument %j through both quote layers",
    (argument) => {
      const arguments_ = [argument, "last"];
      const text = generate(su, {
        mode: "command",
        executable: "/usr/bin/printf",
        arguments: arguments_,
        user: "alice",
      }).command!;
      const outer = decodeQuotedTokens(text);
      expect(outer.slice(0, 4)).toEqual(["su", "-s", "/bin/sh", "-c"]);
      expect(decodeQuotedTokens(outer[4]!)).toEqual([
        "/usr/bin/printf",
        ...arguments_,
      ]);
    },
  );
  it("serializes the inner command independently", () => {
    expect(serializeInnerCommand("whoami", [""])).toBe("'whoami'");
    expect(serializeInnerCommand("id", ["-u"])).toBe("'id' '-u'");
  });
  it.each(["bash", "~/bash", "/bin/bash -c", "$(id)", "/bin/sh;id"])(
    "rejects unsupported shell path %j",
    (shell) => {
      expect(generate(su, { shell }).command).toBeNull();
    },
  );
  it("rejects invalid usernames, command expressions, and mode combinations", () => {
    expect(generate(su, { user: "bad name" }).command).toBeNull();
    expect(generate(su, { mode: "login,command" }).command).toBeNull();
    expect(
      generate(su, { mode: "command", executable: "id -u" }).command,
    ).toBeNull();
    expect(
      generate(su, {
        mode: "command",
        executable: "id",
        arguments: ["bad\narg"],
      }).command,
    ).toBeNull();
  });
});

describe("permission arithmetic and chmod", () => {
  it.each([
    ["644", "rw-r--r--"],
    ["755", "rwxr-xr-x"],
    ["700", "rwx------"],
    ["600", "rw-------"],
    ["754", "rwxr-xr--"],
    ["000", "---------"],
  ])("represents mode %s as %s", (numeric, symbolic) => {
    expect(
      numericPermissionRows(numeric)
        .map((row) => row.letters)
        .join(""),
    ).toBe(symbolic);
    expect(generate(chmod, { numeric, paths: ["file.txt"] }).command).toBe(
      `chmod -- '${numeric}' 'file.txt'`,
    );
  });
  it("sums/toggles independent permission bits", () => {
    expect(permissionLetters(4 + 2 + 1)).toBe("rwx");
    expect(togglePermission("644", 0, 1)).toBe("744");
    expect(togglePermission("744", 1, 1)).toBe("754");
    expect(togglePermission("754", 2, 2)).toBe("756");
    expect(togglePermission("bad", 0, 4)).toBe("bad");
    expect(togglePermission("644", 3, 4)).toBe("644");
  });
  it.each(["", "888", "64", "0644", "4755", "7777", "u+x", " 644", "644 "])(
    "rejects unsupported numeric mode %j",
    (numeric) => {
      expect(isOctalPermission(numeric)).toBe(false);
      expect(generate(chmod, { numeric, paths: ["file"] }).command).toBeNull();
    },
  );
  it.each(["u+x", "g-w", "o-r", "a+r", "u=rw", "g=r", "o=", "a="])(
    "supports symbolic clause %s",
    (clause) => {
      expect(
        generate(chmod, {
          permissionMode: "symbolic",
          clauses: [clause],
          paths: ["file"],
        }).command,
      ).toBe(`chmod -- '${clause}' 'file'`);
    },
  );
  it("preserves clause order and canonicalizes checkbox permissions", () => {
    expect(
      generate(chmod, {
        permissionMode: "symbolic",
        clauses: ["u=rw", "g=r", "o="],
        paths: ["file"],
      }).command,
    ).toBe("chmod -- 'u=rw,g=r,o=' 'file'");
    expect(
      serializeSymbolicClause({ who: "u", operator: "+", permissions: "xrrw" }),
    ).toBe("u+rwx");
    expect(parseSymbolicClause("g+")).toBeNull();
    expect(parseSymbolicClause("g+", true)?.who).toBe("g");
  });
  it.each([
    "+x",
    "ug+x",
    "u+",
    "g-",
    "u+X",
    "u+s",
    "a+t",
    "o=u",
    "u+x;id",
    "u+xx",
    "u+xw",
    "u=rw,g=r",
  ])("rejects unsupported symbolic clause %j", (clause) => {
    expect(
      generate(chmod, {
        permissionMode: "symbolic",
        clauses: [clause],
        paths: ["file"],
      }).command,
    ).toBeNull();
  });
  it("supports recursion, reporting, silence, multiple and option-like paths", () => {
    expect(
      generate(chmod, {
        numeric: "755",
        recursive: true,
        reporting: "changes",
        silent: true,
        paths: ["My Files", "-v", "user's file"],
      }).command,
    ).toBe("chmod -R -c -f -- '755' 'My Files' '-v' 'user'\"'\"'s file'");
  });
  it("rejects missing targets, malformed editor values, and reporting conflicts", () => {
    expect(generate(chmod).command).toBeNull();
    expect(generate(chmod, { paths: [] }).command).toBeNull();
    expect(generate(chmod, { paths: ["file", " "] }).command).toBeNull();
    expect(
      generate(chmod, { paths: ["file"], reporting: "verbose,changes" })
        .command,
    ).toBeNull();
    expect(
      generate(chmod, {
        paths: ["file"],
        verboseReport: true,
        changesReport: true,
      }).command,
    ).toBeNull();
    expect(
      generate(chmod, {
        paths: ["file"],
        permissionMode: "symbolic",
        clauses: "u+x",
      }).command,
    ).toBeNull();
  });
});

describe("chown ownership pairs", () => {
  it.each([
    ["alice", "", "alice"],
    ["", "developers", ":developers"],
    ["alice", "developers", "alice:developers"],
  ])("supports owner %j and group %j", (owner, group, spec) => {
    expect(generate(chown, { owner, group, paths: ["file"] }).command).toBe(
      `chown -- '${spec}' 'file'`,
    );
  });
  it.each([
    ["olduser", "", "olduser"],
    ["", "oldgroup", ":oldgroup"],
    ["olduser", "oldgroup", "olduser:oldgroup"],
  ])("supports conditional owner %j/group %j", (fromOwner, fromGroup, spec) => {
    expect(
      generate(chown, {
        owner: "alice",
        conditional: true,
        fromOwner,
        fromGroup,
        paths: ["file"],
      }).command,
    ).toBe(`chown --from='${spec}' -- 'alice' 'file'`);
  });
  it("ignores stale disabled conditional fields", () => {
    expect(
      generate(chown, {
        owner: "alice",
        fromOwner: "bad owner",
        paths: ["file"],
      }).command,
    ).toBe("chown -- 'alice' 'file'");
  });
  it("rejects ambiguous dotted owner-only names but permits explicit colon pairs", () => {
    expect(
      generate(chown, { owner: "alice.team", paths: ["file"] }).command,
    ).toBeNull();
    expect(
      generate(chown, {
        owner: "alice",
        conditional: true,
        fromOwner: "old.team",
        paths: ["file"],
      }).command,
    ).toBeNull();
    expect(
      generate(chown, {
        owner: "alice.team",
        group: "developers",
        paths: ["file"],
      }).command,
    ).toBe("chown -- 'alice.team:developers' 'file'");
  });
  it("supports recursive multiple literal targets and reporting", () => {
    expect(
      generate(chown, {
        owner: "alice",
        group: "developers",
        recursive: true,
        reporting: "verbose",
        silent: true,
        paths: ["My Files", "--from=x", "a'b"],
      }).command,
    ).toBe(
      "chown -R -v -f -- 'alice:developers' 'My Files' '--from=x' 'a'\"'\"'b'",
    );
  });
  it.each([" ", "alice:group", "123", "--help", "$(id)", "a;b"])(
    "rejects unsupported ownership name %j",
    (owner) => {
      expect(generate(chown, { owner, paths: ["file"] }).command).toBeNull();
      expect(
        generate(chown, { group: owner, paths: ["file"] }).command,
      ).toBeNull();
      expect(
        generate(chown, {
          owner: "alice",
          conditional: true,
          fromOwner: owner,
          paths: ["file"],
        }).command,
      ).toBeNull();
    },
  );
  it("rejects empty ownership/filter, missing paths, and reporting conflicts", () => {
    expect(generate(chown, { paths: ["file"] }).command).toBeNull();
    expect(generate(chown, { owner: "alice" }).command).toBeNull();
    expect(
      generate(chown, { owner: "alice", paths: ["file"], conditional: true })
        .command,
    ).toBeNull();
    expect(
      generate(chown, {
        owner: "alice",
        paths: ["file"],
        reporting: "verbose,changes",
      }).command,
    ).toBeNull();
    expect(
      generate(chown, { owner: "alice", paths: ["file"], verboseReport: true })
        .command,
    ).toBeNull();
  });
});

describe("privilege and permission education", () => {
  it("always warns for sudo/su and supplies both languages", () => {
    for (const definition of [sudo, su]) {
      const warnings = getCommandWarnings(
        definition,
        initialInputs(definition),
      );
      expect(warnings[0]?.level).toBe("warning");
      expect(warnings[0]?.text.en).toContain("password");
      expect(warnings[0]?.text.id).toContain("kata sandi");
    }
  });
  it("warns for world-write, permissive modes, and recursion", () => {
    const warnings = getCommandWarnings(chmod, {
      ...initialInputs(chmod),
      numeric: "777",
      recursive: true,
    });
    expect(
      warnings.some((warning) => warning.text.en.includes("World-writable")),
    ).toBe(true);
    expect(warnings.some((warning) => warning.level === "danger")).toBe(true);
    expect(
      warnings.some((warning) => warning.text.en.includes("Recursive")),
    ).toBe(true);
    for (const definition of [chmod, chown])
      expect(
        getCommandWarnings(definition, {
          ...initialInputs(definition),
          recursive: true,
        }).some((warning) => warning.text.id.includes("rekursif")),
      ).toBe(true);
  });
  it("warns conservatively on symbolic write grants without claiming final permissions", () => {
    for (const clauses of [["o+w"], ["a=rw"], ["o+w", "o-w"]]) {
      expect(
        getCommandWarnings(chmod, {
          ...initialInputs(chmod),
          permissionMode: "symbolic",
          clauses,
        }).some((warning) => warning.text.en.includes("World-writable")),
      ).toBe(true);
    }
    expect(
      getCommandWarnings(chmod, {
        ...initialInputs(chmod),
        permissionMode: "symbolic",
        clauses: ["o-w"],
      }).some((warning) => warning.text.en.includes("World-writable")),
    ).toBe(false);
  });
  it("registers executable definitions with complete metadata", () => {
    expect(commands).toHaveLength(30);
    expect(validateRegistry(commands)).toEqual([]);
    const invalid = {
      ...chmod,
      arguments: chmod.arguments.map((argument) =>
        argument.id === "numeric" ? { ...argument, multiple: true } : argument,
      ),
    };
    expect(validateRegistry([invalid])).toContain(
      "Invalid argument editor: chmod/numeric",
    );
  });
});
