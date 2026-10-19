# Architecture

The app uses React state and plain TypeScript modules. It has no router, global state library, API, or terminal runtime.

## Data flow

1. `commands/definitions.ts` re-exports bilingual metadata from `commands/definitions/`, with one file per command and no React imports.
2. `commands/registry.ts` validates the catalog and exposes `commands` and `getCommand`.
3. `App.tsx` filters this catalog by navigation, category, favorites, and search.
4. `CommandCatalog` lets the user select a definition. `CommandWorkspace` receives that definition and keeps its input values in local React state.
5. `generateCommand` first calls `validateInputs`, then selects an explicitly implemented builder by ID. It returns command text or bilingual errors.
6. The workspace renders the text, explanatory content, and copy/pin actions. Copy uses the Clipboard API; no generated text is executed.

The workspace is keyed by command ID so switching commands resets its inputs. Changing language or theme preserves inputs for the selected command. Filtering out the selected command shows the selection empty state.

## Types and boundaries

`CommandDefinition` describes identity, category, bilingual content, syntax, options, arguments, choices, examples, warnings, and a basic/custom form discriminator. `CommandInputs` holds strings, boolean options, and arrays of literal paths separately from definitions. `GenerationResult` contains nullable text and bilingual errors.

`CommandForm` renders choices as single selects, independent options as checkboxes, and arguments as input rows. An option's `choice` links its flag to a select value; these flags are never independent booleans. An argument's `multiple`, `when`, and `format` fields support repeatable paths, conditional inputs, and permission/timestamp validation. `initialInputs` supplies all defaults; reset restores them. Both rendering and validation use `isInputVisible`, so inactive fields do not affect a command.

Optional `shortcuts` metadata contains bilingual introductory text and `{ keys, description }` rows. `KeyboardShortcuts` renders it using an existing Card and a semantic table; there are no terminal keyboard handlers. Registry validation includes shortcut translations and unique non-empty keys. T04's less/nano builders use `quoteInteractiveFileArgument` to protect leading-plus and standalone-delimiter filenames in addition to shell quoting; trusted less `+G` stays separate from user data.

Builders are deliberately command-specific. There is no universal argument assembler: find uses an ordered expression builder, while grep uses the flag helper plus an explicit -e pattern. The custom form key remains reserved metadata; an unknown builder returns an error, never a fake preview.

T05 adds a small grouped form variant. Each group names existing fields and a bilingual title; advanced groups use details/summary. The same field renderer is reused, so prior basic forms retain their structure. Conditional choices use the same visibility rules as options/arguments. Argument defaults and opt-in whitespace acceptance support find's starting path and grep's literal patterns without changing other commands. `search.ts` owns find numeric validation, ordering, and starting-point disambiguation. No search, glob, or GNU regex evaluation occurs in the browser.

T03 reuses a small transfer builder for cp/mv because both have `source... destination` operands. Conditional option metadata hides/ignores cp recursion/preservation in archive mode. `fileManagement.ts` owns transfer conflict validation and conservative rm path checks; `warnings.ts` supplies contextual bilingual warning levels, rendered before previews by `CommandWarnings`. Validation never resolves filesystem paths and warnings never imply a generated command is safe.

The builders quote each literal path as a single POSIX shell operand and insert `--` before target operands. `arguments.ts` contains quoting and octal/calendar checks; `validation.ts` validates choices, required inputs, and active fields before a builder runs. Control characters are rejected. Trusted `cd` presets preserve `~`, `..`, and `-`; a home-relative preset emits an unquoted `~/` prefix with a quoted suffix. A custom literal `-` becomes `./-` because quoting alone does not remove its special meaning in `cd` and GNU `touch`. The syntax text is documentation, not a shell template. `sudo` is never added automatically.

T06 adds four executable definitions (`man`, `whoami`, `id`, `groups`) using the existing registry and builders. Command Help is a category; its separate `HelpUtility` generates `target --help` without inventing a `--help` executable. `help.ts` owns its allowlist/token validation, while `helpIdentity.ts` owns named-topic and common-account validation. Optional `InputCondition.not` inverts equality to show id modifiers only for selected output. Optional bilingual add/remove labels let repeated arguments describe usernames without path terminology. No storage schema or dependency changes are needed.

