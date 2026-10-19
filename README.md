# Linux Command Builder

A browser-based Linux learning companion. Configure commands, understand their syntax in Indonesian or English, and copy or pin generated text. The app never executes commands and needs no backend.

## Stack and installation

React 19, Vite 8, strict TypeScript 6, Tailwind CSS 4, shadcn/ui source components, Lucide React, localStorage, and Vitest 5. T08 adds no dependencies. Exact versions are recorded in `package-lock.json`.

Use Node.js 22.12+ from a supported even-numbered release (Node 24 recommended).

```sh
npm install          # npm ci for a reproducible lockfile install
npm run dev          # open the URL printed by Vite
npm run typecheck    # strict TypeScript checks
npm test             # unit tests once
npm run test:watch   # watch unit tests
npm run build        # type checks and production output in dist/
npm run preview      # serve the production build locally
```

In Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`. Production builds target `/linux-command/`; development runs at `/`. Clipboard access normally requires HTTPS or localhost.

## Deployment

GitHub Actions uses Node.js 24 and `npm ci` to install exact locked dependencies. [CI](.github/workflows/ci.yml) runs type checks, non-watch Vitest tests, and a production build for pull requests targeting `master` and pushes to `master` (the repository's detected default branch). ESLint is not configured.

The [deployment workflow](.github/workflows/deploy.yml) runs the same checks on pushes to `master`, builds once, and uploads `dist/` as a build artifact: a packaged copy of the finished website. Only after success does the official Pages deployment action publish that artifact. Failed checks block publishing; pull requests never deploy. Only the deployment job receives Pages write and identity-token permissions.

To enable hosting, open the repository on GitHub, choose **Settings → Pages → Build and deployment → Source: GitHub Actions**, allow the workflow's deployment permissions, then push the reviewed workflow files to `master`. Check **Actions** for a successful deployment and open the URL reported by the `github-pages` environment. Pages availability and visibility depend on your GitHub plan and repository settings. No repository settings have been changed here.

The URL format is `https://<repository-owner>.github.io/linux-command/`; the current remote identifies `Eqooid`, so the expected URL is <https://eqooid.github.io/linux-command/>. The application and workflows do not hardcode an owner. This URL is not a claim that deployment is live.

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run preview   # visit http://localhost:4173/linux-command/
```

For blank pages or CSS/JavaScript 404s, check the production Vite base and use `/linux-command/`. Navigation uses React state, so it needs no SPA fallback or router changes. Permission failures usually require checking the Pages source, Actions policy, and `github-pages` environment rules. A missing or out-of-sync lockfile causes `npm ci` to fail; update and commit it with intentional dependency changes. Fix failed tests before deployment can proceed. See [deployment setup and troubleshooting](docs/deployment.md) for details.

The foundation follows official [Vite](https://vite.dev/guide/), [Tailwind](https://tailwindcss.com/docs/installation/using-vite), [shadcn/ui](https://ui.shadcn.com/docs/installation/vite), and [Vitest](https://vitest.dev/guide/) guidance. Editable shadcn components live in `src/components/ui`.

## Implemented commands

| Command | Supported configuration                                                                                   |
| ------- | --------------------------------------------------------------------------------------------------------- |
| `pwd`   | Default, logical `-L`, or physical `-P`; no path                                                          |
| `ls`    | `-l`, `-a`, `-A`, `-h`, `-R`, `-t`, `-S`, `-r`, `-d`, `-1`; optional target path                          |
| `cd`    | No argument, home `~`, parent `..`, previous `-`, root `/`, custom path, or home-relative suffix          |
| `mkdir` | One or more paths; `-p`, `-v`, and `-m` with a 3/4-digit octal mode                                       |
| `touch` | One or more paths; `-a`, `-m`, `-c`, reference `-r`, or timestamp `-t`                                    |
| `cp`    | One or more sources and destination; `-r` (GNU `-R` equivalent), `-i`, `-n`, `-u`, `-v`, `-p`, `-a`       |
| `mv`    | One or more sources and destination; `-i`, `-n`, `-f`, `-u`, `-v`, `-b`                                   |
| `rm`    | One or more targets; `-r` (GNU `-R` equivalent), `-i`, `-I`, `-f`, `-v`                                   |
| `cat`   | One or more files; `-n`, `-b`, `-s`, `-E`, `-T`, `-A`                                                     |
| `less`  | One required file; `-N`, `-S`, `-i`, `-I`, `-F`, `-R`, `+G`                                               |
| `nano`  | Optional file; `-l`, `-m`, `-i`, `-B`, `-v`, `-c`                                                         |
| `find`  | Starting path; `-name`, `-iname`, `-type f/d`, `-size`, `-mtime`, `-mindepth`, `-maxdepth`, `-empty`      |
| `grep`  | Pattern and target paths; `-i`, `-n`, `-r`, `-R`, `-v`, `-w`, `-x`, `-E`, `-F`, `-l`, `-c`; explicit `-e` |
| `man` | Topic; sections 1–8 using `-s`; lookup modes default, `-k`, `-f`, `-a`, `-w` |
| `whoami` | Effective username; no configuration |
| `id` | Optional username; exclusive `-u`, `-g`, `-G`; compatible `-n`, `-r`, `-z` |
| `groups` | Current process or one/multiple named accounts |
| `sudo` | Run, login/shell, permission listing, credential refresh/invalidation; `-u`, `-g`, `-i`, `-s`, `-l`, `-v`, `-k` |
| `su` | Switch, login `-l` (alias `-`), shell `-s`, preserve `-m` (alias `-p`), constrained command `-c` |
| `chmod` | Three-digit octal checkboxes/input and visualization; ordered `u/g/o/a` symbolic clauses with `+/-/=` and `r/w/x`; `-R`, `-v`/`-c`, `-f` |
| `chown` | Owner/group pairs, multiple targets, `--from`, `-R`, `-v`/`-c`, `-f` |
| `ps` | Exclusive default, `-e`, `-ef`, BSD `aux`, `-ejH` presets; advanced `-p`, `-u`, allowlisted `-o` columns |
| `top` | Optional refresh `-d`, PID `-p` or effective-user `-u`, batch `-b`, updates `-n`, threads `-H`; shortcut reference |
| `kill` | One/multiple positive PIDs; named TERM, KILL, INT, HUP, STOP, CONT signals |
| `pkill` | Regex pattern; same signals, `-f`, `-x`, `-u`, `-i`, `-e` |
| `jobs` | Bash default/`-l`/`-p` output; running `-r` or stopped `-s`; optional numeric `%job` |
| `pgrep` | T08 extension: regex/full/exact/case matching, PID/name/full-command/count output, effective/real user, parent PID, newest/oldest selection |

Navigation contains `pwd`, `ls`, and `cd`; Files & Directories contains `mkdir`, `touch`, `cp`, `mv`, and `rm`. Select controls prevent conflicting pwd modes, ls hidden/sort/layout modes, touch timestamp sources, cp/mv overwrite modes, and rm confirmation modes. Independent flags can be combined. `-h` is useful when sizes are displayed (for example `-l`); `-R` can produce large output and has no effect with `-d`.

All twenty-seven builders include bilingual labels, validation messages, syntax, explanations, practical examples, and applicable notes. File Reading & Editing contains `cat`, `less`, and `nano`; Searching contains `find` and `grep`. Command Help contains `man` and a separate `--help` generator. Users & Permissions contains `whoami`, `id`, `groups`, `sudo`, `su`, `chmod`, and `chown`. Process Management contains ps, top, kill, pkill, jobs, and pgrep with shared learning concepts. Search forms group related fields and collapse advanced controls. The existing responsive shell, Snow White/Obsidian Black themes, favorites, pins, search, and empty states remain. Reset restores command defaults. Invalid output disables copy and pin actions.

## Generation conventions

- Targets/sources are entered as literal paths, one input row per operand. Add rows for multiple paths; do not type shell quotes or split a path on spaces. cp/mv serialize all sources before the destination. Multiple sources require an existing destination directory, which the app cannot verify.
- Generated flags are separated and ordered deterministically: `ls -l -a -h` is equivalent to the example `ls -lah`.
- Each path is single-quoted, with embedded apostrophes escaped using adjacent quoted segments. `$`, backticks, semicolons, wildcards, and user-entered `~` remain filename characters.
- `--` separates target operands from options. A literal path named `-` becomes `./-`, avoiding special cd/touch behavior. Control characters, newlines, and blank required rows are rejected.
- Only trusted cd presets introduce shell syntax. For `~/Documents`, choose the home-relative preset and enter `Documents`; the result is `cd -- ~/'Documents'`. The Custom preset treats `~/Documents` literally.
- mkdir permissions accept 3 or 4 octal digits (0–7). chmod deliberately supports only three ordinary octal digits, plus an interactive symbolic subset described below; its editor does not configure special bits.
- touch timestamps use the GNU-compatible explicit subset `CCYYMMDDhhmm[.ss]`. Calendar dates and clock ranges are checked; seconds are 00–59. Short-year formats and leap seconds are outside this builder. The terminal's time zone and filesystem capabilities determine runtime behavior.
- Text previews never execute or verify filesystem paths. No automatic `sudo` is added.

Examples of generated text:

```sh
pwd -P
ls -l -a -h -- 'My Documents'
cd -- '../projects'
cd -- ~/'Documents'
mkdir -p -m 755 -- 'projects/react/src' 'My Notes'
touch -r 'reference.txt' -- 'target.txt'
touch -t 202610140930 -- 'document.txt'
cp -r -- 'project/' 'backup/'
cp -a -i -v -- 'My Project' 'Project Backup'
mv -i -b -- 'old.txt' 'new.txt'
rm -i -- 'temporary.txt'
cat -b -s -A -- 'first.txt' 'My Notes.txt'
less -N -S -i +G -- 'server.log'
nano -B -- 'important.conf'
nano
find '.' -maxdepth 2 -type f -name '*.txt'
find 'My Projects' -type f -size +10M -mtime -7
grep -i -n -r -e 'error' -- './logs'
grep -F -e '-user.name' -- 'My Notes.txt'
```

## Process management

**T08 extension — pgrep:** generate process-inspection commands with `-a`, `-l`, `-f`, `-x`, `-i`, `-u`, `-U`, `-P`, `-n`, `-o`, and `-c`. Grouped controls separate matching, user/parent filters, output, and collapsed advanced selection. Output modes and newest/oldest choices are exclusive. Matching uses extended regex; -x matches the entire selected string without escaping regex characters. -a displays full commands but does not enable -f matching. Effective user (-u), real user (-U), and parent PID (-P) criteria combine with AND. Parent filtering selects immediate children, not an entire descendant tree. Usernames use existing common-name validation; parent PID uses the existing positive integer range (1–2147483647).

The pattern is required unless a user or parent-PID filter is provided: `pgrep -P 1234`, `pgrep -u 'root'`, and `pgrep -U 'alice'` generate without an empty pattern argument. Whitespace-only patterns are rejected; output/matching flags and newest/oldest alone do not satisfy selection requirements in this builder. Provided patterns stay shell-quoted after `--`, including spaces, apostrophes, and leading hyphens. Their GNU regex syntax and matches are not evaluated. Newest/oldest uses process start time, with possible clock-tick ties; count reflects the selected set. Full command-line output can expose sensitive arguments when run manually.

pgrep finds matching processes, ps displays process information, kill signals explicit PIDs, and pkill signals matches. The page includes a bilingual comparison table. Use pgrep to prepare an inspection before pkill, while recognizing that PIDs and matches can change between commands. The app never executes either command. Favorites and exact configured pins reuse storage version 1. No release/package version or deployment configuration changes were needed.

```sh
pgrep -- 'nginx'
pgrep -l -- 'nginx'
pgrep -a -- 'node'
pgrep -f -x -u 'alice' -- 'node server.js'
pgrep -P 1234
pgrep -c -U 'alice' -- 'bash'
pgrep -n -- 'python'
pgrep -o -- 'nginx'
```

The **Process Management** category contains six text-only builders and a shared, collapsible bilingual concepts panel. No process list, CPU/memory metrics, job table, signals, or process simulation is accessed or executed. A process is a program instance; PID identifies it and PPID its parent. PIDs can be reused after exit. Common states are R (running/runnable), S (interruptible sleep), D (uninterruptible sleep, often I/O), T (stopped), and Z (exited zombie awaiting its parent's collection). A zombie is not a running program to terminate again.

- **ps:** one display preset emits exactly `ps`, `ps -e`, `ps -ef`, `ps aux`, or `ps -ejH`. Default procps-ng ps selects the invoking effective user and terminal, not every process on that terminal. BSD aux deliberately has no dash; do not substitute -aux. Advanced mode offers PID rows or effective username, plus comma-separated columns. The builder rejects simultaneous PID/user selection to avoid surprising ps OR-selection semantics. With no selector, custom columns retain default selection. Allowed unique columns: pid, ppid, user, stat, cmd, comm, pcpu, pmem, etime, tty; no spaces or header expressions.
- **top:** optional positive refresh seconds with at most one decimal digit, one/multiple PIDs (up to 20 entries), or effective username. PID and user filters are mutually exclusive in procps-ng. -b enables non-interactive batch output; -n limits updates in either mode; without a limit batch output continues until stopped externally. -H shows threads and, with -p, may include each monitored PID's thread group. The page documents q, P, M, T, k, r, H, 1, and h; these keys operate inside a real terminal monitor, not this app. Signal/renice keys can change state or require privileges.
- **kill:** required positive PID rows; default SIGTERM is explicit. Shared signal choices are TERM (15), KILL (9), INT (2), HUP (1), STOP (19), and CONT (18). Generated commands use names because numbers vary by architecture/platform. TERM allows program cleanup if handled; KILL cannot be caught, blocked, or ignored and prevents application cleanup, though kernel state can delay exit. STOP pauses; CONT resumes. HUP may terminate or trigger program-specific reload. Delivery/termination is never guaranteed. Zero and negative PIDs are excluded because they have process-group semantics.
- **pkill:** a required nonblank extended regex matches names (typically limited to 15 characters), or full command lines with -f. -x requires the entire selected string to match but does not disable regex metacharacters. Optional effective user -u, ignore-case -i, and echo -e are supported. Echo still sends signals when run manually; it is not a dry run. Multiple processes may match. Inspecting corresponding criteria with pgrep in a terminal can help review potential matches, but is subject to races; the pgrep builder prepares that inspection command, but neither builder executes it or evaluates regex.
- **jobs:** a Bash builtin with a job table specific to the shell session. Choose default text, -l with PIDs, or -p with process-group leader IDs, and at most one running/stopped filter. Optional job specifications support positive numeric `%1` form only. A job can contain multiple processes; its ID differs from a PID. Foreground jobs normally use terminal input while the shell waits; background jobs let the shell accept work. fg/bg relate to bringing a job forward or continuing it in the background, but their builders are outside T08. Non-interactive shells and job-control settings can differ.

PID/count inputs use decimal integers from 1 to 2147483647, not a discovered system PID limit. Optional filters accept one empty default row; added PID rows must be filled. Leading-zero PIDs/job numbers normalize to decimal. User filters follow common account-name validation, without querying accounts. Refresh intervals use a positive one-decimal subset up to 2147483647 seconds. Pattern strings remain shell-quoted, including apostrophes, spaces, and leading hyphens after `--`. A quoted regex still has regex meaning inside pkill, and malformed regex may be rejected when run manually. kill PIDs and validated numeric options are serialized as numeric tokens.

Always-visible signal notes explain system disruption and PID reuse. SIGKILL adds a stronger warning; SIGSTOP adds a pause warning; pkill -f warns about expanded matching scope. Static validation does not establish safety, target existence, permissions, or expected results. No automatic sudo or forced signal is added.

```sh
ps aux
ps -p 1234,5678 -o 'pid,ppid,user,stat,cmd'
top -b -n 1
top -d 0.5 -u 'alice'
kill -TERM -- 1234 5678
pkill -TERM -x -u 'alice' -- 'nginx'
jobs -l -r -- '%1'
```

Compatibility references: procps-ng [ps](https://man7.org/linux/man-pages/man1/ps.1.html), [top](https://man7.org/linux/man-pages/man1/top.1.html), [pkill](https://man7.org/linux/man-pages/man1/pgrep.1.html), and [Bash job-control builtins](https://www.gnu.org/software/bash/manual/html_node/Job-Control-Builtins.html).

## Privileges, permissions, and ownership

These builders generate text only. No password field, authentication request, system inspection, execution, or real file change is implemented. Quoting prevents shell interpretation; it cannot make a privileged program or its arguments harmless. Authorization depends on system policy, not universally on membership in a group called sudo.

- **sudo:** choose one mode: command, login shell `-i`, shell `-s`, permission listing `-l`, refresh `-v`, or invalidate `-k`. Target user defaults explicitly to root (`-u 'root'`), with optional primary group `-g`. Standalone invalidation omits all target/command fields. Login mode requests the target's login shell/environment; -s has different shell/environment selection. Unlike this explicit-user builder, a manually written `sudo -g developers id` without -u uses the invoking user. Credential modes do not run a program but may require authentication when used in a real terminal.
- **su:** choose plain switching, login `-l`, or a constrained command. Empty user normally means root. Optional shell paths are simple absolute paths. Preserve `-m` (equivalent to -p) is hidden and omitted in login mode, where util-linux ignores it. su commonly authenticates the target account through PAM, while sudo uses configured command authorization and commonly the invoking user's authentication; actual policies vary. The app never handles either password.
- **Constrained commands:** executable names or simple absolute/relative paths and argument rows are separate. Executables reject whitespace, variables, operators, and substitutions; paths with spaces are outside this subset. Arguments remain literal, including spaces, quotes, wildcards, and leading hyphens. One untouched empty argument row means no arguments; in multiple rows an empty row is an intentional empty token. sudo runs a tokenized command after `--`. su command mode explicitly requests `/bin/sh`, quotes each inner token, then quotes the entire inner command as the single `-c` argument. No free-form shell script, pipeline, or redirection editor is provided. A restricted account can override su's shell selection, so POSIX behavior cannot be guaranteed on every account.
- **chmod:** numeric input and nine permission checkboxes stay synchronized. Each owner/group/others digit sums read=4, write=2, execute=1. `754` displays `rwxr-xr--`. Invalid octal text disables checkbox editing and generation until corrected. Symbolic rows select u/g/o/a, +/−/=, and r/w/x; generated letters use rwx order, while clause order remains significant. `=` permits no permissions (`o=`); + and − require at least one. Symbolic mode describes changes, not known resulting file permissions. No X, s, t, permission copying, ACL editor, or special-bit editor is included. GNU may preserve existing special directory bits with three-digit modes.
- **chown:** separate owner/group fields produce `alice`, `alice:developers`, or `:developers`. At least one is required. Optional current-owner/current-group fields use the same pairing for `--from`; blank fields are not tested. No trailing colon is emitted. Common account names follow the identity builders; numeric IDs/domain names are excluded. Dotted owner-only names are rejected because GNU may fall back to legacy owner.group parsing; explicit owner:group pairs disambiguate dotted names. Existing accounts and ownership are not checked.

chmod/chown share opt-in recursion, exclusive verbose `-v` or changes-only `-c`, error suppression `-f`, and repeated literal targets. Permission bits and ownership are different: chmod changes access rules, while chown changes the owning user/group. Directory execute means traversal/search, not administrator privilege. Directory write concerns entries and often also needs execute; primary and supplementary memberships influence access checks. Recursive changes can affect unexpected descendants and break system services. World-write requests warn; `777` and a+rwx/a=rwx add a stronger warning and are not recommended as general permission fixes. Symbolic warnings are conservative about grants in any row, even if a later row removes them. Symlinks, ACLs, mounts, special bits, and filesystem state remain unknown.

```sh
sudo -u 'root' -- 'apt' 'update'
sudo -u 'postgres' -i
sudo -k
su -l -- 'alice'
chmod -- '754' 'My Script'
chmod -- 'u=rw,g=r,o=' 'notes.txt'
chown --from='olduser' -- 'alice:developers' 'project/'
```

References: upstream [sudo manual](https://man7.org/linux/man-pages/man8/sudo.8.html), [util-linux su manual](https://man7.org/linux/man-pages/man1/su.1.html), GNU [chmod](https://www.gnu.org/software/coreutils/manual/html_node/chmod-invocation.html), [symbolic modes](https://www.gnu.org/software/coreutils/manual/html_node/Symbolic-Modes.html), and [chown](https://www.gnu.org/software/coreutils/manual/html_node/chown-invocation.html).

## Command help and user identity

Open **Command Help** in the sidebar for the man builder and a separate `--help` utility. man supports one topic, one lookup mode (normal page, keyword `-k`, short description `-f`, all pages `-a`, or file locations `-w`), and sections 1–8. Section selection emits explicit `-s N`, equivalent to positional section syntax. Numeric-only topics are rejected to avoid section ambiguity. Keyword matching uses man-db/apropos regex semantics; shell quoting prevents shell expansion but does not disable a utility's own matching rules. Manual pages and regex validity are not checked.

The manual page includes section descriptions and common less-pager shortcuts. `-P` is deliberately omitted: man launches an external pager, and pager command strings need separate parsing beyond literal topic arguments. Installed pages, pager configuration, and environment can change behavior.

`--help` is an option, not a catalog executable. Choose a known GNU/Linux target or enter a single executable token. Custom names accept a letter/underscore followed by letters, digits, `_`, `.`, `+`, or `-`; paths, whitespace, shell operators, substitutions, and known shell keywords/builtins are rejected. Custom support and installed executables are not verified. Help targets are maintained separately from the executable builder catalog. This small utility supports copying; pins remain attached to executable builders. Compare `man command`, `command --help`, Bash `help command`, and program-specific `-h`; these interfaces are not interchangeable. Shell aliases/functions can affect which program a name invokes.

Under **Users & Permissions**, whoami generates a command with no inputs. It reports effective identity when run manually, which can differ from the original login account. id defaults to full identity, with exclusive UID `-u`, primary GID `-g`, or all-groups `-G` output. Selected modes support names `-n`, real identity `-r`, and GNU NUL separators `-z`; those controls are hidden and omitted in full output. NUL is an output character, never an actual NUL in the generated command text. Real identity usually identifies the invoking account; effective identity is used in many permission checks. Neither is necessarily a record of the original login.

id accepts one optional username; groups accepts no username or multiple separate rows. Empty single rows mean the current process. Every added row must be filled. Common account names start with a letter or `_`, continue with letters/digits/`_`/`.`/`-`, and may end in `$`. Numeric user IDs, domain-specific names, and other account naming schemes are outside this builder. Accepted names are quoted after `--`; account existence is not checked. Current-process groups can differ from named-account lookups because sessions inherit group credentials while account services may have changed. UID identifies an account; GID identifies a group, including primary and supplementary memberships. The browser never inspects actual users or groups.

```sh
man -s 5 -- 'passwd'
man -k -- 'network'
grep --help
whoami
id -u -n
id -G -n -z -- 'alice'
groups -- 'alice' 'bob'
```

References: [man-db manual page](https://man7.org/linux/man-pages/man1/man.1.html), [GNU id](https://www.gnu.org/software/coreutils/manual/html_node/id-invocation.html), and [GNU groups](https://www.gnu.org/software/coreutils/manual/html_node/groups-invocation.html).

## File searching and text matching

find recursively selects filesystem entries, while grep selects lines of file content. Both builders generate text only: no path existence, contents, matches, or regex syntax are evaluated.

find defaults to `.`. It emits the quoted starting point, minimum/maximum depth, then type, name, size, age, and empty filters in deterministic order. Enabled filters use implicit AND; GNU find prints matched paths by default. No Boolean grouping, actions, pipes, or redirection are generated. Starting names beginning with `-`, `!`, `(`, or `)` receive `./` before quoting because `--` does not reliably separate find starting points from expressions.

Filename patterns use GNU find globs, not regex. Enter `*.txt` without shell quotes; generated `-name '*.txt'` prevents the shell from expanding it before find runs. Ignore-case selects `-iname`. Any type omits `-type`; File and Directory emit `-type f` or `-type d`. `-empty` selects empty regular files or empty directories.

Advanced numeric filters are opt-in. Size values must be positive integers; units are bytes (`c`), KiB blocks (`k`), MiB blocks (`M`), or GiB blocks (`G`). Comparison choices add no prefix, `+`, or `-`. GNU find rounds size up to whole units: `-size 10M` is a rounded-unit count, not an exact 10 MiB byte test. In particular, `-size -1M` matches only zero-size files; byte-based tests use `c`.

Modification age uses completed 24-hour periods, rounded down. `-mtime 7` is the 7-to-under-8-day bucket, `+7` means more than 7 completed periods (at least 8 days), and `-7` means fewer than 7. These are elapsed-time comparisons, not calendar-date filtering. Age and depth require nonnegative integers. Depth zero is the starting point; enabled minimum depth cannot exceed maximum. Numeric values are limited to JavaScript's safe integer range; platform utility limits can be narrower.

grep explicitly selects basic regex (default), extended regex (`-E`), or fixed text (`-F`). Fixed mode treats punctuation such as the dot in `user.name` literally. Every generated pattern follows `-e`, so a leading hyphen cannot turn it into an option. Targets follow `--`; a literal filename `-` becomes `./-` rather than stdin. Pattern spaces are meaningful, but multiline/control-character input is unsupported. Invalid GNU regex syntax may still be rejected when run manually; the app does not use JavaScript regex to imitate GNU grep.

Recursive modes are mutually exclusive. `-r` follows command-line symlink operands but skips links discovered during traversal; `-R` follows all symlinks and may leave the intended tree. Filename-only (`-l`) and selected-line counts (`-c`) omit irrelevant line numbers. Counts are lines, not occurrences, and inversion (`-v`) changes which lines are selected. Whole-line `-x` makes whole-word `-w` redundant, so the latter is hidden and omitted.

grep normally supports stdin, but this builder requires explicit target rows. All target paths remain literal: entering `*.ts` does not expand a shell glob. List files individually or search a directory recursively. Locale, permissions, symlinks, binary-file handling, and installed GNU versions may affect actual results. See [GNU find starting points](https://www.gnu.org/software/findutils/manual/html_node/find_html/Starting-points.html), [size](https://www.gnu.org/software/findutils/manual/html_node/find_html/Size.html), [age](https://www.gnu.org/software/findutils/manual/html_node/find_html/Age-Ranges.html), and [GNU grep usage](https://www.gnu.org/software/grep/manual/html_node/Usage.html).

## Reading files and terminal editing

- cat writes files to standard output in row order, without adding separators. The builder requires at least one file even though cat itself can read stdin without a file. Line numbering is one choice: none, all (`-n`), or non-empty (`-b`). GNU `-b` overrides `-n`; the builder emits only the chosen flag. `-A` includes `-E`/`-T` behavior, so their controls are hidden and redundant flags omitted while `-A` is active.
- less is an interactive pager, useful for navigating large files. It requires one path here. Search case uses one select: default, conditional ignore (`-i`, only if there are no uppercase letters), or always ignore (`-I`). Start-at-end emits the trusted literal `+G` before `--`; it never uses arbitrary input as a startup command. `-R` passes supported color sequences; it does not mean all raw control sequences are enabled.
- nano is a terminal editor. Without a filename it opens an unnamed buffer; a named file need not exist. Saving may create or change files. View-only `-v` disables editing inside nano; it is not a filesystem permission control. `-B` requests a previous-version backup when saving, not automatic saving, and is irrelevant while only viewing.

Each literal path uses the existing shell quoting. For less/nano, a leading `+` and a standalone `--` are prefixed with `./` so they cannot become position/search syntax or an extra less delimiter. A literal `-` already becomes `./-` rather than stdin. Other leading-hyphen paths follow `--`. No user-entered shell expression is expanded, and file existence is not checked.

less and nano require installed terminal programs when run manually. The app contains no terminal, file viewer, simulated contents, or browser editor. Environment variables (such as LESS/LESSOPEN), program versions, terminal support, and editor configuration may change runtime behavior.

### Shortcut references

Both command pages show bilingual shortcut tables. less includes `Space`, `b`, `j / k`, `g`, `G`, `/text`, `?text`, `n`, `N`, and `q` for paging, movement, searching, and quitting. nano includes `Ctrl + O`, `Ctrl + X`, `Ctrl + K`, `Ctrl + U`, `Ctrl + W`, `Ctrl + \`, `Ctrl + G`, `Alt + U`, `Alt + E`, and `Ctrl + _` for saving, exiting, cutting/pasting, searching/replacing, help, undo/redo, and navigation.

The nano table describes traditional bindings: `^` means Ctrl and `M-` means Meta (usually Alt, or Esc followed by a key). Modern bindings, versions, terminal mappings, and nanorc configuration can differ. Check installed help with `Ctrl + G`. These are references for keys used inside the terminal program, not browser keyboard handlers.

References: [GNU cat](https://www.gnu.org/software/coreutils/manual/html_node/cat-invocation.html), [less FAQ](https://www.greenwoodsoftware.com/less/faq.html), and [GNU nano manual](https://www.nano-editor.org/dist/latest/nano.html).

## File-management behavior and removal safeguards

cp leaves the source in place; mv moves or renames based on the destination type. Directory copying requires opting into recursive `-r` or archive `-a` mode. Archive mode already preserves links/attributes and recurses, so the form hides and the generator omits redundant `-r`/`-p`. Hidden control values do not affect output. Attribute preservation depends on permissions and filesystem support.

cp/mv default overwrite behavior may replace data. Their single overwrite select prevents contradictory `-i`/`-n`/`-f` flags (`-f` is supported only for mv). Update `-u` is rejected with `-n` because it would be redundant/ignored. mv backup `-b` is incompatible with `-n` and produces a validation error. GNU deprecates `-n`; exit-status details vary across utilities/versions. Moving across filesystems may copy then remove and is not guaranteed atomic.

rm generally bypasses the recycle bin. Recursive and force modes are never enabled automatically. Confirmation is one choice: default, every removal (`-i`), once for more than three targets or recursive removal (`-I`), or never prompt (`-f`). Force is not a safety feature. Bilingual notes appear before the preview; recursive mode adds a warning and recursive+force adds a stronger monochrome HIGH RISK warning. No copy confirmation dialog or execution action is added.

The rm validator conservatively blocks `/`, `.`, and `..`, including lexical equivalents such as `/tmp/..` or `folder/..`. Recursive mode also blocks common root-level directory targets (including `/tmp`, `/var`, `/home`, `/root`), critical system trees (`/bin`, `/boot`, `/dev`, `/etc`, `/lib`, `/lib32`, `/lib64`, `/proc`, `/sbin`, `/sys`, `/usr` and descendants), obvious `/home/<user>` and `/Users/<user>` roots, and exact home tokens (`~`, `~user`, `$HOME`, `${HOME}`). Path checks collapse repeated slashes and dot segments only for validation; generated paths are never rewritten using that normalization. One blocked target invalidates the entire preview.

These checks can conservatively reject a literal filename such as `~`, even though quoting would prevent expansion. They cannot resolve symlinks, mounts, relative paths against a current directory, arbitrary home locations, or aliases. A permitted target is not guaranteed safe. Wildcards and variables remain literal; this is not a shell parser or filesystem simulator.

## Persistence

Favorites store command IDs; pins store exact generated text, command ID, ID, and creation time. Matching command-ID/text pins toggle off rather than duplicate. Language, theme, favorites, and pins persist on the same origin. T08 keeps storage schema version 1, so T01–T07 records remain readable without migration.

Corrupt/incompatible data resets to defaults. Blocked/full storage leaves changes in memory and shows a message. Saved text is plain text; do not include secrets. Cross-device and cross-tab synchronization are not implemented.

## Source map

```text
src/
  App.tsx                       # shell state, selection, save interactions
  commands/
    definitions.ts              # catalog definition exports
    definitions/*.ts            # one bilingual definition per command
    types.ts                    # metadata, choices, arguments, inputs
    registry.ts                 # catalog validation
    arguments.ts                # quoting, octal and calendar checks
    validation.ts               # active input validation
    fileManagement.ts           # transfer conflicts and conservative rm checks
    search.ts                   # find ordering, path serialization, numeric validation
    warnings.ts                 # bilingual contextual warning levels
    generation.ts               # defaults and specialized builders
    helpIdentity.ts             # manual-topic and common-account validation
    permissions.ts              # ordinary octal bits and constrained symbolic clauses
    privileges.ts               # sudo/su modes, validation, two-layer su quoting
    ownership.ts                # ownership pairs and chown-specific validation
    processes.ts                # fixed presets/signals, numeric checks, ps/top builders
    processLearning.ts          # shared bilingual concepts and process input metadata
    help.ts                     # standalone help-option utility logic
  components/
    CommandForm.tsx             # choices, flags, repeated/conditional inputs
    CommandWorkspace.tsx        # preview, learning content, reset, actions
    CommandWarnings.tsx         # monochrome warning emphasis before preview
    KeyboardShortcuts.tsx        # bilingual metadata-driven terminal reference
    HelpUtility.tsx              # target selection, --help preview/copy, help guidance
    PermissionEditors.tsx        # numeric/symbolic controls and permission table
    LearningConcepts.tsx         # reusable collapsed bilingual concepts panel
    CommandCatalog.tsx, Sidebar.tsx, CopyButton.tsx, PinnedCommands.tsx
    ui/                         # shadcn source components
  lib/
    storage.ts                  # validated versioned JSON persistence
    savedCommands.ts            # favorite/pin state transitions
  i18n.ts                       # UI translations and content fallback
  index.css                     # Tailwind and theme tokens
  **/*.test.ts                  # unit and static-rendering tests
