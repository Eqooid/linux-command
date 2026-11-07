import { describe, expect, it } from "vitest";
import { systemctl, journalctl, pwd } from "./definitions";
import { generateCommand, initialInputs } from "./generation";
import { isInputVisible } from "./validation";
import { categories, commands, getCommand, validateRegistry } from "./registry";
import { getCommandWarnings } from "./warnings";
import {
  changingActions,
  unitActions,
  unitTypes,
  priorities,
  isUnitName,
} from "./systemd";
import type { CommandDefinition, CommandInputs } from "./types";

const generate = (definition: CommandDefinition, inputs: CommandInputs = {}) =>
  generateCommand(definition, { ...initialInputs(definition), ...inputs });
const system = (inputs: CommandInputs = {}) =>
  generate(systemctl, { unit: "nginx", ...inputs });
const journal = (inputs: CommandInputs = {}) => generate(journalctl, inputs);

describe("systemctl actions", () => {
  it("defaults to an unprivileged status lookup and requires a unit", () => {
    expect(system()).toEqual({
      command: "systemctl status -- 'nginx'",
      errors: [],
    });
    expect(generate(systemctl).command).toBeNull();
    expect(initialInputs(systemctl).sudo).toBe(false);
  });
  it.each(unitActions)("generates %s with one literal operand", (action) => {
    expect(system({ action }).command).toBe(`systemctl ${action} -- 'nginx'`);
  });
  it.each(["enable", "disable"])("supports --now for %s", (action) => {
    expect(system({ action, now: true }).command).toBe(
      `systemctl --now ${action} -- 'nginx'`,
    );
    expect(system({ action, now: true, sudo: true }).command).toBe(
      `sudo systemctl --now ${action} -- 'nginx'`,
    );
  });
  it.each(changingActions)("offers opt-in sudo for system %s", (action) => {
    const result = system({ action, sudo: true });
    expect(result.errors).toEqual([]);
    expect(result.command).toBe(
      `sudo systemctl ${action}${action === "daemon-reload" ? "" : " -- 'nginx'"}`,
    );
    expect(system({ action, sudo: false }).command!.startsWith("sudo")).toBe(
      false,
    );
  });
  it("omits hidden sudo/now/all settings for incompatible actions and scopes", () => {
    expect(
      system({
        action: "restart",
        scope: "user",
        sudo: true,
        now: true,
        all: true,
      }).command,
    ).toBe("systemctl --user restart -- 'nginx'");
    expect(system({ action: "status", sudo: true, now: true }).command).toBe(
      "systemctl status -- 'nginx'",
    );
    expect(
      system({ action: "enable", scope: "user", sudo: true, now: true })
        .command,
    ).toBe("systemctl --user --now enable -- 'nginx'");
  });
  it.each(["list-units", "list-unit-files", "daemon-reload"])(
    "requires no unit for %s and ignores hidden stale unit values",
    (action) => {
      expect(generate(systemctl, { action }).command).toBe(
        `systemctl ${action}`,
      );
      expect(system({ action, unit: "$(invalid)" }).command).toBe(
        `systemctl ${action}`,
      );
    },
  );
  it.each(unitTypes)(
    "uses %s as an explicit suffix or listing filter",
    (unitType) => {
      expect(system({ unitType }).command).toBe(
        `systemctl status -- 'nginx.${unitType}'`,
      );
      expect(
        system({ action: "list-units", unitType, all: true }).command,
      ).toBe(`systemctl --type=${unitType} --all list-units`);
      expect(
        system({ action: "list-unit-files", unitType, all: true }).command,
      ).toBe(`systemctl --type=${unitType} list-unit-files`);
    },
  );
  it("does not append .service automatically or duplicate an explicit suffix", () => {
    expect(system({ unit: "nginx.service" }).command).toBe(
      "systemctl status -- 'nginx.service'",
    );
    expect(
      system({ unit: "nginx.service", unitType: "service" }).command,
    ).toBeNull();
    expect(
      system({ unit: "a".repeat(250), unitType: "service" }).command,
    ).toBeNull();
  });
  it("avoids interpreting a numeric status unit as a PID", () => {
    expect(system({ unit: "1234" }).command).toBeNull();
    expect(system({ unit: "1234", unitType: "service" }).command).toBe(
      "systemctl status -- '1234.service'",
    );
    expect(system({ unit: "1234.service" }).command).toBe(
      "systemctl status -- '1234.service'",
    );
  });
  it.each([
    "worker@blue.service",
    "worker@blue",
    "my-app.timer",
    "var-log.mount",
    "-.mount",
    "-option.service",
    "dbus-org.example.service",
  ])("preserves literal unit %s after --", (unit) => {
    expect(system({ unit }).command).toBe(`systemctl status -- '${unit}'`);
  });
  it.each([
    "",
    " ",
    "nginx.service docker.service",
    "$(id).service",
    "x;id",
    "x|id",
    "x>out",
    "`id`",
    "$HOME",
    "/tmp/nginx.service",
    "*.service",
    "x@a@b",
    "a'b",
    "x\n.service",
    "x\0.service",
    ".",
    "..",
    "a".repeat(256),
  ])("rejects invalid unit %s", (unit) => {
    expect(system({ unit }).command).toBeNull();
    expect(journal({ unit: unit || " " }).command).toBeNull();
  });
  it.each<CommandInputs>([
    { action: "mask" },
    { scope: "root" },
    { unitType: "unknown" },
    { action: "enable", now: "yes" },
    { sudo: "yes", action: "restart" },
    { force: true },
  ])("rejects unsupported active input %j", (inputs) => {
    expect(system(inputs).command).toBeNull();
  });
});

