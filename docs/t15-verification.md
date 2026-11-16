# T15 verification

Checked on 2026-11-16 in the existing React/Vite workspace.

| Check | Result |
|---|---|
| `npm.cmd run typecheck` | Passed |
| `npm.cmd test` | Passed: 1,335 tests across 48 files |
| `npm.cmd run build` | Passed: static Vite build |
| `git diff --check` | Passed |
| ESLint | Not configured in `package.json` |
| Live browser | Not run in T15 |

T15 adds 94 tests for the six monitoring builders, registry metadata, both-language form rendering, lsblk column selection, numeric and path validation, option conflicts, exact-text pin persistence, favorite persistence and compatibility with older saved data. The full regression suite includes previous builders, localization, storage, copy controls and theme behavior. Tests compare generated text; generated monitoring commands are never executed.

The existing empty `system` category is reused and relabeled System Monitoring & Disk Usage. No storage migration is needed: version-1 favorites hold stable command IDs and pins hold exact text. The UI adds only one small controlled checkbox editor for lsblk columns.

## Compatibility and limits

- Targets procps-ng free/uptime, GNU coreutils df/du/uname and util-linux lsblk on Linux. Other implementations and older versions may differ, especially lsblk MOUNTPOINTS.
- free report counts require a refresh interval. Unit modes are exclusive.
- du summary permits only zero or blank depth and omits redundant depth flags. Summary hides the incompatible file-entry option. Depth limits reporting, not necessarily traversal needed to calculate totals.
- lsblk custom columns use a fixed allowlist and order; -l flattens JSON as well as text output. Optional device inputs accept literal paths under /dev/ without traversal segments. Existence is never verified.
- Copy, themes and preferences reuse tested shared components; actual clipboard access, live browser interaction, responsive layout and visual appearance were not checked in T15.
- Vite reports a non-failing JavaScript chunk-size warning above 500 kB. No dependency, backend, database, system inspection, commit, push, tag or release was added.

Command behavior was checked against the [procps-ng free](https://man7.org/linux/man-pages/man1/free.1.html), [uptime](https://man7.org/linux/man-pages/man1/uptime.1.html), [GNU coreutils](https://www.gnu.org/software/coreutils/manual/coreutils.html), and [util-linux lsblk](https://man7.org/linux/man-pages/man8/lsblk.8.html) references.
