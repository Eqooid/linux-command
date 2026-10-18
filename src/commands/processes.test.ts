import { describe, expect, it } from "vitest";
import { ps, top, kill, pkill, jobs } from "./definitions";
import { generateCommand, initialInputs } from "./generation";
import { signals, psColumns, isPositiveProcessInteger } from "./processes";
import { getCommandWarnings } from "./warnings";
import { commands, getCommand, validateRegistry } from "./registry";
import type { CommandDefinition, CommandInputs } from "./types";

function generate(definition: CommandDefinition, inputs: CommandInputs = {}) {
  return generateCommand(definition, {
    ...initialInputs(definition),
    ...inputs,
  });
}
const invalidPids = [
  "0",
  "-1",
  "-1234",
  "1.5",
  "1e3",
  "+12",
  " ",
  "1234 ",
  "1,2",
  "1;id",
  "2147483648",
  "NaN",
];

describe("ps presets and advanced selection", () => {
  it.each([
    ["terminal", "ps"],
    ["all", "ps -e"],
    ["full", "ps -ef"],
    ["bsd", "ps aux"],
    ["tree", "ps -ejH"],
  ])("builds exclusive preset %s", (mode, command) => {
    expect(generate(ps, { mode }).command).toBe(command);
    expect(
      generate(ps, {
        mode,
        pids: ["bad"],
        username: "bad user",
        columns: "bad",
      }).command,
    ).toBe(command);
  });
  it("generates default and custom columns without adding all-process selection", () => {
    expect(generate(ps).command).toBe("ps");
    expect(generate(ps, { mode: "advanced" }).command).toBe("ps");
    expect(
      generate(ps, { mode: "advanced", columns: "pid,ppid,user,stat,cmd" })
        .command,
    ).toBe("ps -o 'pid,ppid,user,stat,cmd'");
  });
  it("supports multiple PIDs and ordered columns", () => {
    expect(
      generate(ps, {
        mode: "advanced",
        pids: ["001234", "5678"],
        columns: "pid,cmd",
      }).command,
    ).toBe("ps -p 1234,5678 -o 'pid,cmd'");
  });
  it("supports effective-user selection", () => {
    expect(generate(ps, { mode: "advanced", username: "root" }).command).toBe(
      "ps -u 'root'",
    );
    expect(
      generate(ps, {
        mode: "advanced",
        username: "service-user",
        columns: "user,pid",
      }).command,
    ).toBe("ps -u 'service-user' -o 'user,pid'");
  });
  it.each(psColumns)("allows output column %s", (column) => {
    expect(generate(ps, { mode: "advanced", columns: column }).command).toBe(
      `ps -o '${column}'`,
    );
  });
  it.each([
    "pid, pid",
    "PID",
    "pid,pid",
    "pid=PID",
    "pid;id",
    "pid,",
    ",pid",
    "unknown",
    " ",
  ])("rejects unsupported columns %j", (columns) => {
    expect(generate(ps, { mode: "advanced", columns }).command).toBeNull();
  });
  it.each(invalidPids)("rejects PID %j", (pid) => {
    expect(generate(ps, { mode: "advanced", pids: [pid] }).command).toBeNull();
  });
  it("rejects invalid presets, raw flags, combined selectors, and incomplete rows", () => {
    expect(generate(ps, { mode: "all,bsd" }).command).toBeNull();
    expect(generate(ps, { aux: true }).command).toBeNull();
    expect(
      generate(ps, { mode: "advanced", pids: ["1234"], username: "alice" })
        .command,
    ).toBeNull();
    expect(
      generate(ps, { mode: "advanced", pids: ["1234", ""] }).command,
    ).toBeNull();
    expect(
      generate(ps, { mode: "advanced", username: "alice,bob" }).command,
    ).toBeNull();
  });
});

