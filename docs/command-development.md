# Add a command

Keep command content separate from React. Verify syntax against the command's official manual and identify the shell/implementation being targeted. Never execute generated text inside the app.

1. **Define it.** Create `src/commands/definitions/<id>.ts` with a `CommandDefinition`, then re-export it from `definitions.ts`. Include a stable lowercase ID, category, bilingual description/explanation, syntax, options, arguments, examples, and notes.
2. **Describe the inputs.** Independent flags use `options`. Mutually exclusive modes use `choices` with translated item labels and a default. Link option flags to a choice using `choice: { field, value }`; the UI will render a single select instead of independent checkboxes. Arguments can use `multiple: true` for separate literal-path rows, `when: { field, value }` for conditional visibility/validation, and `format: 'permissions' | 'timestamp'` when appropriate. Options also support `when`; cp uses it to hide redundant recursive/preserve controls during archive mode. Hidden options are ignored by both validation and generation.
3. **Write a builder.** Add its function under the stable ID in `generation.ts`. `initialInputs` derives defaults from metadata; `selectedFlags` reads active flags in definition order. Keep operand ordering and value-taking options explicit for each command. Do not build shell text by interpolating the documentation syntax.
4. **Validate it.** `validation.ts` checks input types, known choices, required active fields, and control characters. Extend it with focused command-specific checks when needed. `isInputVisible` is shared with React, so stale hidden fields are ignored. Unknown/conflicting raw flags are rejected; return bilingual errors with null command text on invalid input.
5. **Test and register.** Test defaults, option combinations, conflicts, missing/invalid inputs, spaces, quotes, and leading hyphens. Register the definition in `registry.ts` only after generation works. Registry validation checks IDs, translations, flags (including numeric `-1`), choice defaults, and conditional links. Never list an unimplemented builder as functional.
6. **Review and document.** Check both languages/themes, copy, reset, favorite, and pin interactions. Run `npm run typecheck`, `npm test`, and `npm run build`. Update README and the roadmap.

## Small metadata example

```ts
// Inside a CommandDefinition:
choices: [{
  id: 'mode',
  label: { en: 'Path mode', id: 'Mode jalur' },
  description: { en: 'Select one mode.', id: 'Pilih satu mode.' },
  defaultValue: 'default',
  items: [
    { value: 'default', label: { en: 'Default', id: 'Bawaan' } },
    { value: 'physical', label: { en: 'Physical (-P)', id: 'Fisik (-P)' } },
  ],
}],
options: [{
  id: 'physical', flag: '-P',
  choice: { field: 'mode', value: 'physical' },
  label: { en: 'Physical', id: 'Fisik' },
  description: { en: 'Resolve symbolic links.', id: 'Selesaikan tautan simbolis.' },
}],
```

Follow `pwd` for choices, `ls` for multiple option groups, `cd` for trusted presets, `mkdir` for repeated operands and conditional permissions, and `touch` for mutually exclusive argument sources. Definitions supply the learning panel automatically; no command-name switch belongs in React.

For file transfers, follow cp/mv: a repeated `sources` argument, required `destination`, and one overwrite choice. Their `buildTransfer` helper serializes source operands in row order and the destination last. Shared quoting and selected-flag functions remain small; each other command retains its own builder. Multiple sources need a destination directory, but do not attempt filesystem validation.

`fileManagement.ts` checks cp/mv update+no-clobber and mv backup+no-clobber conflicts after generic input validation succeeds. Add focused tests for any future command-specific rules. Archive mode omits redundant flags instead of producing `-a -r -p`.

## Destructive-command notes

Definitions store always-visible bilingual notes. `getCommandWarnings` adds contextual notes for multiple sources, force overwrite, recursive removal, and recursive+force removal. It returns text plus a `note`, `warning`, or `danger` level; `CommandWarnings` renders the selected language before the preview using monochrome borders/emphasis. Keep command logic out of React.

rm's lexical normalizer is used only to reject obvious dangerous paths, not to change output or prove safety. Root/current/parent targets are blocked in all modes; recursion adds conservative system/home rules. Symlinks, mounts, actual home directories, and the current filesystem remain unknown. Never add recursive/force flags by default or offer execution. Test allowed specific targets, blocked equivalents, mixed target lists, warning escalation, both languages, and invalid copy/pin behavior.

