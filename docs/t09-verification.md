# T09: Linux services and logs verification

Verified on 21 October 2026. The initial working tree was clean. Existing command definitions, grouped forms, shell quoting, warnings, bilingual learning references, preview/reset/copy actions and persistence were reused. The catalog now contains 32 entries, including systemctl and journalctl in Linux Services & Logs. Package version, dependencies, deployment configuration and localStorage schema version 1 are unchanged.

## Executed checks

- `npm.cmd run typecheck`: passed.
- `npm.cmd test`: **931 tests passed across 30 files**.
- `npm.cmd run build`: passed. Vite generated static assets in `dist/` and emitted a non-blocking warning for the main JavaScript chunk: about 549 kB minified / 167 kB gzip. Code splitting remains a possible later optimization.
- `npm.cmd run dev -- --host 127.0.0.1`: started successfully.
- ESLint: not configured; no lint result is claimed.
- `git diff --check`: passed.
- Isolated Chromium: 102 main-run browser assertions and 5 focused final assertions passed (107 total), with no uncaught application exceptions in the main run. The focused assertions checked numeric status targets and default/all-boots behavior in follow mode. Desktop dark and mobile light screenshots were inspected.

All Linux command examples and previews were compared as text, never executed. Browser checks used temporary scripts and a dedicated profile, without adding a permanent E2E framework or accessing the user's browser data. No systemd manager, service state, credentials, or journal records were accessed.

## Coverage

- systemctl: all thirteen actions, required versus hidden unit fields, template instances, explicit suffix selection and duplicate-suffix rejection, listing types, inactive loaded units, enable --now, opt-in sudo, system/user scope, daemon-reload, hidden stale options, reset, and invalid shell-expression targets. Copy and pin actions are disabled for invalid output.
- journalctl: default command, user/system scope, quoted unit metadata filter, entry limits, follow, reverse/follow conflict, current/previous/custom boots, invalid offsets, priorities, structured time quoting, invalid dates/ranges, supported relative expressions, JSON/no-pager output and reset.
- Unit tests additionally cover action/choice allowlists, malformed types, integer bounds and normalization, root mount/leading-hyphen unit names, numeric status target disambiguation, maximum identifier length, all priority/output choices, leap dates, mixed/relative boundary limitations, and explicit all-boots versus implicit follow boot behavior.
- Registry additions cover membership/AND visibility, argument-linked option metadata, bilingual completeness, comparison labels, and the narrow opt-in sudo-prefix exception. Static rendering tests verify action-specific fields, empty-group hiding, collapsed advanced filters, bilingual learning tables, new sidebar labels, and invalid preview actions.
- Actual clipboard write/read for configured systemctl and journalctl commands.
- Both new favorites and configured pins persist after reload beside a seeded T08 background-command favorite/pin. Exact unpin and unfavorite work. Pure storage tests verify version-1 serialization, old text/preferences and duplicate-pin toggling without a migration.
- Language switching preserves command syntax; translated labels and concepts render. Theme/language restoration remains functional. All thirty earlier command workspaces rendered successfully in browser; the full unit suite exercises their generators and shared infrastructure.
- Mobile navigation and service generation work. No horizontal page overflow at widths 390px and 320px.

## Compatibility and limitations

The builders target Linux with systemd; not every distribution, container, installed version or policy supports the same environment. No unit, permissions, logs, manager availability, authentication or filesystem state is verified. Inspection actions may succeed without elevation, while system changes depend on policy. Sudo is never enabled by default or offered for user-manager mode. State-changing/downtime/privilege notes are bilingual and contextual.

Unit input is one literal ASCII identifier of at most 255 characters, including optional @instance syntax; glob patterns, paths and backslash-escaped names are deliberately outside scope. The type selector appends a suffix only when explicitly selected for an unsuffixed name, or filters a listing. A bare numeric status target is rejected to avoid systemctl's PID interpretation. Hidden incompatible inputs are ignored, following existing app conventions.

Journal default scope means all accessible journals; explicit --system and --user narrow sources. User-journal availability and old boot records depend on persistent logging/retention. Follow implies current boot unless explicitly overridden; --boot=all removes the restriction. Positive custom offsets count from the oldest stored boot, negative/zero from the newest. Counts/offsets are bounded builder subsets, not discovered system limits. Follow and reverse cannot combine.

Time input is either a calendar-validated local YYYY-MM-DD HH:mm:ss value or a documented small relative subset. Comparable structured bounds are ordered lexically after validation. Relative/mixed expressions, server clock/timezone, DST ambiguity and all other natural-language forms are not resolved by the browser. Logs may contain sensitive data.

Browser verification covers one Chromium environment, not comprehensive accessibility or cross-browser auditing. No T10 work was started.

## References

Semantics were checked against the upstream [systemctl manual](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html), [journalctl manual](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html), [systemd time documentation](https://www.freedesktop.org/software/systemd/man/latest/systemd.time.html), and [journalctl argument validation](https://github.com/systemd/systemd/blob/main/src/journal/journalctl.c).
