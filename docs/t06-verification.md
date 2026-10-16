# T06 verification

Verified on 16 October 2026. Four executable builders were added to the existing thirteen: man, whoami, id, and groups. A separate --help option utility appears in Command Help. No dependency, storage-schema, backend, or execution feature was added. The workspace has no Git repository, so source was inspected directly.

## Executed checks

- `npm.cmd run typecheck`: passed.
- `npm.cmd test`: 373 tests passed across 15 files, including existing command regressions.
- `npm.cmd run build`: passed; static production files generated in dist/.
- `npm.cmd run dev -- --host 127.0.0.1`: started successfully.
- ESLint/lint: not configured.
- Isolated headless Chrome: 60 assertions passed with no runtime exceptions.

Browser checks used an installed Chrome browser, temporary script, and isolated profile outside the project. No E2E testing dependency was introduced. Generated Linux commands were compared as strings and never executed.

## Coverage

- Manual default lookup, sections, all four optional modes, topic quotes, missing input disabling copy/pin, and terminal pager shortcut reference.
- whoami preview without inputs; id default/user/group/all-group modes, names, real identity, NUL compatibility, hidden-modifier omission, and invalid usernames.
- groups current process, multiple named accounts, blank added rows, and translated add/remove labels.
- Help utility default/known/custom targets, chmod help without a full chmod builder, invalid executable syntax, shell-keyword/builtin guidance, and disabled copying for invalid help targets.
- Actual clipboard write/read for configured man, groups, and custom --help commands.
- All thirteen prior command previews exercised through the live UI.
- Four new favorites and exact configured pins retained after reload; unpin/repin avoids duplicates. Unit tests separately verify all four new saved commands coexist with a legacy grep record under schema version 1, preserving theme and language.
- EN/ID switching, default Indonesian, theme changes, reload preference restoration, categories, and mobile menu behavior. No horizontal overflow at 390px or 320px; desktop and mobile screenshots reviewed.
- Unit tests cover all eight manual sections, invalid sections/modes/topics, shell argument quoting, id compatibility, common account names, invalid/missing rows, help target validation, bilingual metadata, shortcut tables, and invalid actions.

Temporary browser-test selectors and fixtures were corrected while running QA; they were not application failures. The final 60-assertion browser run completed successfully. An initial unit assertion used the wrong existing empty-form wording and was corrected before the passing suite.

## Limitations

man targets Linux man-db. Section choice uses -s N; sections outside 1–8 and numeric-only topics are unsupported. -k uses apropos regex semantics, not shell expansion; actual regex validity and installed manuals are not checked. Pager -P is intentionally omitted rather than accepting an external-program command string. Shortcut keys assume less and can vary with pager configuration.

Identity builders accept common ASCII account names, not every naming service's rules, numeric IDs, or domain-qualified names. Accepted accounts are not verified. Current-process credentials and named account lookups can differ after membership changes. GNU id modifiers are omitted when incompatible with full output; the tool never prints simulated identity results.

The --help feature generates text and supports copying only; optional help pins are not implemented. Known targets refer to documented GNU/Linux implementations. Custom targets' existence and help support are unverified, and aliases/functions can alter command resolution. A token allowlist cannot establish program behavior.

This is one-browser verification, not a full cross-browser or accessibility audit. No commands, account queries, or terminal programs were executed by the app or command-preview tests.

Sources: [man-db manual](https://man7.org/linux/man-pages/man1/man.1.html), [GNU id source compatibility checks](https://github.com/coreutils/coreutils/blob/master/src/id.c), [GNU id manual](https://www.gnu.org/software/coreutils/manual/html_node/id-invocation.html), and [GNU groups manual](https://www.gnu.org/software/coreutils/manual/html_node/groups-invocation.html).

T06 is complete within its requested scope. T07 was not started.
