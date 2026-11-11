# Linux Command Builder

A browser-based Linux learning companion. Configure commands, understand their syntax in Indonesian or English, and copy or pin generated text. The app never executes commands and needs no backend.

## Stack and installation

React 19, Vite 8, strict TypeScript 6, Tailwind CSS 4, shadcn/ui source components, Lucide React, localStorage, and Vitest 5. T14 adds no dependencies. Exact versions are recorded in `package-lock.json`.

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
| `chgrp` | Group name/numeric GID or reference file; multiple targets, `-R`, `-v`/`-c`, opt-in sudo |
| `ps` | Exclusive default, `-e`, `-ef`, BSD `aux`, `-ejH` presets; advanced `-p`, `-u`, allowlisted `-o` columns |
| `top` | Optional refresh `-d`, PID `-p` or effective-user `-u`, batch `-b`, updates `-n`, threads `-H`; shortcut reference |
| `htop` | Username `-u`, comma-separated PIDs `-p`, tenths delay `-d`, allowlisted sort `-s`, tree `-t`, `--readonly`; shortcut reference |
| `kill` | One/multiple positive PIDs; named TERM, KILL, INT, HUP, STOP, CONT signals |
| `pkill` | Regex pattern; same signals, `-f`, `-x`, `-u`, `-i`, `-e` |
| `jobs` | Bash default/`-l`/`-p` output; running `-r` or stopped `-s`; optional numeric `%job` |
| `pgrep` | T08 extension: regex/full/exact/case matching, PID/name/full-command/count output, effective/real user, parent PID, newest/oldest selection |
| `command &` | Shell-operator feature: one executable and separate literal argument rows; background execution always enabled |
| `fg` / `bg` | Bash builtins: current job, explicit `%+`, previous `%-`, or positive numbered `%N` |
| `systemctl` | 13 actions; system/user manager, explicit suffix or listing type, --now, --all, optional opt-in sudo |
| `journalctl` | Unit, entry count, follow/reverse, boot/priority/time filters, short/short-iso/cat/json, no-pager, system/user scope |
| `ip` | Read-only addresses/links/routes, IPv4/IPv6, brief addr/link view, interface filter |
| `ping` | ICMP target, count, interval, reply/overall timeouts, IPv4/IPv6, quiet output |
| `ss` | TCP/UDP, listening/all, numeric/process display, IPv4/IPv6, summary |
| `hostname` | Current/short/FQDN/domain name, resolved addresses `-i`, local addresses `-I` |
| `curl` | HTTP GET/HEAD/POST/PUT/PATCH/DELETE, headers/body, timeout, redirects, response headers, output file |
| `ssh` | Host/user connection, lowercase `-p`, key path, timeout, verbose, IPv4/IPv6 |
| `ssh-keygen` | Ed25519 or RSA 3072/4096, output path and comment; no passphrase input |
| `ssh-copy-id` | Public `.pub` key path, host/user, lowercase `-p` |
| `scp` | File/directory upload or download, uppercase `-P`, key, recursion, preserve, verbose |
| `sftp` | Interactive connection with uppercase `-P`, key path and session command reference |
| `apt` | Update/upgrade/full-upgrade, install/remove/purge/autoremove, search/show/list; action-specific options and optional sudo |
| `apt-cache` | Search/show/depends/rdepends/policy/pkgnames metadata queries |
| `dpkg` | Package status/files/owner queries, local `.deb` install/contents/info, remove/purge |
| Pipe Builder | 2-4 stages, catalog/literal sources, add/remove/reorder, `|` |
| Output Redirection Builder | One command and `>` overwrite or `>>` append |
| Input Redirection Builder | One command and `<` literal file input |
| Standard Error Builder | `2>`, `2>>`, `2>&1`, or stdout file + stderr duplication in either order |

Navigation contains `pwd`, `ls`, and `cd`; Files & Directories contains `mkdir`, `touch`, `cp`, `mv`, and `rm`. Select controls prevent conflicting pwd modes, ls hidden/sort/layout modes, touch timestamp sources, cp/mv overwrite modes, and rm confirmation modes. Independent flags can be combined. `-h` is useful when sizes are displayed (for example `-l`); `-R` can produce large output and has no effect with `-d`.

