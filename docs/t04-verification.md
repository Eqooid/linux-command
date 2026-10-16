# T04 verification

Verified on 15 October 2026. Added cat, less, and nano under File Reading & Editing, using existing forms, shadcn Cards, themes, previews, copy actions, favorites, and pins. No dependencies, backend, editor simulation, or execution APIs were added. The workspace has no `.git` directory; existing source was inspected directly.

## Executed checks

- `npm.cmd run typecheck`: passed.
- `npm.cmd test`: 197 tests passed across 10 files, including T01–T03 regressions.
- `npm.cmd run build`: passed; static assets generated in `dist/`.
- `npm.cmd run dev -- --host 127.0.0.1`: started successfully.
- ESLint/lint: not configured in the project.
- Isolated Chrome QA: 46 live-browser assertions passed, with no runtime exceptions.

Browser QA used an installed browser, a temporary profile, and a temporary script outside the repository. Generated Linux commands were compared as text and never executed. No browser testing framework was installed.

## Covered behavior

- cat: required files, multiple input rows, exclusive numbering, squeeze mode, individual invisible markers, and omission/hiding of redundant -E/-T when -A is active.
- less: required file, line numbers, no wrapping, exclusive -i/-I case modes, -F/-R, trusted +G, and disambiguation of a filename named --.
- nano: no-file default, filename input, all six flags, view-only mode, backup option, and leading-plus path disambiguation.
- less/nano: ten shortcut rows each, bilingual headers/context/actions, and unchanged literal key names. Static tests validate semantic table rendering and metadata completeness.
- Unit tests also cover apostrophes, shell metacharacters, leading hyphens, literal stdin filenames, bad input types, and control characters.
- All eight previous command previews exercised in the browser alongside the new three; existing generation/validation/safety tests remain passing.
- Clipboard contents read back for all three new generated commands.
- New favorites/pins restored after reload alongside a seeded old favorite and pin. Schema version remains 1; exact configured command strings persist. Pin toggling does not duplicate entries.
- Language switching leaves syntax unchanged. Language and dark-theme settings survive reload; light theme also works.
- Reading category navigation, mobile menu behavior, and no page-level horizontal overflow at 390px and 320px. Desktop dark and mobile light shortcut-table screenshots inspected.

## Compatibility and limits

Options target GNU cat, common Linux less, and GNU nano. Runtime configuration/environment and installed versions can change behavior. Shortcut references use common less bindings and traditional nano bindings; modern bindings and terminal mappings may differ. The app does not check installed programs or file existence and cannot display or edit filesystem contents.

cat's builder intentionally requires files, even though the real program can consume stdin. less/nano interactive use requires a terminal. Shell quoting preserves literal user input; leading +, standalone --, and - filenames are additionally disambiguated as documented. No pipes, redirection, or arbitrary startup commands are generated.

References: [GNU cat](https://www.gnu.org/software/coreutils/manual/html_node/cat-invocation.html), [less FAQ](https://www.greenwoodsoftware.com/less/faq.html), [less operand parsing](https://github.com/gwsw/less/blob/master/main.c), and [GNU nano](https://www.nano-editor.org/dist/latest/nano.html).

This is one-browser verification, not a full accessibility or cross-browser audit. T04 is complete within the requested scope. T05 was not started.
