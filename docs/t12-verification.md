# T12 verification — Networking Fundamentals

Executed on 2026-11-11 in the existing Windows workspace. Generated Linux text was never executed, and the app made no network requests as part of its builders. The browser checks used the local Vite development server only.

| Check | Result |
| --- | --- |
| `npm.cmd run typecheck` | Passed (strict `tsc -b`) |
| `npm.cmd test` | Passed: 1,180 tests across 39 files |
| `npm.cmd run build` | Passed: Vite 8.3.4, 2,096 modules, output in `dist/` |
| ESLint | Not configured in `package.json` |
| Headless Edge local UI | 25 assertions passed |

The UI checks opened the new category, selected all five commands, changed options and inputs, checked previews and invalid-state action disabling, tested curl body pin consent and exact-preview invalidation, verified a saved pin/favorite, changed EN/ID and light/dark preferences, reloaded to confirm persistence, and opened mobile navigation at 375px. A separate Edge check copied a generated curl command and verified the exact clipboard text. The existing full test suite also rendered every workspace in both languages and checked storage schema compatibility with older pins.

The production build emitted a nonblocking 500 kB chunk warning: the main JS bundle was about 633 kB minified / 193 kB gzip. No new runtime dependency was installed. Browser checks were local and focused; broader cross-browser and assistive-technology testing remains future work.

## Compatibility and safety limits

- The builders target common Linux iproute2, iputils ping, ss, hostname, and curl behavior. Installed versions may differ; no tool presence, interface, DNS result, route, socket, service, or file is verified.
- `ip` only emits read-only `show` operations. `ping` uses a conservative positive numeric subset; `-w` is whole seconds and the interval is at least 0.2 seconds in this builder. Unbounded ping may continue until interrupted when manually run.
- `ss -s` is a separate summary view. `hostname -i` can differ from `-I`, and `-I` availability depends on the hostname implementation.
- Curl allows HTTP/HTTPS only, rejects URL-embedded credentials, and never sends a browser request. Custom headers, bodies and URL queries require explicit pin consent. Pins remain plain text; this cannot detect every possible secret in a path or ordinary text. A copied command can still expose secrets in shell history or process listings. `-o` may overwrite a file when manually run.
- Shell quoting prevents unintended shell expansion of user-provided values but does not establish trust in the target or make running a copied command risk-free.

Primary command references: [ip](https://man7.org/linux/man-pages/man8/ip.8.html), [ping](https://man7.org/linux/man-pages/man8/ping.8.html), [ss](https://man7.org/linux/man-pages/man8/ss.8.html), [hostname](https://manpages.debian.org/wheezy/hostname/hostname.1.en.html), and [curl](https://curl.se/docs/manpage.html).