All fifty-one builders include bilingual labels, validation messages, syntax, explanations, practical examples, and applicable notes. File Reading & Editing contains `cat`, `less`, and `nano`; Searching contains `find` and `grep`. Command Help contains `man` and a separate `--help` generator. Users & Permissions contains `whoami`, `id`, `groups`, `sudo`, `su`, `chmod`, `chown`, and `chgrp`. Process Management contains ps, top, htop, kill, pkill, jobs, pgrep, fg, bg, and the Background Execution feature with shared learning concepts. Linux Services & Logs contains systemctl and journalctl. Networking Fundamentals contains ip, ping, ss, hostname, and curl. SSH & Remote Access contains ssh, ssh-keygen, ssh-copy-id, scp, and sftp. Package Management contains apt, apt-cache, and dpkg. Search forms group related fields and collapse advanced controls. The existing responsive shell, Snow White/Obsidian Black themes, favorites, pins, search, and empty states remain. Reset restores command defaults. Invalid output disables copy and pin actions.

## Generation conventions

- Targets/sources are entered as literal paths, one input row per operand. Add rows for multiple paths; do not type shell quotes or split a path on spaces. cp/mv serialize all sources before the destination. Multiple sources require an existing destination directory, which the app cannot verify.
- Generated flags are separated and ordered deterministically: `ls -l -a -h` is equivalent to the example `ls -lah`.
- Each path is single-quoted, with embedded apostrophes escaped using adjacent quoted segments. `$`, backticks, semicolons, wildcards, and user-entered `~` remain filename characters in the original file builders. T13 explicitly preserves `~/` expansion in local SSH key paths.
- Where supported, `--` separates target operands from options. A literal path named `-` becomes `./-`, avoiding special cd/touch behavior. Package builders instead restrict package identifiers and prefix option-looking relative file paths with `./`. Control characters, newlines, and blank required rows are rejected.
- Trusted cd presets, Background Execution and the T10 operator builders introduce explicitly selected shell syntax; that builder appends one trusted & after quoted literal tokens. For `~/Documents`, choose the home-relative preset and enter `Documents`; the result is `cd -- ~/'Documents'`. The Custom preset treats `~/Documents` literally.
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

