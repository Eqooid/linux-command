# T08 verification

Verified on 18 October 2026. Added ps, top, kill, pkill, and jobs under Process Management through the existing registry, forms, quoting, preview, warning, and storage patterns. There are now 26 executable builders. The working tree was clean before implementation. No dependency, backend, process inspection, simulation, terminal execution, or signal sending was added.

## Executed checks

- `npm.cmd run typecheck`: passed.
- `npm.cmd test`: 620 tests passed across 21 files, including T01–T07 regressions.
- `npm.cmd run build`: passed; static production files generated in dist/.
- `npm.cmd run dev -- --host 127.0.0.1`: started successfully.
- ESLint/lint: not configured in this project.
- Isolated headless Chrome: 85 assertions passed, with no runtime exceptions.

Browser QA used the installed browser, a temporary script, and an isolated profile outside the project; no permanent E2E framework was added. Linux command previews were compared as text and never executed. No real process or job state was read by the app or command tests.

## Coverage

- ps default and all four additional presets, BSD syntax, advanced PID lists/normalization, effective user, allowlisted columns, preset hiding/stale-value omission, invalid columns, incomplete PID rows, and explicit PID/user conflict handling.
- top default, positive fractional interval, invalid zero interval/count, PID versus user selection, batch and thread flags, bounded updates, unlimited-batch note, and all nine documented terminal shortcuts. Unit tests include the 20-PID limit, numeric bounds, and invalid formats.
- kill required targets, zero/negative rejection, multiple PIDs, all six shared signals, explicit default TERM, SIGKILL severity, and static safety guidance. Tests also cover malformed values, normalization, signal conflicts, and unknown raw flags.
- pkill required regex, shell quoting of leading hyphens/apostrophes/substitution-like text, full/exact/case/echo/user combinations, full-command-line and SIGKILL warnings, and language switching without changing syntax. Tests permit a malformed regex as quoted text without falsely claiming to validate GNU regex syntax.
- jobs default/long/leader-ID output, running/stopped filters, numeric specification, invalid/injection-like specifications, and unit-tested exclusivity.
- Shared bilingual concepts panel, collapsed by default, including R/S/D/T/Z states, PID/PPID, PID reuse, signals, foreground/background, shell jobs, and graceful/forced termination. Metadata and rendered references are tested.
- Actual clipboard write/read for all five new commands.
- All twenty-one prior builders exercised through live command previews.
- Five new favorites and configured pins restored beside a seeded T07 chmod record after reload. Pinned view displayed both; exact unpin/repin avoided duplicates. Unit persistence tests verify schema version 1, old exact text, new configurations, theme, and language.
- Light/dark themes, Indonesian/English switching, reload preferences, process category count, mobile menu behavior, and no horizontal overflow at 390px or 320px. Desktop dark/mobile light screenshots inspected.

## Limitations and assumptions

ps/top/pkill target common procps-ng behavior. ps defaults select effective-user/terminal processes and are affected by personality/environment. Advanced ps intentionally excludes combined PID/user selection to avoid additive OR semantics; top's filters are mutually exclusive in procps-ng. The column allowlist excludes arbitrary formats, header overrides, and duplicates. top permits at most 20 PID entries and a positive one-decimal interval subset. Update count works in interactive or batch mode; actual top configuration/secure mode can affect behavior.

PID/count fields use 1–2147483647, not an inspected system limit. Zero, negative/group targets, decimals, expressions, and blank added rows are excluded. Leading zeros normalize to decimal. No PID or username is verified, and PID reuse can change the target later.

Signal names are generated; displayed numbers assume common Linux architectures. kill can resolve to a shell builtin or an external utility. Signal delivery, permission, program response, and immediate termination are never guaranteed. SIGKILL prevents application cleanup, but kernel state may delay exit; SIGSTOP pauses rather than terminates. No automatic sudo or SIGKILL is used.

pkill patterns are extended regex, even with -x. Quoting protects the shell boundary, not the utility's regex meaning. The default name field is normally limited to 15 characters; -f widens matching to command lines and may include unexpected processes. -e still sends signals when manually run. The app neither evaluates regex nor predicts matches. pgrep is described as a manual review aid, subject to races; its builder is outside scope.

jobs targets the current Bash session, with only positive numeric %job specifications. Current/previous shorthand, names, fg/bg, and other shells are not implemented. Job IDs and PIDs are distinct, and -p prints process-group leader IDs. Non-interactive job-control behavior can vary.

This is one-browser verification, not a full accessibility or cross-browser audit. T08 is complete within scope; T09 was not started.

References: procps-ng [ps](https://man7.org/linux/man-pages/man1/ps.1.html), [top](https://man7.org/linux/man-pages/man1/top.1.html), [pkill](https://man7.org/linux/man-pages/man1/pgrep.1.html), and [Bash job-control builtins](https://www.gnu.org/software/bash/manual/html_node/Job-Control-Builtins.html).