## Quoting and safety

`quoteShellArgument` surrounds a value with POSIX single quotes. An apostrophe closes the quote, emits a quoted apostrophe, and reopens it: `user's notes` becomes `'user'"'"'s notes'`. These adjacent pieces form one shell argument. Quoting prevents expansion of `$`, backticks, spaces, and wildcards; it does not neutralize special meanings a utility gives its operands.

`quotePathArgument` additionally normalizes a lone `-` to `./-`. Use `--` only where the target command supports it. Value-taking options such as touch `-r` keep their operand immediately after the flag and quote it. Octal modes and timestamps are emitted unquoted only after their strict numeric validation succeeds.

Trusted cd presets are deliberately separate from literal custom paths. The home-relative preset emits `~/` plus a quoted suffix, preserving only the intended tilde expansion. Never treat arbitrary input as an expression, expand wildcards, add `sudo`, or verify by executing text.

Current timestamps intentionally support only `CCYYMMDDhhmm[.ss]` with real calendar dates and seconds 00–59. Permission input supports only 3/4-digit octal modes. Broader formats need deliberate UI, validation, docs, and tests.

Storage stays version 1; adding a command requires no schema change because favorites use IDs and pins use exact text. Preserve old records. Add an explicit migration if a future task changes the schema.

## Adding search commands

Follow find for ordered expressions and grep for flags plus an explicit pattern operand. find's `buildFindCommand` emits only whitelisted predicates in a fixed sequence, with global depth options before tests. Do not run its expressions through the ordinary flag assembler or add actions such as -exec/-delete. `quoteFindStartingPath` prefixes ambiguous leading characters with `./`; a generic `--` is not a reliable starting-point delimiter for find. Globs remain single-quoted for find itself to interpret.

grep reuses `selectedFlags`, then emits `-e` with a shell-quoted pattern and `--` with literal target paths. Matching, recursion, and output modes are metadata choices. Conditional flags omit irrelevant `-n` and redundant `-w`. Do not infer regex syntax from the pattern or evaluate GNU expressions using JavaScript regex. Tests compare strings, not search results.

Grouped forms keep advanced fields manageable without a query-builder framework:

```ts
form: {
  kind: 'grouped',
  groups: [{
    id: 'location',
    title: { en: 'Search location', id: 'Lokasi pencarian' },
    fields: ['start'],
  }, {
    id: 'advanced',
    title: { en: 'Advanced filters', id: 'Filter lanjutan' },
    fields: ['useSize', 'sizeComparison', 'sizeUnit', 'size'],
    advanced: true,
  }],
},
```

Each rendered field (choice, unlinked checkbox, or argument) must appear exactly once. Flag entries linked to choices do not get their own controls. Registry validation checks group coverage and translated headings. `CommandForm` reuses the same field renderer for basic forms and groups; advanced groups use native accessible details/summary disclosure controls.