T07 adds four definitions through the same registry. `privileges.ts` owns sudo/su validation and mode-specific serialization; su's constrained command uses an inner POSIX simple command, then outer single-argument serialization. `ownership.ts` validates and constructs ownership pairs; `permissions.ts` contains pure octal/symbolic helpers. No system account or filesystem state is read.

Arguments can opt into one of two permission editors through a small component map in `CommandForm`. The existing workspace owns their state as strings/arrays; numeric checkboxes, octal input, and visualization derive from the same value. Symbolic clauses are ordered strings and describe operations rather than simulated resulting permissions. The same metadata visibility and generic validation remain in use. A repeated argument may initialize its first row from `defaultValue`. No new global state, storage schema, or command framework is introduced.

T08 adds ps/top/kill/pkill/jobs through the same definitions and builder map. `processes.ts` centralizes whitelisted signals, ps presets, numeric limits, filter validation, and ps/top serialization. Signals are linked choices, not independent flags. The generic argument controls and current storage shape are sufficient. No OS process queries, regex evaluation, signal sending, or simulated metrics occur.

Optional bilingual `concepts` entries extend educational metadata minimally. Process definitions share one concepts array; `LearningConcepts` renders it as a collapsed definition list using an existing Card. Registry validation checks translations and unique terms. top continues to use the existing shortcut metadata/table. Safety conditions are added to `warnings.ts`, keeping process behavior out of React.

The T08 pgrep extension shares pkill's signal-independent matching metadata and existing numeric/account validators. Its grouped form uses the same input rendering; pattern omission is validated against user/parent filters, and the specialized builder omits the pattern operand entirely when absent. An optional `comparison` array adds bilingual learning-table rows rendered by `CommandComparison`. Registry checks include row descriptions, command tokens, and uniqueness. No changes to persisted state or deployment are needed.

## Localization

`BilingualText` requires both `id` and `en` in each command definition. `localize` picks the requested language and falls back to English, then Indonesian, then an empty string for incomplete content. Registry validation requires both translations for the shipped catalog. `translate` selects interface labels; its Indonesian dictionary is checked against all English keys by TypeScript. Command names, flags, paths, and syntax stay literal.

## Persistence

`App` initializes preferences lazily through `loadState`. A React effect calls `saveState` after changes. `lib/storage.ts` owns JSON serialization and the `linux-command-builder` key. Version 1 contains language, theme, favorite IDs, pins, and a reserved recent array. It validates data parsed as `unknown` before using it, deduplicates favorite IDs, and handles parse errors, access errors, and quota failures.

Missing/corrupt/incompatible data returns fresh defaults (`id`, light, empty collections). T02–T08 preserve schema version 1 and existing generated text without migrations. `savedCommands.ts` provides pure favorite/pin toggle functions used by App and persistence tests. Exact command-ID/text matches toggle off, preventing duplicate pins. A future schema version needs an explicit migration. Saved IDs are checked structurally; unknown favorites are excluded from the visible catalog, while saved pin text remains available. Storage is per origin with no cross-device or cross-tab synchronization. It is plain text, not secure secret storage.

The theme effect toggles `.dark` on the document root. `index.css` defines the requested Snow White/Obsidian Black colors as shadcn-compatible tokens. UI primitives are editable source components; application components compose them without another design system.

## Verification

Unit tests use Node, static React rendering, and an injected in-memory storage adapter, so they need no browser or real localStorage. They cover command semantics, quoting, invalid configurations, form visibility, bilingual completeness, and persistence of old/new records. `npm run build` checks both TypeScript projects before Vite builds. Static rendering alone does not establish live browser interaction or visual correctness; T02 continuation separately verified command forms, actual clipboard contents, saved-state reloads, themes/languages, and mobile navigation in an isolated Chromium profile. See `docs/t02-verification.md` for the results and limits.
