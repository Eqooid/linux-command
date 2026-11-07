# T11: ownership and advanced process tools verification

Verified on 7 November 2026. The working tree initially contained uncommitted T09/T10 work, which was preserved. Neither chgrp nor htop was already implemented. Both were added through existing registry, grouped forms, quoting, warnings, bilingual learning and persistence patterns. The catalog now contains 38 entries. Dependencies, package version, deployment configuration and localStorage schema version 1 remain unchanged. No commit, push, tag or release was performed.

## Executed checks

- `npm.cmd run typecheck`: passed.
- `npm.cmd test`: **1,125 tests passed across 36 files**.
- `npm.cmd run build`: passed; static output generated in `dist/`. Vite emitted a non-blocking main JavaScript chunk warning around 597.6 kB minified / 181.8 kB gzip. Code splitting remains a possible later optimization.
- `npm.cmd run dev -- --host 127.0.0.1`: started successfully.
- `git diff --check`: passed.
- ESLint: not configured; no lint result is claimed.
- Isolated headless Chromium: **100 assertions passed**, without uncaught application exceptions. Desktop dark and mobile light screenshots were inspected.

The app and command tests never ran generated commands, inspected real processes, opened ownership targets, read account databases, or performed installation. Browser checks used a temporary dedicated profile/scripts without adding an E2E dependency or using the user's browser data.

## Coverage

- chgrp: empty required fields, direct names, GID zero/normalization/disambiguation, invalid GIDs/names, repeated targets, spaces/apostrophes/leading hyphens, recursion, exclusive verbose/changes reporting, opt-in sudo, reference switching and quoting, hidden stale field handling, and privilege/recursive warnings in both languages.
- htop: exact default output, username filters, comma-separated PIDs, removal of accidental empty entries, combined user/PID filters, positive PID validation, tenths delay and range checks, all three sort keys, tree/read-only flags, reset, and deterministic combined syntax.
- Unit tests additionally cover numeric boundaries, reserved GIDs, malformed types, unknown/conflicting raw fields, missing targets, control characters, safe quoting, the shared lone-hyphen target convention, complete localization, comparison metadata, all required htop shortcuts and documentation-only installation guidance.
- Static form tests cover direct/reference visibility, exclusive reporting, repeated targets, one comma-list PID input, translated controls, default preview availability, disabled invalid actions and absence of password inputs. The existing shortcut and comparison tables are reused.
- Actual clipboard write/read for a configured reference-based chgrp command and combined htop command.
- Both new favorites and fully configured pins survive reload beside a seeded T10 stderr-ordering favorite/pin. Old syntax, preferences and version remain intact. Exact unpin/repin and unfavorite work. Pure storage tests independently verify serialization and duplicate toggles.
- EN/ID switching preserves command syntax; translated labels, warnings and shortcut descriptions render. Light/dark themes and preference restoration work. All 36 prior workspaces render successfully in browser; the full unit suite covers earlier generators including chmod/chown, ps/top/pgrep/pkill, background execution and shell composition.
- Mobile navigation works. chgrp has no horizontal page overflow at 390px or 320px; htop generates correctly at 320px, including Indonesian labels.

## Compatibility and limitations

chgrp targets GNU/Linux behavior. Names use the existing common account-name subset rather than every NSS/domain naming scheme. Numeric GIDs accept decimal digits from 0 to 4294967294; the all-ones sentinel is excluded. This is a documented builder subset, not a discovered host limit. Leading zeroes normalize and GNU +GID forces numeric interpretation. Reference mode copies the reference file's group when run manually; direct group values are omitted in that mode. Actual groups, memberships, permissions, files and symlink behavior are not inspected. Recursive changes can disrupt system directories and applications, and changing a shared project's group does not grant write permission automatically. Sudo is explicit and defaults off.

htop behavior varies by version, platform, terminal and saved configuration. The builder uses PID/PERCENT_CPU/PERCENT_MEM as conservative documented sort keys and delays 1-100 in tenths of a second, avoiding upstream clamping. PIDs use the existing positive 1-2147483647 subset; zero/negative/malformed entries are rejected. Empty entries around valid comma-list values are dropped, while a nonempty comma-only list is invalid. Usernames are common names only, without numeric UIDs/domain forms. User and PID filters can combine; no process existence, identity or visibility is verified.

Read-only mode restricts process/system-changing actions inside supported htop versions; it is not a security sandbox. F9 and other process-changing actions can interrupt applications when permitted. Shortcut and tree/sort details vary. htop may need separate installation; `sudo apt install htop` is an Ubuntu educational example only, never an app action. No monitor, metrics, terminal or process list is simulated.

No new React architecture, backend, database, authentication or runtime execution layer was introduced. Browser verification covers one Chromium environment, not comprehensive accessibility/cross-browser auditing. T12 was not started.

## References

Semantics were checked against [GNU chgrp](https://www.gnu.org/software/coreutils/manual/html_node/chgrp-invocation.html), [GNU name/ID disambiguation](https://www.gnu.org/software/coreutils/manual/coreutils.html#Disambiguating-names-and-IDs), the [upstream htop manual](https://github.com/htop-dev/htop/blob/main/htop.1.in) and [htop option parsing](https://github.com/htop-dev/htop/blob/main/CommandLine.c).