The **Process Management** category contains nine text-only builders and a shared, collapsible bilingual concepts panel. No process list, CPU/memory metrics, job table, signals, or process simulation is accessed or executed. A process is a program instance; PID identifies it and PPID its parent. PIDs can be reused after exit. Common states are R (running/runnable), S (interruptible sleep), D (uninterruptible sleep, often I/O), T (stopped), and Z (exited zombie awaiting its parent's collection). A zombie is not a running program to terminate again.

- **ps:** one display preset emits exactly `ps`, `ps -e`, `ps -ef`, `ps aux`, or `ps -ejH`. Default procps-ng ps selects the invoking effective user and terminal, not every process on that terminal. BSD aux deliberately has no dash; do not substitute -aux. Advanced mode offers PID rows or effective username, plus comma-separated columns. The builder rejects simultaneous PID/user selection to avoid surprising ps OR-selection semantics. With no selector, custom columns retain default selection. Allowed unique columns: pid, ppid, user, stat, cmd, comm, pcpu, pmem, etime, tty; no spaces or header expressions.
- **top:** optional positive refresh seconds with at most one decimal digit, one/multiple PIDs (up to 20 entries), or effective username. PID and user filters are mutually exclusive in procps-ng. -b enables non-interactive batch output; -n limits updates in either mode; without a limit batch output continues until stopped externally. -H shows threads and, with -p, may include each monitored PID's thread group. The page documents q, P, M, T, k, r, H, 1, and h; these keys operate inside a real terminal monitor, not this app. Signal/renice keys can change state or require privileges.
- **kill:** required positive PID rows; default SIGTERM is explicit. Shared signal choices are TERM (15), KILL (9), INT (2), HUP (1), STOP (19), and CONT (18). Generated commands use names because numbers vary by architecture/platform. TERM allows program cleanup if handled; KILL cannot be caught, blocked, or ignored and prevents application cleanup, though kernel state can delay exit. STOP pauses; CONT resumes. HUP may terminate or trigger program-specific reload. Delivery/termination is never guaranteed. Zero and negative PIDs are excluded because they have process-group semantics.
- **pkill:** a required nonblank extended regex matches names (typically limited to 15 characters), or full command lines with -f. -x requires the entire selected string to match but does not disable regex metacharacters. Optional effective user -u, ignore-case -i, and echo -e are supported. Echo still sends signals when run manually; it is not a dry run. Multiple processes may match. Inspecting corresponding criteria with pgrep in a terminal can help review potential matches, but is subject to races; the pgrep builder prepares that inspection command, but neither builder executes it or evaluates regex.
- **jobs:** a Bash builtin with a job table specific to the shell session. Choose default text, -l with PIDs, or -p with process-group leader IDs, and at most one running/stopped filter. Optional job specifications support positive numeric `%1` form only. A job can contain multiple processes; its ID differs from a PID. Foreground jobs normally use terminal input while the shell waits; background jobs let the shell accept work. The fg/bg builders bring an existing job forward or resume it in the background using current/previous/numbered job selections. Non-interactive shells and job-control settings can differ.

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

Automated tests cover all forty-three builders, the help utility, option conflicts, shell quoting, numeric validation, presets/signals, permission editors, bilingual concepts/comparisons/shortcuts, safeguards, and old/new saved records. The pgrep T08 extension passed 673 tests across 24 files, strict TypeScript, and a production build. Its 37 focused browser assertions covered matching/output modes, pattern-free user/parent criteria, quoting, actual clipboard contents, compatible favorites/pins, reload preferences, the five existing process-builder previews, and mobile layout down to 320px. Desktop/mobile screenshots were inspected. No E2E dependency was added; broader accessibility/cross-browser checks remain future work. See [pgrep extension verification](docs/t08-pgrep-verification.md) and historical [T08 verification](docs/t08-verification.md), which recorded 85 browser assertions across the original five builders and twenty-one earlier previews. Earlier reports remain available for [T07](docs/t07-verification.md), [T06](docs/t06-verification.md), [T05](docs/t05-verification.md), [T04](docs/t04-verification.md), [T03](docs/t03-verification.md), and [T02](docs/t02-verification.md).

Read [architecture](docs/architecture.md), [command development](docs/command-development.md), and [roadmap](docs/roadmap.md). Command semantics reference the [GNU Coreutils manual](https://www.gnu.org/software/coreutils/manual/coreutils.html) and [Bash manual](https://www.gnu.org/software/bash/manual/bash.html).

## T08 extension: background execution and Bash job control

**Background Execution (`command &`)** is a shell-operator feature, not an executable named `&`. Enter one executable and one literal argument per row; do not type a whole shell command into the executable field. The preview quotes every user token, then appends exactly one unquoted `&`. Background execution is always enabled in this dedicated builder. For example, executable `sleep` and argument `120` generate `'sleep' '120' &`, equivalent to `sleep 120 &`. Separate argument rows `run` and `dev` with executable `npm` generate `'npm' 'run' 'dev' &`.

Executable names use a restricted ASCII subset; absolute or `./`/`../` executable paths additionally support spaces and apostrophes. Shell operators, variables, substitutions and scripts are rejected in that field. Argument rows are literal data, including spaces, hyphens, `$`, `;`, and `&`. A single empty default row means no arguments; empty rows alongside other rows are intentional empty arguments. Quoting protects shell token boundaries; it does not establish whether a program or its arguments are safe to run manually. Executable existence is not checked.

**fg** and **bg** are Bash builtins. Both default to the current job with no argument; select explicit current `%+`, previous `%-`, or a positive job number to generate `%N`. Number input excludes `%`, signs, zero, fractions and expressions, and uses the same 1-2147483647 integer subset as other process forms. Leading zeroes normalize to decimal. fg brings an existing job to the foreground and resumes it if stopped; bg resumes a stopped job asynchronously without itself creating a new process. Job `%1` belongs to the current shell's table and is not PID 1.

Manual workflow examples (replace `%1` with the actual number reported by `jobs`; number 1 is not guaranteed):

```bash
sleep 120 &
jobs
fg %1
```

```bash
sleep 120
# Press Ctrl + Z in the terminal before entering the next command.
jobs
bg %1
fg %1
```

The comment describes a key press, not a generated or automatically executed command. Ctrl + Z typically suspends the foreground job; Ctrl + C typically sends SIGINT to the foreground process group. Program and terminal settings can change their behavior. Run these steps separately in the same Bash session with job control enabled. The application displays bilingual shortcuts, concepts, examples and notes; it never creates or resumes a job.

`&` lets the shell accept work asynchronously, but background programs may still write terminal output and programs needing terminal input can stop or behave unexpectedly. It is not daemonization, a persistent service, or a guarantee of survival after logout. Other shells and non-interactive environments differ. Pipelines, redirection, nohup, disown and wait remain outside scope. All three entries support favorites and exact-text pins in existing storage version 1.

The job-control extension passed **758 tests across 27 files**, strict TypeScript checks, a production build, and **63 live Chromium assertions** covering new builders, clipboard, persistence, six existing process entries and mobile layout. See [job-control verification](docs/t08-job-control-verification.md). Broader cross-browser and accessibility checks remain future work.


## T09: Linux Services & Logs

`systemctl` and `journalctl` require a Linux environment using systemd. They do not apply directly to every distribution or container. The app generates text only: no manager connection, service change, filesystem/log access, streaming, authentication or credentials.

**systemctl:** choose status (default), start, stop, restart, reload, reload-or-restart, enable, disable, is-active, is-enabled, list-units, list-unit-files or daemon-reload. Unit actions require one literal name; lists and daemon-reload require none. Names preserve their supplied suffix and accept template instances such as `worker@blue.service`. An explicitly selected type appends `.service`, `.socket`, `.timer`, `.target` or `.mount` only to an unsuffixed name. Keep As entered for a suffixed name; no automatic `.service` is added. A numeric-only status target needs an explicit suffix/type because systemctl would otherwise interpret it as a PID. Unit paths, globs, backslash escapes and arbitrary shell expressions are outside this builder's identifier subset.

Listings use `--type` as a filter; only list-units offers `--all` for inactive loaded units. list-unit-files shows installed files instead. `--now` appears only with enable/disable: enable normally configures activation links without starting, start activates without enabling, enable --now enables and starts, and disable --now disables and stops. Active and enabled are different states. daemon-reload rereads manager/unit configuration without restarting services; reload asks a service to reload its own configuration when supported.

System manager is the default; `--user` selects the current user's manager. The optional sudo checkbox defaults off and appears only for system-manager changes. Many read-only inspections require no elevation; authorization depends on policy. Hidden stale settings are ignored when incompatible. State-changing actions show warnings, with additional downtime guidance for stop/restart-like operations and explicit privilege guidance for sudo. Existing standalone sudo behavior is unchanged.

**journalctl:** default output is exactly `journalctl`, showing all accessible journals. Explicit system scope uses `--system`; user scope uses `--user` and interprets `-u` as user-unit metadata. Filters combine: optional literal unit, positive recent entry count `-n`, follow `-f`, priority `-p`, boot selection, and since/until. A priority includes that level and more severe messages. Follow waits for new records until interrupted; it cannot combine with reverse `-r`.

Boot selection distinguishes the utility default (follow implies current boot), explicit all boots (`--boot=all`), current (`-b`), previous (`-b -1`) and signed custom offsets (`--boot=N`). Negative/zero custom offsets count from the newest retained boot; positive values count from the oldest (1 means oldest), not future boots. Old boot records may be unavailable after rotation or without persistent logging.

Time filters have separate structured/relative modes. Structured values require valid `YYYY-MM-DD HH:mm:ss` dates; two structured bounds must satisfy since <= until. They describe the target machine's local civil time, without timezone/DST resolution. Relative syntax is limited to today/yesterday/tomorrow/now or N seconds/minutes/hours/days/weeks ago (1-999999). Expressions remain quoted and are interpreted on the Linux machine, never resolved against this browser's clock. Mixed/relative ranges cannot be chronologically verified here. Entry counts and boot offsets use bounded 32-bit integer subsets.

Output choices: short (default), short-iso (ISO-style timestamps), cat (message text), json (structured records). `--no-pager` prints directly. Journal access, persistent user logging, unit existence and policy are never verified. Logs may contain sensitive data.

```bash
systemctl status -- 'nginx'
journalctl -u 'nginx.service' -n 50
sudo systemctl restart -- 'nginx'
systemctl is-active -- 'nginx'
```

These are separate manual troubleshooting steps. Inspect status and logs before considering a restart: downtime is possible and restart is not the automatic answer to every error. Options are ordered deterministically; `systemctl --now enable -- 'nginx'` and the illustrative `systemctl enable --now nginx` express the same supported action.

Both builders reuse existing bilingual forms, preview/reset/copy actions, favorites and exact-text pins in storage version 1. T09 passed 931 tests across 30 files, strict TypeScript, production build and 107 browser assertions. The build has a non-blocking main-chunk warning (about 549 kB minified / 167 kB gzip); broader accessibility/cross-browser checks remain future work. T09 verification and limitations are recorded in [the verification report](docs/t09-verification.md). Primary references: [systemctl](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html), [journalctl](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html), and [systemd time syntax](https://www.freedesktop.org/software/systemd/man/latest/systemd.time.html).


## T10: Shell Operators & Redirection

Four educational operator builders reuse the existing preview, copy/reset actions, EN/ID content, Favorites and Pins. They generate Bash-compatible text only; they never launch commands, read files, open redirection targets, or inspect the operating system. Existing T09 work and deployment settings remain intact.

- **Pipes:** add, remove and reorder 2-4 command stages. Select an existing pwd, ls, ps, cat, grep or less form, or enter one literal executable and separate argument rows. Existing generators retain their required fields: for grep/less reading only stdin, choose a literal stage instead of their file-oriented catalog forms. The selected command must actually read stdin to consume piped data. A small visual shows command A -> stdout -> pipe -> stdin -> command B; stderr is separate.
- **Output:** `>` redirects stdout and normally truncates an existing target; `>>` appends. Overwrite mode has a visible bilingual warning.
- **Input:** `<` supplies a literal file as stdin. This differs from passing a filename operand, which the program must interpret and open.
- **Standard error:** `2>` overwrites and `2>>` appends stderr. `2>&1` duplicates stdout's current destination onto stderr without a file field. Combined mode adds a stdout file and lets you choose overwrite/append and the order of that redirection and `2>&1`.

Generated examples:

```bash
ps aux | 'grep' 'nginx'
'cat' 'app.log' | 'grep' 'error' | 'less'
ls -l -a > 'files.txt'
'echo' 'Another line' >> 'output.txt'
'sort' < 'names.txt'
'wc' '-l' < 'access.log'
'ls' '/missing-directory' 2> 'errors.log'
'ls' '/missing-directory' 2>> 'errors.log'
'ls' > 'output.log' 2>&1
'ls' 2>&1 > 'output.log'
```

Redirections apply left to right. In the penultimate example both stdout and stderr use the file. In the last, stderr keeps stdout's earlier destination while only stdout goes to the file. File descriptors are 0 = stdin, 1 = stdout, and 2 = stderr. A pipe connects stdout to the next stdin and does not pipe stderr by default. `cat app.log | grep error` can be replaced by the often simpler `grep error app.log`; pipelines are not automatically necessary or more efficient. Pipelines pass data, while `&&`/`||` are conditional command chaining and remain outside scope.

Internally a composition holds typed command stages plus ordered redirection records. User arguments and paths are single-quoted once using the existing helper; selected operators alone remain unquoted syntax. Enter values without shell quotes. Spaces, apostrophes, `$`, wildcards, semicolons, and operator-like text remain literal data. Literal stages have zero argument rows initially; an added empty row means an intentional empty argument. The existing background builder retains its own empty-row convention and behavior.

Executable validation reuses the background builder's restricted name/explicit absolute-or-./../ path subset, including spaces/apostrophes in paths. Arbitrary shell scripts, operators, variables and substitutions are not parsed from the executable field. Targets must be non-empty and contain no control characters/newlines. Unknown stages/operators, extra raw fields, unsupported combinations, and invalid catalog configurations produce no preview; copy/pin stay disabled. Nested generator errors also propagate, and the existing 10,000-character preview limit applies.

Limitations: pipelines and redirections are separate builders; T10 does not attach redirects to pipeline stages or compose arbitrary descriptor graphs. Catalog stages use a small read-oriented allowlist; other programs are literal tokens and their option semantics are not verified. No pipelines nested inside stages, background composition, chaining, here-documents, substitutions, expansions, or full Bash parsing. File existence/type, program behavior, permissions, shell settings (including noclobber) and safety are not established. Running copied text manually can truncate/create files; even a command that later fails can leave a target truncated. Quoting does not make an interpreter or its arguments safe for every environment.

All four builders use stable favorite IDs and exact command-text pins in storage version 1, without changing old saved records. Configuration objects are transient React state, not a new storage format. T10 passed 1,021 tests across 33 files, strict TypeScript, a production build and 96 browser assertions. Vite reports a non-blocking main-chunk warning (about 577 kB minified / 175 kB gzip). See [T10 verification](docs/t10-verification.md) for check results and browser coverage. Shell semantics follow the official [Bash pipelines](https://www.gnu.org/software/bash/manual/html_node/Pipelines.html) and [redirections](https://www.gnu.org/software/bash/manual/html_node/Redirections.html) references.


## T11: group ownership and htop

**chgrp** is in Users & Permissions. Choose a direct group name/GID or a reference file, supply one or more literal targets, and optionally select recursion (-R), verbose (-v) or changes-only (-c) reporting, and explicit sudo. Reporting choices are exclusive. Reference mode emits --reference=FILE and no group operand; direct mode ignores hidden reference input. Shared path quoting protects spaces, apostrophes and leading hyphens with -- before operands. A lone target - uses the existing ./- convention.

Group names use the existing common-name subset (start with a letter or underscore; no spaces/domain-qualified names). Numeric input accepts decimal GIDs 0-4294967294, excluding the reserved all-ones value. The builder normalizes leading zeroes and emits GNU +GID to force numeric-ID interpretation rather than first looking up a numeric-looking group name. This is a deliberate GNU/Linux convention, not a discovered limit on the user's machine. User/group existence and membership are never queried.

```bash
chgrp -- 'developers' 'app.log'
chgrp -- '+1001' 'data.csv'
chgrp -c -- 'staff' 'report.txt'
chgrp --reference='group template.txt' -- 'project files'
sudo chgrp -R -- 'developers' '/srv/project'
```

chgrp changes group ownership; chown can change user and/or group; chmod changes permission bits. The shared-project example does not automatically grant group write permission. Authorization depends on ownership, group membership, privileges and system/filesystem policy; sudo is not always needed and defaults off. Recursive changes can affect many descendants and disrupt system directories. Review targets and symlinks before manually running commands. No file metadata, credentials or actual ownership are accessed by this app.

**htop** is in Process Management. It generates the default command or combines common username filtering, positive comma-separated PIDs, refresh delay, sorting, tree view and read-only mode. Empty comma entries around valid PIDs are removed, spaces trimmed, and leading zeroes normalized. Zero, negative and malformed PIDs are rejected; a nonempty comma-only list is invalid rather than silently dropping a requested filter. The existing PID subset is 1-2147483647. Unlike this app's top builder, username and PID filters can be combined here.

```bash
htop
htop -u 'developer' -p 1234,5678
htop -d 20 -s PERCENT_CPU
htop -s PERCENT_MEM -t --readonly
```

-d means tenths of a second: 10 is approximately one second; 20 is two seconds, not milliseconds. This builder accepts integers 1-100, matching the documented range before upstream htop clamps values. Sorting is limited to PID, PERCENT_CPU and PERCENT_MEM. Fields and tree/sort interactions vary by installed version and platform; supported versions sort tree children within each parent. The local command `htop --sort-key=help` can list available fields when run manually. Default sort/delay defer to the installed configuration.

The bilingual shortcut table documents F1 help, F2 setup, F3 search, F4 filter, F5 tree, F6 sort, F9 signal and F10 quit. These are keys inside an actual terminal htop session, not command-line options or browser actions. Sending signals or changing priorities can interrupt applications and may require privileges. --readonly restricts process/system-changing features where supported; it is not a security sandbox. CPU/memory concepts and process trees are explanations only: no monitor, metrics, process list or terminal is simulated.

htop may require separate installation. Ubuntu documentation-only example: `sudo apt install htop`. Package availability, permissions, terminal shortcuts and options vary; installation is never performed by the app. Target the GNU/Linux and modern htop behavior documented here, checking the installed manual when using copied commands.

Both builders reuse EN/ID content, the Snow White/Obsidian Black themes, clipboard, reset, Favorites and exact-text Pins. Storage schema version 1 and all old saved commands remain compatible. T11 passed **1,125 tests across 36 files**, strict TypeScript, the production build and **100 browser assertions**. Vite retains a non-blocking bundle warning around 598 kB minified / 182 kB gzip. See [T11 verification](docs/t11-verification.md).

Primary references: [GNU chgrp](https://www.gnu.org/software/coreutils/manual/html_node/chgrp-invocation.html), [GNU name/ID disambiguation](https://www.gnu.org/software/coreutils/manual/coreutils.html#Disambiguating-names-and-IDs), and [upstream htop manual](https://github.com/htop-dev/htop/blob/main/htop.1.in).

## T12: Networking Fundamentals

The new **Networking Fundamentals** category contains read-only `ip` address/link/route views, ICMP `ping`, socket inspection with `ss`, hostname information, and an HTTP `curl` request builder. Every form uses the same EN/ID preview, copy, favorite and pin flows. No network command runs and no browser request is sent.

Examples of generated text (literal operands are deliberately quoted):

```bash
ip addr show dev 'eth0'
ip -br link show
ping -c 4 -- 'example.com'
ss -4 -tln
hostname -I
curl -I -- 'https://example.com'
curl -X POST -H 'Content-Type: application/json' --data '{"name":"test"}' -- 'http://localhost:3000/api/items'
```

`ip` places `-4`, `-6`, and supported `-br` global options before `addr`, `link`, or `route`. `dev` is only offered for address/link views. `ping` requires a hostname or IP address; count and timeouts must be positive, and this beginner builder requires intervals of at least 0.2 seconds. An unbounded ping normally continues until Ctrl+C when run manually. `ss` offers exclusive protocol, state and address-family choices; summary `-s` is a separate view. `hostname -i` depends on name resolution, while `-I` enumerates configured addresses on implementations that support it. The exact output and available options depend on the Linux distribution and installed versions.

`curl` accepts complete HTTP/HTTPS URLs, including localhost and IPv6 literals. GET omits `-X`; HEAD uses `-I`; POST/PUT/PATCH/DELETE use explicit `-X`. Headers are entered as name/value pairs. Body text uses `--data`, or `--data-raw` for a leading `@` so curl will not read it as a filename. `--globoff` is added for bracket/brace URL text to avoid curl URL globbing. URLs, headers, bodies and output paths are shell-quoted as literals. Embedded URL credentials are rejected. Any custom header, body or URL query requires an explicit decision before the generated command can be pinned; favorites store only the command ID. Pins are plain-text localStorage, so avoid secrets even when choosing to save. The output-file option can overwrite a file when the copied command is run. The builder does not offer insecure TLS bypass (`-k`).

Troubleshooting workflow: inspect `ip addr show` and `ip route show` for local configuration, `ping -c 4 8.8.8.8` for ICMP reachability, `ping -c 4 example.com` for name resolution plus ICMP, `ss -tuln` for local listeners, then `curl -I http://localhost:3000` for an HTTP endpoint on the machine running curl. Each step checks a different layer; successful ping does not prove a web application works. `ip` and `ss` are commonly supplied by iproute2, while other tools may need installation on a given distribution. This app cannot verify tools, network state, service availability, DNS, or credentials.

No dependencies, backend, storage migration, or network access were added. See [T12 verification](docs/t12-verification.md) for executed checks and limitations. Command semantics follow the [ip](https://man7.org/linux/man-pages/man8/ip.8.html), [ping](https://man7.org/linux/man-pages/man8/ping.8.html), [ss](https://man7.org/linux/man-pages/man8/ss.8.html), [hostname](https://manpages.debian.org/wheezy/hostname/hostname.1.en.html), and [curl](https://curl.se/docs/manpage.html) manuals.

## T13: SSH & Remote Access

The SSH & Remote Access category provides `ssh`, `ssh-keygen`, `ssh-copy-id`, `scp`, and `sftp` builders. All five use the EN/ID learning panel, preview, copy, Favorites, and version-1 Pins. The app never opens a connection, creates a key, or transfers a file.

```bash
ssh -p 2222 'developer@example.com'
ssh-keygen -t ed25519 -C 'my-laptop'
ssh-copy-id -i ~/'.ssh/id_ed25519.pub' 'developer@192.168.1.20'
scp -r './project' 'developer@example.com:/home/developer/'
sftp -P 2222 'developer@example.com'
```

The quotes preserve literal shell arguments; `~/` is the only trusted home expansion in local key paths. Generate a key locally, keep the private key on the client, install only its `.pub` key in the remote account's `authorized_keys`, verify the server host-key fingerprint, then connect. `known_hosts` records accepted host keys. A key passphrase differs from an account password. On the relevant Linux machine/account, common permissions are `chmod 700 ~/.ssh`, `chmod 600 ~/.ssh/authorized_keys`, and `chmod 600 ~/.ssh/id_ed25519`; ownership and server policy also matter. Windows OpenSSH uses Windows paths and ACLs, so those chmod examples are not universal Windows instructions.

For `Permission denied (publickey)`, check the remote username, selected private key, installed public key, server permissions, and server configuration. `Invalid user` suggests the account may not exist. `Connection refused` can indicate a closed or rejected SSH port, while a timeout can involve routing, firewall, or host availability. Investigate unexpected `Host key verification failed` rather than disabling host-key checks. `Enter passphrase for key` asks for the private-key passphrase, not necessarily the remote account password.

`scp` supports local-to-remote and remote-to-local file/directory transfers; directory modes add `-r`. It uses uppercase `-P` for the port, unlike `ssh` and `ssh-copy-id` with lowercase `-p`. This builder targets modern OpenSSH SCP using SFTP internally. It does not support legacy `-O`, remote globs, or remote-to-remote transfers. A copied transfer command may overwrite files. `sftp` opens an interactive session; its `pwd`, `lpwd`, `get`, and `put` references are typed inside that session, not in the ordinary shell. SSH remote-command composition is out of scope because remote shell parsing needs separate safeguards.

Favorites store command IDs and pins store exact command text in plain browser localStorage. Do not enter passwords, passphrases, key contents, or authentication tokens. Hostnames, usernames, and paths may also be sensitive; review them before pinning. No storage migration or dependency was added. See [T13 verification](docs/t13-verification.md). Command syntax was checked against the [OpenSSH ssh](https://man.openbsd.org/ssh), [ssh-keygen](https://man.openbsd.org/ssh-keygen), [scp](https://man.openbsd.org/scp), [sftp](https://man.openbsd.org/sftp), and [ssh-copy-id](https://man7.org/linux/man-pages/man1/ssh-copy-id.1.html) manuals.

## T14: Package Management

The **Package Management** category adds `apt`, `apt-cache`, and `dpkg` for Debian/Ubuntu systems. `apt` has update, upgrade, full-upgrade, install, remove, purge, autoremove, search, show, and list actions. Install supports `--no-install-recommends` and `--reinstall`; package-changing actions can offer `-y` and an explicitly selected `sudo`. List supports `--installed` and `--upgradable`. `apt-cache` offers read-only search, show, depends, rdepends, policy, and pkgnames queries. `dpkg` offers status, installed-file and ownership queries, local `.deb` installation, removal, purge, and archive inspection.

```bash
sudo apt update
apt search 'nginx'
apt show 'nginx'
sudo apt install 'nginx'
systemctl status nginx
apt-cache policy 'nginx'
dpkg --contents './package.deb'
```

`apt update` refreshes package indexes; `apt upgrade` updates installed packages, while `apt full-upgrade` may remove packages to resolve dependencies. `remove` usually leaves package-managed configuration; `purge` removes it. `autoremove` proposes unused automatic dependencies. `-y` accepts supported prompts, so review changes first. `apt-cache` reads cached metadata and may show outdated information. `dpkg -i` installs a local archive but does not resolve missing dependencies like APT; `sudo apt install ./package.deb` is an educational alternative when dependencies are available. Installation does not guarantee a running service, and not every package provides one.

Package-name inputs accept a conservative literal Debian name with optional architecture suffix such as `libc6:amd64`; version/release selectors and APT pattern expressions are outside this builder. Search terms remain quoted literal shell arguments for APT's own pattern matching. Local `.deb` paths containing spaces are quoted; relative paths beginning with `-` gain `./` before quoting. The app cannot verify package availability, dependency plans, privileges, or file contents. APT and dpkg are Debian-family tools, not universal across Linux distributions. See the [T14 verification record](docs/t14-verification.md) and the [Debian apt](https://manpages.debian.org/testing/apt/apt.8.en.html), [apt-cache](https://manpages.debian.org/trixie/apt/apt-cache.8.en.html), and [dpkg](https://manpages.debian.org/trixie/dpkg/dpkg.1.en.html) manuals.