describe("top configuration", () => {
  it("generates default monitoring, batch limits, and thread output", () => {
    expect(generate(top).command).toBe("top");
    expect(generate(top, { batch: true, updates: "1" }).command).toBe(
      "top -b -n 1",
    );
    expect(generate(top, { threads: true }).command).toBe("top -H");
    expect(generate(top, { updates: "3" }).command).toBe("top -n 3");
  });
  it.each(["2", "0.5", "0.1", "2.0", "001.5"])(
    "supports positive refresh %s",
    (delay) => {
      expect(generate(top, { delay }).command).toBe(`top -d ${Number(delay)}`);
    },
  );
  it("supports PID or effective-user filtering", () => {
    expect(generate(top, { pids: ["1234", "5678"] }).command).toBe(
      "top -p 1234,5678",
    );
    expect(generate(top, { username: "root" }).command).toBe("top -u 'root'");
    expect(
      generate(top, {
        threads: true,
        batch: true,
        pids: ["1234"],
        delay: "2",
        updates: "5",
      }).command,
    ).toBe("top -b -H -d 2 -p 1234 -n 5");
  });
  it.each([
    "0",
    "-1",
    "0.0",
    "0.01",
    "NaN",
    "Infinity",
    "1e3",
    "2;id",
    " 2",
    "2.",
    ".5",
    "2147483648",
  ])("rejects unsupported refresh %j", (delay) => {
    expect(generate(top, { delay }).command).toBeNull();
  });
  it.each(invalidPids)("rejects invalid update count and PID %j", (value) => {
    expect(generate(top, { updates: value }).command).toBeNull();
    expect(generate(top, { pids: [value] }).command).toBeNull();
  });
  it("enforces twenty PID entries, PID/user exclusivity, and username validation", () => {
    const pids = Array.from({ length: 20 }, (_, index) => String(index + 1));
    expect(generate(top, { pids }).errors).toEqual([]);
    expect(generate(top, { pids: [...pids, "21"] }).command).toBeNull();
    expect(
      generate(top, { pids: ["1234"], username: "root" }).command,
    ).toBeNull();
    expect(generate(top, { username: "!root" }).command).toBeNull();
    expect(generate(top, { username: "1234" }).command).toBeNull();
    expect(generate(top, { pids: ["1234", ""] }).command).toBeNull();
  });
  it("includes all nine bilingual shortcut descriptions with state-change guidance", () => {
    expect(top.shortcuts?.items.map((item) => item.keys)).toEqual([
      "q",
      "P",
      "M",
      "T",
      "k",
      "r",
      "H",
      "1",
      "h",
    ]);
    expect(top.warnings[0]?.en).toContain("privileges");
    for (const item of top.shortcuts!.items) {
      expect(item.description.en.trim()).not.toBe("");
      expect(item.description.id.trim()).not.toBe("");
    }
  });
});

describe("kill and shared Linux signals", () => {
  it("defaults to an explicit SIGTERM and requires a positive target", () => {
    expect(initialInputs(kill).signal).toBe("TERM");
    expect(initialInputs(pkill).signal).toBe("TERM");
    expect(generate(kill).command).toBeNull();
    expect(generate(kill, { pids: [] }).command).toBeNull();
    expect(generate(kill, { pids: ["1234"] }).command).toBe(
      "kill -TERM -- 1234",
    );
  });
  it.each(signals)(
    "supports SIG$name by name with Linux number $number",
    (signal) => {
      expect(
        generate(kill, { signal: signal.name, pids: ["1234", "5678"] }).command,
      ).toBe(`kill -${signal.name} -- 1234 5678`);
      expect(
        generate(pkill, { signal: signal.name, pattern: "nginx" }).command,
      ).toBe(`pkill -${signal.name} -- 'nginx'`);
    },
  );
  it.each(invalidPids)("rejects unsafe/malformed PID %j", (pid) => {
    expect(isPositiveProcessInteger(pid)).toBe(false);
    expect(generate(kill, { pids: [pid] }).command).toBeNull();
    expect(generate(kill, { pids: ["1234", pid] }).command).toBeNull();
  });
  it("normalizes decimal PIDs and rejects malformed types or conflicts", () => {
    expect(generate(kill, { pids: ["0001234"] }).command).toBe(
      "kill -TERM -- 1234",
    );
    expect(generate(kill, { pids: ["2147483647"] }).errors).toEqual([]);
    expect(generate(kill, { pids: ["1234", ""] }).command).toBeNull();
    expect(generate(kill, { pids: "1234" }).command).toBeNull();
    expect(
      generate(kill, { pids: ["1234"], signal: "TERM,KILL" }).command,
    ).toBeNull();
    expect(generate(kill, { pids: ["1234"], signal: "9" }).command).toBeNull();
    expect(
      generate(kill, { pids: ["1234"], signalKILL: true }).command,
    ).toBeNull();
  });
});

describe("pkill pattern criteria", () => {
  it("generates default, exact, full-command-line, and combined matching", () => {
    expect(generate(pkill, { pattern: "nginx" }).command).toBe(
      "pkill -TERM -- 'nginx'",
    );
    expect(generate(pkill, { pattern: "nginx", exact: true }).command).toBe(
      "pkill -TERM -x -- 'nginx'",
    );
    expect(
      generate(pkill, { pattern: "node server.js", full: true }).command,
    ).toBe("pkill -TERM -f -- 'node server.js'");
    expect(
      generate(pkill, {
        pattern: "node server.js",
        full: true,
        exact: true,
        ignoreCase: true,
        echo: true,
        username: "alice",
        signal: "KILL",
      }).command,
    ).toBe("pkill -KILL -f -x -i -e -u 'alice' -- 'node server.js'");
  });
  it.each([
    "-nginx",
    "user's process",
    "$(id); | >",
    "error|warning",
    "[",
    "a.*",
  ])(
    "quotes shell-literal regex %j without pretending to evaluate it",
    (pattern) => {
      expect(generate(pkill, { pattern }).command).toBe(
        "pkill -TERM -- '" + pattern.replaceAll("'", "'\"'\"'") + "'",
      );
    },
  );
  it.each(["", " ", "\t", "a\nb", "a\0b"])(
    "rejects blank/multiline/control pattern %j",
    (pattern) => {
      expect(generate(pkill, { pattern }).command).toBeNull();
    },
  );
  it("rejects unsupported usernames, flags, signal modes, and malformed option values", () => {
    expect(
      generate(pkill, { pattern: "nginx", username: "alice;id" }).command,
    ).toBeNull();
    expect(
      generate(pkill, { pattern: "nginx", signal: "UNKNOWN" }).command,
    ).toBeNull();
    expect(
      generate(pkill, { pattern: "nginx", full: "true" }).command,
    ).toBeNull();
    expect(
      generate(pkill, { pattern: "nginx", arbitrary: true }).command,
    ).toBeNull();
  });
});