Choices support `when` just like options and arguments. Disabled numeric filters ignore stale values and choices. Arguments may specify `defaultValue` (find starts at `.`) or `allowWhitespace` (grep's required pattern can be a literal space). Other required fields retain their existing nonblank validation. `search.ts` validates enabled numeric inputs and min/max relationships after general type/choice validation succeeds. New commands still use definitions, builders, validators, focused tests, and the existing version-1 saved-command storage.

## Process patterns (T08)

The pgrep extension reuses signal-independent `processMatchingOptions` from `processLearning.ts` (also used by pkill), common user-name metadata/validation, and positive process-integer validation. Its full/name matching choice links -f to a select; exact and case modes remain independent booleans. Grouped forms organize matching, effective/real user and parent filters, output, and start-time selection. Keep output -a distinct from matching -f; output modes (-l/-a/-c) and newest/oldest (-n/-o) are exclusive choices.

`validatePgrepInputs` requires a nonblank pattern unless a user or parent PID is supplied, validates each provided filter, and rejects whitespace-only patterns even with another filter. It does not reuse pkill's always-required pattern or add signal fields. `buildPgrep` serializes user/parent options and only appends -- plus a quoted pattern when a pattern exists. Never append an empty regex to represent omission. Different supplied criteria use AND. GNU regex validity, account existence, matching results, and start-time ties remain outside static validation.

Optional `comparison` metadata supplies `{ command, description }` rows for `CommandComparison`, a small shared Card/table with translated headers. Registry validation covers description translations, command names, and unique rows. This makes the ps/pgrep/kill/pkill comparison educational data rather than a command-specific React branch. See `pgrep.test.ts`, `PgrepForms.test.ts`, and `pgrepPersistence.test.ts` for focused extension coverage alongside existing process regressions. No new phase, storage migration, dependency, or package version is introduced.

Follow `ps.ts` for a single preset choice: the fixed map in `processes.ts` keeps BSD aux distinct from Unix flags. Advanced input fields are conditional on that mode, so stale PID/user/column values do not leak into presets. Advanced ps excludes simultaneous PID/user selectors because procps-ng normally combines them with OR; top actually requires those filters to be exclusive. Do not impose one generic filtering model on both commands.

Reuse `processPidArgument` for labeled PID rows and `processUserArgument` for common effective-user names. Optional PID rows use one empty default row to mean no filter; added rows must be filled. Validation accepts positive decimal integers up to signed 32-bit maximum and normalizes leading zeros when serializing. Never query a PID, inspect an account, or assume a target exists. top adds the documented 20-entry limit, a positive one-decimal refresh subset, and a positive update count. Numeric tokens are emitted unquoted only after validation; literal usernames/patterns use the existing quoting utility.

`signals` is the single shared list of allowed names, common Linux numbers, and bilingual descriptions. `signalChoice` and linked `signalOptions` supply kill/pkill controls and flag selection; TERM is the default and KILL is never automatic. Generate names, not architecture-dependent numbers. kill accepts only explicit positive PIDs. pkill quotes a single extended-regex argument after -- and leaves its interpretation to procps-ng; do not use JavaScript regex as a compatibility validator. -x changes match extent, not regex syntax; -e is not a dry run. -f and SIGKILL trigger contextual warnings in `warnings.ts`, independent of whether the current input is valid. No generated command is executed in tests.

jobs uses separate display and state choices, preventing -r/-s and -l/-p conflicts. It accepts only numeric %job specifications and quotes them as literal shell arguments; Bash still interprets their job-spec meaning. Explain that a fresh shell has a different job table. Do not replace job IDs with PIDs or infer actual job state. The fg/bg extension shares its own constrained job-selection builder.

The optional `concepts` metadata is an array of bilingual `{ term, description }` entries. Process definitions reference `processConcepts` from `processLearning.ts`; `LearningConcepts` renders a collapsed semantic definition list using the existing Card. Registry checks include translations and unique nonempty concept sets. New educational content can reuse this without adding command-specific rendering branches. top reuses existing `shortcuts` metadata/table; references to k/r remain text and never bind browser actions.

Add tests for presets, optional fields, numeric bounds, filter conflicts, literal patterns, shared signals, conditional warnings, concepts/shortcuts, and saved records beside older pins. Run `npm run typecheck`, `npm test`, and `npm run build`; lint is not currently configured. Keep process matching/monitoring, signals, OS access, and metrics simulation out of the browser.

## Privilege and access patterns (T07)

The four definitions remain under Users & Permissions. Reuse `accessFields.ts` for the identical chmod/chown reporting choices, recursion/error options, and repeated path argument. Independent options remain booleans; linked flags remain exclusive selects. `privilegeCommandArguments(mode)` supplies conditional executable and literal-argument rows for sudo/su. A multiple argument's `defaultValue`, if present, now initializes its first row (chmod uses u+x).

For value-taking flags, keep operand construction explicit. `privileges.ts` builds sudo's mutually exclusive modes, with explicit -u user and optional -g group except standalone -k. It validates a deliberately small executable-token subset. Argument rows are literal tokens, not a whitespace-split command line. sudo uses direct argument serialization after --. Shell modes do not accept commands. Only the sudo builder adds sudo; never wrap another definition automatically.

su command mode explicitly selects /bin/sh, then `serializeInnerCommand` quotes the executable and each literal argument. `buildSu` quotes that entire string again as the outer -c argument. These are two distinct parsing boundaries. Do not pass a raw command string, expand expressions, or use ordinary outer quoting alone for nested shell code. The command path/arguments may still invoke dangerous programs; do not describe quoting as privilege safety. Account restrictions can ignore su's requested shell. Login mode omits stale -m because util-linux ignores preservation in login mode.

`CommandArgument.editor` optionally selects numeric-permissions or symbolic-permissions from a small component map inside the shared field renderer. Other fields keep their original UI. Registry validation checks the editor's scalar/array shape. The numeric argument is a three-digit string; checkboxes derive their checked state from it and update it through pure `togglePermission`. `PermissionVisualization` uses `numericPermissionRows` and is reusable without filesystem state. Invalid input is kept visible, not silently corrected.

The symbolic argument stores an array of canonical clauses such as ['u=rw', 'g=r', 'o=']. `SymbolicPermissionEditor` offers class/operator/permission controls and preserves row order. `parseSymbolicClause` validates the supported subset; its allowIncomplete parameter is only for rendering intermediate edits. Generation uses strict validation, then joins clauses with commas. Do not claim to calculate a final mode from unknown file permissions. No special bits, X, copy-permissions syntax, or ACLs are implied.

`ownershipSpec` handles owner-only, group-only, and both fields. Validate at least one common name per enabled pair before constructing the operand. The --from pair follows the same rule. Owner-only dotted names are rejected to avoid GNU's fallback owner.group interpretation; explicit colons disambiguate pairs. The chown builder in `generation.ts` emits --from= plus a quoted value before --, then a quoted ownership operand and quoted paths. Never add a trailing colon or assume accounts exist.

`warnings.ts` gives sudo/su persistent privilege warnings and chmod/chown recursive warnings. Permission helpers detect world-write grants and unusually broad 777/a+rwx/a=rwx requests. Symbolic warnings conservatively consider any granting clause rather than simulating filesystem permissions. Keep warnings bilingual and before the preview. Tests cover numeric arithmetic, both nested quote layers, invalid combinations, literal paths, rendered editors, and version-1 persistence beside older commands. Generated text is never executed during verification.

## Help and identity patterns (T06)

Follow `man.ts` for an exclusive lookup choice and a numbered-section choice. Its builder emits selected flags, optional `-s N`, `--`, and one shell-quoted topic. This explicit section flag avoids confusing the topic with a positional section. The validator rejects numeric-only topics. `-k` still uses the utility's regex semantics; quoting only prevents shell interpretation. Pager `-P` is not interactive because it starts an external program using a separately parsed command string. Do not substitute a shell-composition engine.

Follow `id.ts` for modifiers that are valid in multiple selected modes. `when: { field: 'output', value: 'all', not: true }` means “visible when output is not all.” This small extension uses the same `isInputVisible` check in forms, validation, and flag selection. Changing back to full output omits stale hidden modifiers. Choice-linked -u/-g/-G flags remain exclusive; do not create independent checkboxes for them. GNU id accepts -n/-r/-z with these selected modes and rejects them in default output. Keep implementation-specific compatibility in the metadata and focused tests.

Optional repeated usernames follow `groups.ts`: a single empty row is current-process mode; blank added rows are invalid. `helpIdentity.ts` validates common account names, without querying users. Use `quoteShellArgument`, not `quotePathArgument`: account names are not filesystem paths. Optional `addLabel` and `removeLabel` override repeat-row button text for non-path arguments, with registry-checked bilingual translations.

`help.ts` and `HelpUtility.tsx` generate the option `--help` separately from executable definitions. Its known target list does not mean every full command builder exists. Custom targets are restricted to one executable token and reject known shell words; they are never checked or executed. Add a target only after verifying that implementation's help convention. Do not register `--help` as an executable, assume builtins share GNU help conventions, or reset storage to add a command. The utility reuses CopyButton; executable builders continue to reuse favorites, pins, and schema version 1.

For new educational references, reuse the existing `shortcuts` metadata/table. man describes common less keys and explains that the actual pager may differ. `whoami` shows how a zero-input command uses the same workspace with an empty-form message. All content remains bilingual; tests cover generations, invalid combinations, conditional controls, references, and persistence beside older pins.

## Reading/editing and educational shortcuts

Follow cat for repeated file operands and mutually exclusive numbering. Conditional `when` metadata hides and omits `-E`/`-T` under `-A`. Follow less for a single required path, search-case choice, and a trusted `+G` metadata flag. The registry accepts `+G` explicitly; do not widen it to arbitrary startup expressions. nano shows an optional file argument with no delimiter or operand when empty.

For less/nano paths, use `quoteInteractiveFileArgument`: it reuses literal shell quoting and adds `./` to leading-plus names and a standalone `--`; the common path helper already protects `-` as `./-`. The prefix changes only operand interpretation, not which relative file is named. Shell quoting and a tool's own operand rules are separate concerns.

Add optional `shortcuts` to a definition to render a shared reference table. Keep key names as literal text, and provide bilingual context and action descriptions:

```ts
shortcuts: {
  description: {
    en: 'Use these keys inside the terminal program.',
    id: 'Gunakan tombol ini di dalam program terminal.',
  },
  items: [{
    keys: 'q',
    description: { en: 'Quit', id: 'Keluar' },
  }],
},
```

`KeyboardShortcuts` composes an existing shadcn Card with a semantic table. `localize` chooses descriptions; keys stay unchanged. Registry validation checks both languages, non-empty unique keys, and non-empty references. Test metadata, rendered headers/actions in both languages, special filenames, flags, and persistence. Do not add keyboard handlers, fake file contents, or an editor simulation for a reference table.

## Shell operators and Bash job control (T08 extension)

Follow `definitions/jobControl.ts` and `jobControl.ts` for a constrained shell feature:

1. Give each entry a stable ID. `background` uses `name: "command &"` and `kind: "shell-operator"`; fg/bg use `kind: "builtin"`. Existing definitions may omit kind. Do not register `&` as an executable. Registry validation permits this one explicit operator label without accepting arbitrary shell grammar.
2. Describe inputs using existing basic forms: background has a required executable and repeated optional argument rows; fg/bg have a single selection choice and a conditionally required number. The small `jobBuiltin` definition factory avoids duplicated fields and examples.
3. Validate executable names with the existing restricted helper. The background-only path extension permits spaces/apostrophes in explicit absolute, `./` or `../` paths; keep scripts, substitutions and operators excluded. It does not change sudo/su validation. Reuse generic control-character/type checks and `literalCommandArguments`' empty-row convention.
4. Quote each user token with `quoteShellArgument`, then append a constant ` &`. Never pass the final operator through the literal argument serializer. A user argument `&` stays quoted and is distinct from the final control operator. Do not add pipelines or shell parsing.
5. Route fg/bg through `buildJobControl` and `validateJobControlInputs`: current emits no operand, explicit current emits `%+`, previous emits `%-`, and a validated positive integer emits `%N`. Reuse the existing integer validator; normalize leading zeroes only after validation. These are trusted job-spec tokens, not discovered PIDs. Hidden stale number input is ignored outside numbered mode.
6. Add the definitions to the existing exports, registry and builder map. Include bilingual explanations, `jobLearning.ts` concepts/shortcuts/workflows, tests and documentation. Shared UI automatically provides preview, reset, clipboard, favorite and pin controls. Stable IDs and single-line generated text work with schema version 1; no migration is needed.

Job-control examples with multiple lines are instructional sequences only. The `# Ctrl + Z` line describes a terminal key press; translate the surrounding explanation rather than executing a comment or key. Mention the same-shell job table, actual job numbers, terminal I/O limitations and lack of logout persistence. Unit tests must cover literal metacharacters, apostrophes, executable paths with spaces, malformed executable input, current/previous/numbered selections, invalid numbers and bilingual rendered forms. Never use a real shell or OS job table to test generated text.

Primary semantics references: [Bash asynchronous lists](https://www.gnu.org/software/bash/manual/html_node/Lists.html), [job-control basics](https://www.gnu.org/software/bash/manual/html_node/Job-Control-Basics.html), and [fg/bg builtins](https://www.gnu.org/software/bash/manual/html_node/Job-Control-Builtins.html).
