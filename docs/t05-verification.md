# T05 verification

Verified on 15 October 2026. Added GNU find and grep under Searching, reusing command metadata, form controls, quoting, previews, themes, favorites, and pins. Storage remains schema version 1. No dependencies or backend were added. The workspace has no `.git` directory, so existing files were inspected directly rather than compared using Git.

## Executed checks

- `npm.cmd run typecheck`: passed.
- `npm.cmd test`: 264 tests passed across 12 files, including T01–T04 regressions.
- `npm.cmd run build`: passed; static assets generated in `dist/`.
- `npm.cmd run dev -- --host 127.0.0.1`: started successfully.
- ESLint/lint: not configured in the project.
- Isolated headless Chrome QA: 48 browser assertions passed, with no runtime exceptions.

Browser QA used the installed browser and a temporary profile/script outside the project. No permanent browser testing framework was installed. Generated Linux commands were compared as text and never executed.

## Coverage

- find defaults to a literal current-directory path. Filename globs stay quoted; type/case selections, empty matching, positive size values/units/comparisons, modification-age buckets, and min/max depth generate deterministic implicitly ANDed filters.
- Depth options precede tests. Expression-like starting paths such as -exec get a ./ prefix and are never turned into actions.
- Numeric filters reject invalid values and inconsistent depths. Disabled filters ignore stale inputs/choices. Form groups use declared order, so enable toggles appear before dependent controls; advanced groups start collapsed.
- grep uses explicit -e for the pattern, including a leading hyphen, then -- and literal target paths. Matching, recursion, and output modes are exclusive; numbers are omitted for filename/count output, and -w is omitted under -x.
- Unit tests cover spaces, apostrophes, special characters, quoted globs, all size units/comparisons, zero age/depth, invalid fields/modes, meaningful whitespace patterns, and bilingual group/validation metadata.
- All eleven previous command previews exercised in the browser, alongside find and grep.
- Actual clipboard write/read for both configured search commands.
- Favorites and exact command pins survive reload beside seeded old version-1 records. Pin toggling avoids duplicates; the pinned view displays both old and new entries.
- EN/ID grouped labels and explanations switch without changing generated syntax. Language/theme preferences restore after reload; both themes work.
- Searching category and mobile navigation work. No horizontal overflow at 390px or 320px. Desktop dark and mobile light screenshots inspected.

The initial test fixtures needed a TypeScript record annotation and removal of an incorrect assumption that every form has optional fields. Screenshot review also prompted a grouped-field ordering correction; all checks above were rerun successfully on the final source.

## Limits and assumptions

The browser never searches files or evaluates glob/regex matches. GNU grep can reject malformed regex when run manually; the app deliberately does not substitute JavaScript regex validation. Patterns are single-line, and target paths are literal rather than shell-glob expansions. No stdin pipeline, Boolean-expression builder, find action, redirection, or automatic sudo is supported.

find size tests use upward-rounded units and age tests use completed 24-hour periods. The app validates safe integer inputs, but installed utilities can impose narrower limits. Locale, permissions, symlink traversal, binary files, platform versions, and actual filesystem state can affect results. Static generation does not verify any of those conditions.

References: GNU find [starting points](https://www.gnu.org/software/findutils/manual/html_node/find_html/Starting-points.html), [size](https://www.gnu.org/software/findutils/manual/html_node/find_html/Size.html), [age ranges](https://www.gnu.org/software/findutils/manual/html_node/find_html/Age-Ranges.html), and [GNU grep usage](https://www.gnu.org/software/grep/manual/html_node/Usage.html).

This is one-browser verification, not a full accessibility or cross-browser audit. T05 is complete within the requested scope. T06 was not started.