docs/
  architecture.md
  command-development.md
  roadmap.md
```

## Limitations and verification

Builders target Bash navigation and common GNU/Linux utilities, not every Unix implementation. They cannot check path existence, permissions, HOME/OLDPWD/CDPATH, filesystem mode inheritance, timestamp precision, DST gaps, or platform date ranges. cd is normally a shell builtin and only changes the shell where it is run. mkdir/touch notes describe possible effects; the app never claims to have created anything.

Inputs reset when switching commands. Recent history, import/export, general custom forms, additional commands, pipelines, and redirection remain future work. Generated text is limited to 10,000 characters to match pin storage. Clipboard errors show a manual-copy message.

Automated tests cover all twenty-seven builders, the help utility, option conflicts, shell quoting, numeric validation, presets/signals, permission editors, bilingual concepts/comparisons/shortcuts, safeguards, and old/new saved records. The pgrep T08 extension passed 673 tests across 24 files, strict TypeScript, and a production build. Its 37 focused browser assertions covered matching/output modes, pattern-free user/parent criteria, quoting, actual clipboard contents, compatible favorites/pins, reload preferences, the five existing process-builder previews, and mobile layout down to 320px. Desktop/mobile screenshots were inspected. No E2E dependency was added; broader accessibility/cross-browser checks remain future work. See [pgrep extension verification](docs/t08-pgrep-verification.md) and historical [T08 verification](docs/t08-verification.md), which recorded 85 browser assertions across the original five builders and twenty-one earlier previews. Earlier reports remain available for [T07](docs/t07-verification.md), [T06](docs/t06-verification.md), [T05](docs/t05-verification.md), [T04](docs/t04-verification.md), [T03](docs/t03-verification.md), and [T02](docs/t02-verification.md).

Read [architecture](docs/architecture.md), [command development](docs/command-development.md), and [roadmap](docs/roadmap.md). Command semantics reference the [GNU Coreutils manual](https://www.gnu.org/software/coreutils/manual/coreutils.html) and [Bash manual](https://www.gnu.org/software/bash/manual/bash.html).