describe("Bash jobs", () => {
  it("supports default, long, PID, running, and stopped modes", () => {
    expect(generate(jobs).command).toBe("jobs");
    expect(generate(jobs, { display: "long" }).command).toBe("jobs -l");
    expect(generate(jobs, { display: "pids" }).command).toBe("jobs -p");
    expect(generate(jobs, { state: "running" }).command).toBe("jobs -r");
    expect(generate(jobs, { state: "stopped" }).command).toBe("jobs -s");
    expect(
      generate(jobs, { display: "long", state: "stopped", jobspec: "%1" })
        .command,
    ).toBe("jobs -l -s -- '%1'");
  });
  it("normalizes a quoted numeric job specification", () => {
    expect(generate(jobs, { jobspec: "%0001" }).command).toBe("jobs -- '%1'");
  });
  it.each([
    "%0",
    "%-1",
    "1",
    "%%",
    "%+",
    "%-",
    "%name",
    "%?text",
    "%1;id",
    "%1 %2",
    " %1",
    "%2147483648",
  ])("rejects unsupported job specification %j", (jobspec) => {
    expect(generate(jobs, { jobspec }).command).toBeNull();
  });
  it("rejects conflicting filters and raw flags", () => {
    expect(generate(jobs, { state: "running,stopped" }).command).toBeNull();
    expect(generate(jobs, { display: "long,pids" }).command).toBeNull();
    expect(
      generate(jobs, { runningState: true, stoppedState: true }).command,
    ).toBeNull();
  });
});

describe("process warnings and educational registry metadata", () => {
  it("raises SIGKILL severity for both targeting methods without selecting it automatically", () => {
    for (const definition of [kill, pkill]) {
      const standard = getCommandWarnings(
        definition,
        initialInputs(definition),
      );
      expect(standard.some((warning) => warning.level === "danger")).toBe(
        false,
      );
      const forced = getCommandWarnings(definition, {
        ...initialInputs(definition),
        signal: "KILL",
      });
      expect(
        forced.some(
          (warning) =>
            warning.level === "danger" &&
            warning.text.en.includes("cleanup") &&
            warning.text.id.includes("pembersihan"),
        ),
      ).toBe(true);
      expect(
        getCommandWarnings(definition, {
          ...initialInputs(definition),
          signal: "STOP",
        }).some((warning) => warning.text.en.includes("SIGSTOP")),
      ).toBe(true);
    }
  });
  it("warns for full matching and unlimited batch output", () => {
    expect(
      getCommandWarnings(pkill, { ...initialInputs(pkill), full: true }).some(
        (warning) => warning.text.en.includes("Full-command-line"),
      ),
    ).toBe(true);
    expect(
      getCommandWarnings(top, { ...initialInputs(top), batch: true }).some(
        (warning) => warning.text.en.includes("Without an update limit"),
      ),
    ).toBe(true);
    expect(
      getCommandWarnings(top, {
        ...initialInputs(top),
        batch: true,
        updates: "1",
      }).some((warning) => warning.text.en.includes("Without an update limit")),
    ).toBe(false);
  });
  it("registers five complete process builders without later commands", () => {
    expect(commands).toHaveLength(26);
    expect(
      commands
        .filter((command) => command.category === "processes")
        .map((command) => command.id),
    ).toEqual(["ps", "top", "kill", "pkill", "jobs"]);
    expect(validateRegistry(commands)).toEqual([]);
    for (const command of ["pgrep", "fg", "bg", "nice", "renice"])
      expect(getCommand(command)).toBeUndefined();
    for (const definition of [ps, top, kill, pkill, jobs]) {
      expect(definition.concepts).toHaveLength(8);
      for (const concept of definition.concepts!) {
        expect(concept.term.en).not.toBe("");
        expect(concept.term.id).not.toBe("");
        expect(concept.description.en).not.toBe("");
        expect(concept.description.id).not.toBe("");
      }
    }
  });
  it("rejects missing or ambiguous concept metadata", () => {
    expect(validateRegistry([{ ...ps, concepts: [] }])).toContain(
      "Invalid concepts: ps",
    );
    expect(
      validateRegistry([
        { ...ps, concepts: [ps.concepts![0]!, ps.concepts![0]!] },
      ]),
    ).toContain("Invalid concepts: ps");
    expect(
      validateRegistry([
        {
          ...ps,
          concepts: [
            {
              term: { en: "Process", id: "" },
              description: { en: "Text", id: "Teks" },
            },
          ],
        },
      ]),
    ).toContain("Missing translation: ps");
  });
});
