# T10: shell operators, pipes and redirection verification

Verified on 6 November 2026. The working tree initially contained the completed, uncommitted T09 implementation. That work was preserved; the application was not recreated. T10 adds four shell-operator features under the existing `pipes` category, now labeled Shell Operators & Redirection. The catalog contains 36 entries. Dependencies, package version, deployment configuration and localStorage schema version 1 are unchanged. No commit or push was performed.

## Executed checks

- `npm.cmd run typecheck`: passed.
- `npm.cmd test`: **1,021 tests passed across 33 files**, including earlier command families and the existing background builder.
- `npm.cmd run build`: passed; static output generated in `dist/`. Vite emitted a non-blocking main JavaScript chunk warning at approximately 576.5 kB minified / 175.5 kB gzip. Code splitting remains a possible later optimization.
- `npm.cmd run dev -- --host 127.0.0.1`: started successfully.
- `git diff --check`: passed.
- ESLint: not configured; no lint result is claimed.
- Isolated headless Chromium: **96 assertions passed**, with no uncaught application exceptions in the completed run. Desktop dark and mobile light screenshots were inspected.

Browser checks used temporary scripts and a separate profile, without adding an E2E framework or reading the user's browser data. Generated Linux commands were only compared or copied as text. The app and command tests never executed those commands, opened target files, inspected processes or retrieved logs.

## Coverage

- Four discoverable operator features, with no executable registered under an operator character. Initial invalid configurations disable copy/pin. Pipelines start with two empty stages; addition stops at four and removal stops at two.
- Two-, three- and four-stage composition; add/remove/reorder retains entire stage configuration. Existing ps BSD generation and ls flag controls are reused through nested forms. Repeated catalog forms have unique IDs and associated labels/hints.
- Literal stdin-consuming grep/less stages work without adding misleading placeholder file operands. Standalone catalog validators remain unchanged. Literal paths with spaces/apostrophes, deliberate empty arguments, operator-like argument values, leading hyphens, substitution-like text and control characters are covered by unit tests.
- Stdout overwrite/append, stdin input, stderr overwrite/append, target-free descriptor duplication, and combined stdout-file/duplication in either order. Combined append preserves the selected order. Actual > and 2> records show bilingual overwrite warnings; append and operator-like argument text do not incorrectly trigger them.
- Strict structural validation rejects raw text, malformed stages, extra fields, unknown nested commands/operators, unsupported combinations, invalid stage counts and missing/control-character target paths. The existing preview length limit still applies. A final regression test verifies that oversized catalog generation fails the whole composition rather than silently inserting an empty stage.
- Actual clipboard write/read for a pipeline, stdout redirection, stdin redirection and ordered stderr duplication.
- All four favorites and complete configured command pins survive reload beside a seeded T09 journalctl favorite/pin. Exact unpin, repin and unfavorite work. Storage tests independently verify version-1 roundtrips and duplicate toggles without replacing older text or preferences.
- EN/ID controls, concepts and overwrite warnings render; switching language preserves Linux syntax. A visual explains command A -> stdout -> pipe -> stdin -> command B, with stderr separate. Examples distinguish useful pipelines from unnecessary cat-to-grep composition and explain descriptor ordering.
- Light/dark themes and preference restoration remain functional. All 32 earlier workspaces rendered in browser, including systemctl/journalctl; background output remains `'sleep' '120' &`. Their generators remain covered by the full unit suite.
- Mobile navigation and combined redirection generation work. No horizontal page overflow at 390px or 320px; Indonesian pipeline controls also fit. Screenshot inspection covers desktop pipeline and mobile redirection layouts.

## Architecture and limitations

`CommandStage` distinguishes literal executable/arguments from an allowlisted catalog command and primitive configuration. `ShellComposition` contains stages and ordered `ShellRedirection` records. The serializer quotes literal tokens once and emits only selected constant operators as syntax. Existing catalog output is reused without parsing or re-quoting it, and generator errors propagate. These objects stay in React state; pins store full generated text under existing stable IDs.

T10 permits 2-4 pipeline stages without redirections, or one-command redirection builders. Stdout accepts > / >>, stdin <, and stderr 2> / 2>> / 2>&1 or stdout > / >> plus 2>&1 in either order. It does not attach redirects to pipeline stages, accept arbitrary descriptor graphs, nest compositions, or add background/chaining combinations.

Reusable catalog forms are pwd, ls, ps, cat, grep and less. Their original validation applies; grep/less file-oriented catalog forms still need a filename. A literal executable/argument stage is the explicit alternative for stdin-only use and for programs such as sort/wc/echo that have no full catalog builder. Literal argument option semantics are not validated. No executable, file existence/type, permissions, program behavior or shell configuration is checked.

Executable input reuses the restricted background validator: common names or explicit absolute/./../ paths, with spaces/apostrophes supported in paths. No raw shell script is parsed. User arguments and target paths remain literal, including variables, wildcards and operator characters. Zero literal argument rows means none; an added empty row is an intentional empty token. The existing background empty-row behavior remains unchanged.

Redirections apply left to right; 2>&1 duplicates stdout's destination at that point. A pipe carries stdout, not stderr, and commands that ignore stdin do not consume pipe data. Running copied commands manually can create/truncate files even if the command later fails. Quoting does not make arbitrary programs or interpreter arguments safe, and shell settings such as noclobber affect behavior. There is no execution, filesystem access, terminal emulator, full Bash parser, expansion, chaining, substitution, backend or database.

Browser verification covers one Chromium environment, not comprehensive accessibility or cross-browser auditing. No later task was started.

## References

Semantics follow the official [Bash pipeline reference](https://www.gnu.org/software/bash/manual/html_node/Pipelines.html) and [Bash redirection reference](https://www.gnu.org/software/bash/manual/html_node/Redirections.html).
