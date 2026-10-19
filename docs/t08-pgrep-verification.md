# T08 extension: pgrep verification

Verified on 19 October 2026. Added pgrep to Process Management as a focused T08 extension. The working tree was clean before changes. Existing user/deployment work, package version, dependencies, and localStorage schema version 1 are preserved. There are now 27 executable builders and six process builders.

## Executed checks

- `npm.cmd run typecheck`: passed.
- `npm.cmd test`: 673 tests passed across 24 files, including Process Management and earlier command regressions.
- `npm.cmd run build`: passed; static output generated in dist/.
- `npm.cmd run dev -- --host 127.0.0.1`: started successfully.
- ESLint/lint: not configured.
- Isolated headless Chrome: 37 assertions passed, with no runtime exceptions.

The browser run used a temporary profile/script, not the user's browser data, and compared generated text without executing it. No OS processes were inspected by the app or command tests. No permanent browser E2E framework was added.

## Coverage

- PID-only, name, full-command, and count output; full command-line matching distinct from full-command output; exact and case-insensitive regex controls; newest/oldest selection.
- Effective user, real user, combined user criteria, and parent-PID selection without a pattern; zero/negative PID and invalid username rejection. Unit tests cover numeric bounds, all missing-criterion cases, conflicting raw flags/modes, malformed types, and whitespace/control input.
- Pattern strings with spaces, apostrophes, leading hyphens, regex syntax, and substitution-like characters remain one literal shell operand. Invalid GNU regex syntax is not evaluated or falsely validated using JavaScript regex.
- Actual clipboard write/read for both a quoted pattern and `pgrep -P 1234`.
- Bilingual grouped labels, conditional-criteria guidance, examples, comparison table, and shared concepts. Advanced selection starts collapsed. Language changes preserve generated syntax.
- Favorite and two configured pgrep pins survive reload beside a seeded T08 pkill favorite/pin. Exact unpin/repin avoids duplicates. Unit persistence tests verify old text and schema compatibility.
- The five existing Process Management builders exercised in browser previews, including unchanged pkill generation after shared metadata extraction. The full unit suite covers other command regressions.
- Themes, language/theme restoration, six-entry process category, and no horizontal overflow at widths 390px and 320px. Desktop dark and mobile light screenshots inspected; the comparison table wraps correctly.

Three heterogeneous test-fixture arrays needed explicit CommandInputs types before the final passing TypeScript/build checks. This did not require application validation changes.

## Limits

This builder targets procps-ng. Names typically use a 15-character process-name field; -f matches the command line. -x still uses extended regex. -a changes output only. Newest/oldest selection uses start time and can be ambiguous within a clock tick; count reflects selected matches. Different user/parent/pattern criteria combine with AND.

Pattern omission is supported only with a user or parent-PID filter in this builder; matching/output/newest/oldest flags alone are insufficient. Parent PID is one positive decimal integer up to 2147483647 and selects immediate children, not all descendants. Only common account names are accepted, without numeric IDs or lists. No account, PID, regex validity, or matching result is verified.

The comparison explains that pgrep lists matches while pkill sends signals when run manually. Reviewing matches first is useful but is subject to races and PID reuse, not a safety guarantee. The app never executes either command or accesses real process state. Full-command output may expose sensitive arguments in a real terminal.

No new release, backend, framework, dependency, command execution, or additional process command was introduced. This is one-browser verification, not a full cross-browser or accessibility audit. The pgrep extension is complete; no later task was started.

References: upstream [procps-ng manual](https://man7.org/linux/man-pages/man1/pgrep.1.html) and [pgrep implementation](https://gitlab.com/procps-ng/procps/-/blob/master/src/pgrep.c).
