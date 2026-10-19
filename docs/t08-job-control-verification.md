# T08 extension: shell job control verification

Verified on 20 October 2026. The initial working tree was clean. Existing Process Management builders, registry-driven forms, shell quoting, bilingual content and storage were reused. The catalog now has 30 entries, including nine Process Management entries: six earlier builders, two new Bash builtins, and one shell-operator feature. Dependencies, package version, deployment configuration and localStorage schema version 1 are unchanged.

## Executed checks

- `npm.cmd run typecheck`: passed.
- `npm.cmd test`: **758 tests passed across 27 files**, including earlier command regressions.
- `npm.cmd run build`: passed; static output generated in `dist/`. Vite emitted a non-blocking warning for the main JavaScript chunk at approximately 507 kB minified (155 kB gzip). Code splitting remains a possible later optimization.
- `npm.cmd run dev -- --host 127.0.0.1`: started successfully.
- `git diff --check`: passed.
- ESLint/lint: not configured; no lint result is claimed.
- Isolated headless Chrome: **63 assertions passed**, without uncaught application exceptions.

Browser checks used a temporary profile and scripts without adding an E2E framework. All generated Linux commands were compared as text, never executed. No application or command test inspected real processes or shell jobs.

## Coverage

- Background execution: separate executable/argument fields, multiple argument rows, literal executable and argument paths with spaces, apostrophes, shell metacharacters as literal arguments, and a final unquoted `&`. Invalid executable expressions prevent preview/copy/pin; reset clears the form.
- fg/bg: current job defaults, explicit `%+`, previous `%-`, numbered `%N`, conditional number input, zero/negative/malformed rejection, and stale hidden input handling. Unit tests additionally cover integer bounds, leading zeroes, raw conflicting fields and malformed modes.
- Registry: optional executable/builtin/operator distinction; `background` is a stable feature ID with display syntax `command &`, never an executable named `&`. fg/bg share metadata, validation and generation logic.
- Learning: translated form labels, concepts and shortcuts; language switching preserves generated syntax. Concepts distinguish job IDs from PIDs and stopped from running jobs. Workflow comments describe key presses only; examples do not assume job number 1 is assigned.
- Actual clipboard write/read for background, fg and bg output.
- Favorite/pin/unpin/unfavorite behavior for all new entries. Reload restores new pins alongside a seeded pgrep pin and preserves existing text, version, theme and language. Pure storage tests independently verify the same compatibility and exact-text duplicate toggles.
- Existing ps, top, kill, pkill, jobs and pgrep default previews remain correct. The full unit suite also exercises all earlier command families, preference serialization, copying behavior and localization.
- Process category discovery, themes, mobile navigation, and no horizontal page overflow at widths 390px and 320px. Desktop/mobile screenshots were inspected, including a focused job-control form.

## Limitations

The generator targets POSIX-compatible single-quote serialization and Bash job specifications. Executable input deliberately supports a restricted ASCII subset; explicit absolute or `./`/`../` paths additionally permit spaces and apostrophes. It does not parse arbitrary scripts, expand variables/globs, verify executables, inspect jobs, or evaluate permissions. Quoting token boundaries is not a guarantee that a program or its arguments are safe to run manually.

Background execution is always enabled in its dedicated builder. One untouched empty argument row means no arguments; empty rows alongside other rows are intentional empty literals. Only current, previous and positive numbered job specifications are supported, with an explicit current alias. The numeric limit is a builder convention, not a discovered system limit.

fg/bg require an appropriate shell session with job control. Job IDs are local to that shell and are not PIDs. Background execution does not imply daemonization, logout persistence, or a persistent service; terminal I/O and environment matter. Ctrl + Z and Ctrl + C behavior can vary. No pipelines, redirection, nohup, disown, wait, process simulator or execution feature was added.

Browser verification covers one Chromium environment, not comprehensive cross-browser or accessibility auditing. T09 was not started.