describe("journalctl filters", () => {
  it("defaults to journalctl without assuming system-only access", () => {
    expect(journal()).toEqual({ command: "journalctl", errors: [] });
    expect(journal({ scope: "system" }).command).toBe("journalctl --system");
    expect(journal({ scope: "user", unit: "my-app.service" }).command).toBe(
      "journalctl --user -u 'my-app.service'",
    );
  });
  it.each([
    "nginx.service",
    "docker.service",
    "worker@blue.service",
    "-option.service",
  ])("quotes unit filter %s as an option value", (unit) => {
    expect(journal({ unit }).command).toBe(`journalctl -u '${unit}'`);
  });
  it.each(["1", "20", "100", "2147483647"])(
    "generates recent-entry count %s",
    (count) => {
      expect(journal({ count }).command).toBe(`journalctl -n ${count}`);
    },
  );
  it("normalizes leading zeroes and combines filters in fixed order", () => {
    expect(
      journal({
        scope: "user",
        unit: "my-app.service",
        count: "0050",
        follow: true,
        boot: "current",
        priority: "err",
        output: "json",
        noPager: true,
      }).command,
    ).toBe(
      "journalctl --user -u 'my-app.service' -n 50 -f -b -p err -o json --no-pager",
    );
  });
  it.each(["0", "-1", "+1", "1.2", "1e3", "10;id", " ", "2147483648"])(
    "rejects invalid entry count %s",
    (count) => {
      expect(journal({ count }).command).toBeNull();
    },
  );
  it("supports follow and reverse separately, rejecting their combination", () => {
    expect(journal({ follow: true }).command).toBe("journalctl -f");
    expect(journal({ reverse: true, count: "50" }).command).toBe(
      "journalctl -n 50 -r",
    );
    expect(journal({ follow: true, reverse: true }).command).toBeNull();
  });
  it.each([
    [{ boot: "default" }, "journalctl"],
    [{ boot: "all", follow: true }, "journalctl -f --boot=all"],
    [{ boot: "current" }, "journalctl -b"],
    [{ boot: "previous" }, "journalctl -b -1"],
    [{ boot: "custom", bootOffset: "-2" }, "journalctl --boot=-2"],
    [{ boot: "custom", bootOffset: "+2" }, "journalctl --boot=2"],
    [{ boot: "custom", bootOffset: "-0" }, "journalctl --boot=0"],
    [{ boot: "custom", bootOffset: "0001" }, "journalctl --boot=1"],
    [{ boot: "all", bootOffset: "invalid" }, "journalctl --boot=all"],
  ])("generates boot selection %j", (inputs, expected) => {
    expect(journal(inputs).command).toBe(expected);
  });
  it.each(["", " ", "1.2", "--1", "x", "1;id", "2147483648", "-2147483648"])(
    "rejects invalid custom boot offset %s",
    (bootOffset) => {
      expect(journal({ boot: "custom", bootOffset }).command).toBeNull();
    },
  );
  it.each(priorities)("supports priority %s", (priority) => {
    expect(journal({ priority }).command).toBe(`journalctl -p ${priority}`);
  });
  it.each(["short", "short-iso", "cat", "json"])(
    "supports output %s",
    (output) => {
      expect(journal({ output }).command).toBe(
        output === "short" ? "journalctl" : `journalctl -o ${output}`,
      );
    },
  );
  it.each<CommandInputs>([
    { output: "xml" },
    { priority: "error" },
    { scope: "root" },
    { boot: "missing" },
    { follow: "true" },
    { countOption: true },
  ])("rejects unsupported input %j", (inputs) => {
    expect(journal(inputs).command).toBeNull();
  });
  it("uses a quoted structured time range and validates order without Date.parse", () => {
    const inputs = {
      sinceMode: "absolute",
      since: "2026-10-20 08:00:00",
      untilMode: "absolute",
      until: "2026-10-20 10:00:00",
    };
    expect(journal(inputs).command).toBe(
      "journalctl --since '2026-10-20 08:00:00' --until '2026-10-20 10:00:00'",
    );
    expect(journal({ ...inputs, until: inputs.since }).errors).toEqual([]);
    expect(
      journal({ ...inputs, until: "2026-10-19 10:00:00" }).command,
    ).toBeNull();
  });
  it.each(["2024-02-29 23:59:59", "2026-10-20 08:00:00"])(
    "accepts real civil timestamp %s",
    (since) => {
      expect(journal({ sinceMode: "absolute", since }).command).toBe(
        `journalctl --since '${since}'`,
      );
    },
  );
  it.each([
    "2026-02-29 08:00:00",
    "2026-13-01 08:00:00",
    "2026-04-31 08:00:00",
    "2026-10-20 24:00:00",
    "2026-10-20 08:60:00",
    "2026-10-20 08:00:60",
    "0000-01-01 00:00:00",
    "2026-10-20",
    "2026-10-20T08:00:00Z",
    "'2026-10-20 08:00:00'",
  ])("rejects unsupported/invalid structured timestamp %s", (since) => {
    expect(journal({ sinceMode: "absolute", since }).command).toBeNull();
  });
  it.each([
    "today",
    "yesterday",
    "tomorrow",
    "now",
    "1 hour ago",
    "2 days ago",
    "999999 seconds ago",
  ])(
    "quotes supported relative expression %s without resolving it",
    (since) => {
      expect(journal({ sinceMode: "relative", since }).command).toBe(
        `journalctl --since '${since}'`,
      );
    },
  );
  it.each([
    "",
    " ",
    "0 hours ago",
    "1 hour ago; id",
    "$(id)",
    "`id`",
    "today | cat",
    "a'b",
    "1000000 hours ago",
    "1 jam lalu",
    "2026-10-20 08:00:00",
  ])("rejects unsupported relative expression %s", (since) => {
    expect(journal({ sinceMode: "relative", since }).command).toBeNull();
  });
  it("supports until alone, mixed relative/absolute values and hidden stale values", () => {
    expect(journal({ untilMode: "relative", until: "today" }).command).toBe(
      "journalctl --until 'today'",
    );
    expect(
      journal({
        sinceMode: "relative",
        since: "1 hour ago",
        untilMode: "absolute",
        until: "2026-10-20 08:00:00",
      }).errors,
    ).toEqual([]);
    expect(journal({ since: "$(id)", until: "invalid" }).command).toBe(
      "journalctl",
    );
  });
});

