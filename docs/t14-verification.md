# T14 verification

Checked on 2026-11-11 in the existing React/Vite workspace.

| Check | Result |
|---|---|
| `npm.cmd run typecheck` | Passed |
| `npm.cmd test` | Passed: 1,241 tests across 45 files |
| `npm.cmd run build` | Passed: Vite 8.3.4 static build |
| ESLint | Not configured in `package.json` |
| Live browser check | Not run in T14; T13's headless Edge attempt crashed before page inspection |

T14 tests cover action and option combinations, literal Debian package names, quoted search patterns, local `.deb` paths with spaces or leading hyphens, invalid inputs, contextual bilingual warnings, conditional React form rendering, and version-1 Favorites/Pins compatibility. The full suite covers all prior builders and the shared localization, storage, copy, and theme logic. Static rendering checks the three package workspaces in both languages; live browser interaction and visual layout remain unverified in this task.

The build emitted a non-failing warning for a JavaScript chunk over 500 kB after minification. The builder cannot check configured repositories, package availability, version candidates, dependencies, privileges, installed files, or archive contents. Package-name validation intentionally supports a conservative literal subset with optional architecture suffix; version/release selectors, APT patterns, and advanced dpkg options remain outside T14.

No backend, database, package execution, dependency, storage migration, commit, push, tag, or release was added.
