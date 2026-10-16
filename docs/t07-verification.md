# T07 verification

Verified on 16 October 2026. Added sudo, su, chmod, and chown under Users & Permissions using the existing command registry, shared forms, quoting, warnings, and localStorage. Twenty-one executable builders are now available. No dependency, backend, password prompt, command execution, or filesystem modification was added. The workspace has no Git repository; existing files were inspected directly.

## Executed checks

- `npm.cmd run typecheck`: passed.
- `npm.cmd test`: 487 tests passed across 18 files, including T01–T06 regressions.
- `npm.cmd run build`: passed; static files generated in dist/.
- `npm.cmd run dev -- --host 127.0.0.1`: started successfully.
- ESLint/lint: not configured.
- Isolated headless Chrome: 82 assertions passed with no runtime exceptions.

Live QA used the installed browser with a temporary isolated profile and script outside the project. No browser E2E framework was installed. Command previews were compared as strings, never executed. Temporary verification files/profile were removed afterward; no real browser profile was changed.

## Coverage

- sudo required executable, explicit default root, target user/group, arguments containing spaces/apostrophes/operators/substitution text, login/shell/list/validate modes, standalone invalidation, hidden fields, invalid command-line input, and privilege warning without password inputs.
- su current/default and named user, shell path, preservation, login omission of stale preservation, constrained command mode, explicit /bin/sh, and nested quoting of literal arguments. Unit tests independently decode the supported quote serialization at both boundaries without a shell or execution API.
- chmod 644/755/700/600/754/000, bit calculations, octal-to-checkbox and checkbox-to-octal updates, visible rwx visualization, invalid/special-bit rejection, ordered symbolic clauses, empty assignment, empty-add rejection, recursion, exclusive reporting, and contextual warnings. Numeric editing remains disabled while octal text is invalid; invalid text is not silently replaced.
- chown owner-only/group-only/both, conditional current owner/group, invalid or empty pairs, GNU legacy dotted-owner ambiguity, explicit colon disambiguation, recursive reporting, and multiple literal targets including option-like names.
- Actual clipboard write/read for all four configured commands.
- All seventeen prior executable builders exercised through the live UI.
- Four T07 favorites and configured pins persisted after reload beside a seeded T06 groups pin/favorite. Pinned view displayed both generations of data; adding/removing an exact configuration worked. Unit tests also verify duplicate prevention and saved theme/language under schema version 1.
- EN/ID warnings and labels, unchanged generated text across language switching, light/dark themes, preference restoration, mobile permissions navigation, and no horizontal overflow at widths 390px and 320px. Desktop dark and mobile light screenshots inspected.

The initial nested-quote tests exposed an error in the test-only decoder's quote-state condition, which was corrected. A persistence fixture needed an explicit CommandInputs annotation. All checks above passed on the final implementation. Neither correction required relaxing generation validation.

## Assumptions and limits

sudo targets the documented sudo/sudoers option semantics. It emits explicit -u root by default, except standalone -k; it does not infer authorization, group membership, or actual cache behavior. Shell and credential modes do not accept a command. Actual authentication depends on system policy and occurs only if the generated text is run manually in a terminal.

su targets util-linux. Its command mode is one constrained POSIX command with literal tokens, explicitly requesting /bin/sh. It is not a shell parser or arbitrary script editor. A restricted account can override requested shell selection; installed paths and account policies are not verified. Plain/login switching supports a simple absolute shell path. Environment preservation uses -m (alias -p), is omitted in login mode, and remains subject to PAM.

Executable tokens are limited to simple ASCII names/paths without spaces, shell operators, variables, or substitutions. Literal argument rows accept shell characters as data; the selected program can still interpret their contents and perform harmful operations when run manually. One empty default row means no arguments; empty entries in a multi-row list are actual empty tokens. This builder cannot express exactly one empty argument. No quoting claim implies privilege safety.

chmod supports exactly three ordinary octal digits and explicit single-class u/g/o/a clauses with +/−/= and ordered r/w/x. No special bits, X, copying permissions, or ACLs are implemented. Existing GNU directory special bits may be preserved. Symbolic clauses describe requested changes rather than a known final mode. World-write warnings conservatively flag any grant, even if a later clause removes it. Recursive/777 warnings do not establish whether any target is safe.

Ownership fields use common ASCII account/group names, not numeric IDs or domain schemes. Owner-only dotted values are rejected, including --from, to avoid GNU's legacy owner.group fallback; explicit colon pairs support dotted names. No trailing colon is emitted. --from compares supplied fields and does not guarantee race-free changes. Accounts, files, symlinks, mounts, ACLs, ownership, and permissions are not inspected.

This is one-browser verification, not a full accessibility or cross-browser audit. No credentials are requested or handled. T07 is complete within scope; T08 was not started.

References: upstream [sudo](https://man7.org/linux/man-pages/man8/sudo.8.html), [util-linux su](https://man7.org/linux/man-pages/man1/su.1.html), GNU [chmod](https://www.gnu.org/software/coreutils/manual/html_node/chmod-invocation.html), [symbolic modes](https://www.gnu.org/software/coreutils/manual/html_node/Symbolic-Modes.html), [chown](https://www.gnu.org/software/coreutils/manual/html_node/chown-invocation.html), and [GNU userspec parsing](https://github.com/coreutils/gnulib/blob/master/lib/userspec.c).