describe("systemd registry, conditions and warnings", () => {
  it("registers both commands and complete bilingual content in the new category", () => {
    expect(categories).toContain("services");
    expect(
      commands.filter((command) => command.category === "services"),
    ).toEqual([systemctl, journalctl]);
    for (const definition of [systemctl, journalctl]) {
      expect(getCommand(definition.id)).toBe(definition);
      expect(validateRegistry([definition])).toEqual([]);
      expect(definition.concepts).toHaveLength(10);
      expect(definition.comparison!.map((row) => row.command)).toEqual([
        "systemctl status",
        "systemctl restart",
        "systemctl enable",
        "journalctl -u",
        "journalctl -f",
      ]);
      expect(
        definition.examples.some(
          (example) =>
            example.description.en.includes("downtime") &&
            example.description.id.includes("waktu henti"),
        ),
      ).toBe(true);
    }
    expect(
      validateRegistry([
        {
          ...journalctl,
          comparison: [
            {
              command: "journalctl;id",
              description: { en: "Bad", id: "Buruk" },
            },
          ],
        },
      ]),
    ).toContain("Invalid comparison: journalctl");
  });
  it("evaluates membership, AND and inverted visibility consistently", () => {
    expect(
      isInputVisible(
        { field: "action", value: ["enable", "disable"] },
        { action: "enable" },
      ),
    ).toBe(true);
    expect(
      isInputVisible(
        { field: "action", value: ["enable", "disable"], not: true },
        { action: "status" },
      ),
    ).toBe(true);
    const condition = systemctl.options.find(
      (option) => option.id === "sudo",
    )!.when;
    expect(
      isInputVisible(condition, { action: "restart", scope: "system" }),
    ).toBe(true);
    expect(
      isInputVisible(condition, { action: "restart", scope: "user" }),
    ).toBe(false);
    expect(
      isInputVisible(condition, { action: "status", scope: "system" }),
    ).toBe(false);
    expect(
      validateRegistry([
        {
          ...systemctl,
          arguments: [
            {
              ...systemctl.arguments[0]!,
              when: { field: "action", value: ["status", "invalid"] },
            },
          ],
        },
      ]),
    ).toContain("Invalid input condition: systemctl/unit");
  });
  it("documents argument options without inventing independent boolean fields", () => {
    const inputs = initialInputs(journalctl);
    for (const key of [
      "unitOption",
      "countOption",
      "sinceOption",
      "untilOption",
    ])
      expect(inputs).not.toHaveProperty(key);
    expect(
      validateRegistry([
        {
          ...pwd,
          options: [
            {
              id: "broken",
              flag: "-n",
              argument: "missing",
              label: { en: "Test", id: "Uji" },
              description: { en: "Test", id: "Uji" },
            },
          ],
        },
      ]),
    ).toContain("Invalid option argument: pwd/broken");
    expect(
      validateRegistry([
        {
          ...pwd,
          options: [
            {
              id: "sudo",
              flag: "sudo",
              label: { en: "Test", id: "Uji" },
              description: { en: "Test", id: "Uji" },
            },
          ],
        },
      ]),
    ).toContain("Invalid flag: pwd");
  });
  it("adds changing-state, downtime and explicit privilege warnings only where relevant", () => {
    const warnings = (inputs: CommandInputs) =>
      getCommandWarnings(systemctl, { ...initialInputs(systemctl), ...inputs });
    expect(
      warnings({ action: "status" }).every(
        (warning) => warning.level === "note",
      ),
    ).toBe(true);
    expect(
      warnings({ action: "restart", sudo: true }).some(
        (warning) =>
          warning.text.en.includes("downtime") &&
          warning.text.id.includes("waktu henti"),
      ),
    ).toBe(true);
    expect(
      warnings({ action: "restart", sudo: true }).some((warning) =>
        warning.text.en.includes("Explicit sudo"),
      ),
    ).toBe(true);
    expect(
      warnings({ action: "restart", scope: "user", sudo: true }).some(
        (warning) => warning.text.en.includes("Explicit sudo"),
      ),
    ).toBe(false);
    expect(
      warnings({ action: "disable", now: true }).some((warning) =>
        warning.text.en.includes("downtime"),
      ),
    ).toBe(true);
    expect(
      warnings({ action: "daemon-reload" }).some((warning) =>
        warning.text.en.includes("downtime"),
      ),
    ).toBe(false);
    expect(isUnitName("worker@blue.service")).toBe(true);
  });
});
