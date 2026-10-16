# T03 verification

Verified on 15 October 2026. Added cp, mv, and rm to the existing Files & Directories catalog without adding dependencies or changing storage schema version 1. The workspace has no `.git` directory, so inspection used the existing files rather than a Git diff.

## Executed checks

- `npm.cmd run typecheck`: passed.
- `npm.cmd test`: 163 tests passed across 8 files, including the existing T01/T02 regression suite.
- `npm.cmd run build`: passed; static output generated in `dist/`.
- `npm.cmd run dev -- --host 127.0.0.1`: started successfully.
- ESLint/lint: no lint script is configured.
- Isolated headless Chrome QA: 45 live-browser assertions passed, with no runtime exceptions.

Browser QA used an installed browser, a temporary profile, and a temporary script outside the repository. No testing framework or package dependency was added. Generated Linux commands were compared as text and never executed.

## Verified behavior

- cp: source/destination input, multiple sources, recursion/preservation, archive suppression of redundant flags, interactive/verbose output, update/no-clobber conflict feedback.
- mv: rename syntax, backup/no-clobber conflict feedback, force/update/verbose/backup combination.
- rm: default nonrecursive/non-force output, interactive-mode modeling, explicit recursive+force output, blocked root/current/parent/system/home targets, invalid copy/pin controls, and warning emphasis before previews.
- Unit tests additionally cover missing/blank operands, special characters/apostrophes, leading hyphens, no-clobber modes, lexical target equivalents, mixed target lists, and permitted specific targets without safety guarantees.
- Existing pwd/ls/cd/mkdir/touch generated previews exercised in the browser and covered by regression unit tests.
- Actual Clipboard API write/read for cp, mv, and rm generated text.
- Favorites and exact-text pins for all three commands, toggle/unpin without duplicates, and restoration after reload. Unit tests preserve older version-1 records alongside new records.
- Indonesian warning escalation and English explanations; language switching preserves command syntax. Dark/light themes and persisted language/theme preferences verified.
- Mobile navigation and no page-level horizontal overflow at 390px and 320px. Desktop dark warning layout and mobile light layout screenshots inspected.

The initial QA harness required a proper page-load wait and an await-parentheses correction; these were verification-script issues. The completed run passed all assertions without an application change for those issues.

## Safety limits

rm's checks are conservative lexical heuristics, not filesystem resolution. They cannot guarantee safety or identify every dangerous relative path, symlink, mount, home directory, or shell alias. They may also reject some literal filenames intentionally. No recursive/force mode is enabled automatically, and no execution action exists.

Transfer destination types, permissions, attribute preservation, update timestamps, and cross-filesystem behavior are not checked by the app. GNU/Linux assumptions and implementation differences are documented in README. See the official [cp](https://www.gnu.org/software/coreutils/manual/html_node/cp-invocation.html), [mv](https://www.gnu.org/software/coreutils/manual/html_node/mv-invocation.html), and [rm](https://www.gnu.org/software/coreutils/manual/html_node/rm-invocation.html) references.

This verifies one Chromium browser, not a comprehensive accessibility or cross-browser audit. T03 is complete within the requested scope. T04 was not started.
