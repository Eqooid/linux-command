# Roadmap

## T01 - completed foundation

Static React/Vite app, strict types, Tailwind/shadcn shell, responsive navigation, two themes, EN/ID content, registry, text generation, copying, favorites, pins, validated storage, and development guides.

## T02 - completed navigation and basic creation

- Navigation: `pwd` with logical/physical modes, `ls` with visibility/sorting/format modes and flags, and `cd` with trusted navigation presets and literal custom paths.
- Files & Directories: `mkdir` with repeated targets, parent creation, verbose output, and octal permissions; `touch` with repeated targets and current/reference/explicit timestamp sources.
- Registry-driven choice, conditional, and repeated input controls; configuration reset; bilingual validation and learning content.
- Safe literal argument serialization and GNU/Bash assumptions; version-1 favorites/pins preserved.
- Builder, registry, localization, persistence, and static form-rendering tests: 84 tests passed, with strict TypeScript and production build checks passing.
- Live Chromium verification: 46 assertions passed for builders, clipboard, favorites/pins, reload persistence, themes/languages, and mobile navigation. Desktop/mobile screenshots inspected; broader accessibility and cross-browser testing remain future work. See `t02-verification.md`.

## T03 - completed file copying, moving, and removal

Implemented cp/mv source/destination builders and rm target builder using existing repeatable inputs and exclusive choices. Archive mode omits redundant flags; transfer conflicts are validated. rm has opt-in recursion/force, conservative path rejection, and bilingual contextual warning levels. Version-1 storage and prior commands are preserved. Verification passed: 163 tests across 8 files, strict TypeScript, production build, and 45 live browser assertions. Results and limits are recorded in `t03-verification.md`.

## T04 - completed file reading and editing

Implemented cat, less, and nano in File Reading & Editing. Shared forms support cat numbering/invisible-character modes, less case modes and trusted +G, and nano's optional path and editor flags. Added bilingual terminal shortcut metadata/tables, operand disambiguation, tests, and documentation. Verification passed: 197 tests across 10 files, strict TypeScript, production build, and 46 live browser assertions. Results and limits are recorded in `t04-verification.md`.

## T05 - completed file searching and text matching

Implemented GNU find filters with fixed ordering, quoted filename globs, size/age/depth validation, and implicit AND. Added grep matching/recursive/output modes with explicit -e patterns and conditional flags. Both use grouped bilingual forms, collapsed advanced controls, and existing favorites/pins. Verification passed: 264 tests across 12 files, strict TypeScript, production build, and 48 live browser assertions. Results and limits are recorded in `t05-verification.md`.

## T06 - completed command help and user identity

Implemented man lookup modes/sections with common pager shortcuts, whoami, id output/identity/name/NUL modes, and optional multi-account groups. Added a separate --help utility with known targets and restricted custom tokens; --help is never an executable registry entry. All new content is bilingual. Common-name validation, shell quoting, shared forms, version-1 favorites/pins, and older saved commands are covered. Verification passed: 373 tests across 15 files, strict TypeScript, production build, and 60 live Chromium assertions. See `t06-verification.md` for coverage and limitations.

## T07 - completed users, permissions, and privilege management

Implemented sudo's exclusive command/shell/credential/listing modes, su switching/login/constrained POSIX command composition, chmod's synchronized octal controls and ordered symbolic clauses, and chown ownership/conditional pairs. Added shared permission visualization and bilingual privilege, recursion, world-write, and unusually permissive warnings. Existing theme/navigation/copy/favorites/pins and schema version 1 remain intact. Verification passed: 487 tests across 18 files, strict TypeScript, production build, and 82 live Chromium assertions. All seventeen prior previews were exercised, alongside old/new saved entries. See `t07-verification.md`.

## T08 - completed process management

Implemented procps-ng ps presets/advanced selection, top options with terminal shortcut reference, shared signal choices for kill/pkill, and Bash jobs display/filter modes. Added numeric and option compatibility validation, literal pattern quoting, bilingual concepts, and contextual signal/full-command-line warnings. Existing schema-version-1 records, themes, navigation, copying, favorites, and pins are preserved. Verification passed: 620 tests across 21 files, strict TypeScript, production build, and 85 live Chromium assertions including all twenty-one prior previews. See `t08-verification.md` for results and limitations. T09 has not been started.

## T08 extension - completed pgrep

Added pgrep under the existing Process Management category, reusing pkill matching metadata and shared forms/validators. Supports PID/name/full-command/count output, name/full/exact/case matching, real/effective users, parent PID, and newest/oldest selection. Pattern omission works with user/parent criteria. Added a bilingual comparison table and preserved version-1 favorites/pins. Verification passed: 673 tests across 24 files, strict TypeScript, production build, and 37 focused browser assertions with the five original process-builder previews. See `t08-pgrep-verification.md`. No new phase, package version, or deployment change was made; T09 remains unstarted.

## Later learning targets

- Opt-in recent history and validated JSON import/export.
- Pipelines/redirection after their operand and quoting rules are understood.
- Broader manual accessibility/mobile checks and browser tests when warranted.

No terminal execution, backend, database, authentication, or AI integration is included in the current scope.
