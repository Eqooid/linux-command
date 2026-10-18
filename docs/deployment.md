# GitHub Pages deployment

This static React application needs only GitHub Actions and GitHub Pages. Both local `origin/HEAD` and a live `git ls-remote --symref origin HEAD` check identify `master`, so both workflows target `master`, rather than `main`. If the default branch is renamed, update both workflow branch filters and any environment deployment rules together. The remote owner is determined from `git remote -v`; GitHub Actions resolves the repository and published URL from its own context.

## Pipeline

- `.github/workflows/ci.yml`: pull requests targeting `master` and pushes to `master` run on Ubuntu with Node.js 24. The token has only `contents: read`.
- `.github/workflows/deploy.yml`: only pushes to `master` deploy. Its build job independently runs required validation, builds once, and uploads `dist/`. The deploy job requires that build job to succeed. There is no cross-workflow timing dependency on CI.
- Both use `npm ci`, `npm run typecheck`, `npm test` (already `vitest run`), and `npm run build`. npm caching saves downloads, while `npm ci` installs the exact lockfile and fails if it disagrees with `package.json`. It never silently repairs the lockfile.
- ESLint has no dependency, configuration, or script in this repository. No lint result is claimed. If lint is introduced, add the required `npm run lint` step to both workflows before building.
- A build artifact is the packaged HTML, JavaScript, CSS, and other files produced in `dist/`. `upload-pages-artifact` sends only that directory to GitHub; `deploy-pages` publishes the same artifact. Failed installation, type checks, tests, builds, or uploads prevent the deploy job from starting.
- Only the deploy job has `contents: read`, `pages: write`, and `id-token: write`. These allow repository metadata access, Pages publication, and a short-lived identity token proving which workflow is deploying. No personal token or deployment secret is needed. Checkout does not persist credentials.
- The `github-pages` environment records the deployment URL. Concurrency allows only one production workflow at a time and lets an active run finish. Each workflow has one production build; CI and deployment intentionally validate independently on pushes.

Action majors were checked against official releases on 18 October 2026: [checkout v7](https://github.com/actions/checkout/releases/latest), [setup-node v7](https://github.com/actions/setup-node/releases/latest), [configure-pages v6](https://github.com/actions/configure-pages/releases/latest), [upload-pages-artifact v5](https://github.com/actions/upload-pages-artifact/releases/latest), and [deploy-pages v5](https://github.com/actions/deploy-pages/releases/latest).

## Enable Pages on GitHub

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, select **GitHub Actions** as the source.
4. In **Settings → Actions → General**, ensure Actions and the official actions used here are allowed. Repository/organization policies must permit the deployment job's explicit Pages and identity-token permissions. No broad default write-token access is necessary.
5. Check **Settings → Environments → github-pages**. If branch restrictions or approvals exist, allow `master` and satisfy any required approval.
6. Review, commit, and push the workflow/configuration changes to `master` yourself. No commit, push, or repository setting change was performed as part of this implementation.
7. Open **Actions**. Confirm CI and **Deploy to GitHub Pages** succeed, then follow the deployment URL from the environment or **Settings → Pages**.

Pages availability and site visibility depend on the GitHub account plan, repository visibility, and organization/repository policies. See [GitHub's Pages setup documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

The project URL format is `https://<repository-owner>.github.io/linux-command/`. The inspected remote is `https://github.com/Eqooid/linux-command.git`, giving the expected URL <https://eqooid.github.io/linux-command/>. Hosting has not been verified. No owner is embedded in application configuration or workflows.

## Local production verification

Use Node.js 24 and run:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run preview
```

In PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`. Visit `http://localhost:4173/linux-command/` (or the port printed by Vite). `dist/index.html` should reference `/linux-command/assets/...` for JavaScript and CSS. Vite preview is only for local verification.

`vite.config.ts` uses `/linux-command/` in production and `/` in development/tests, with no extra environment variables. There is no custom domain configuration. If you later add a custom domain serving the site at its root, change the production base to `/`; if renaming the repository, change its base accordingly. Vite's CLI `--base` can override the configured base for a one-off build.

Navigation is React state, not pathname routing. Commands, Favorites, Pins, and categories do not change the URL. Opening or refreshing `/linux-command/` loads the application; refresh resets the current selection, as before. Invented paths such as `/linux-command/favorites` are not supported routes. No HashRouter, BrowserRouter, or 404 fallback is required.

Check theme and language switching, favorite and pin a command, reload, and confirm saved preferences and text remain. Check navigation and layout at desktop and mobile widths, including opening the mobile menu. localStorage belongs to the browser origin: localhost data does not transfer to the GitHub Pages origin, and different paths on the same origin share storage. Existing schema and storage keys are unchanged.

Current icons are bundled inline SVG components; no external images/fonts or root-relative public assets were found. Future assets should use source imports (so Vite rewrites paths), or `import.meta.env.BASE_URL` for public-directory URLs. Avoid literal `/assets/...` URLs. Vite transforms the `/src/main.tsx` entry in source `index.html` during build; it is not a production URL.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Blank page | Open the browser console; confirm production base `/linux-command/`, the project URL, and a successful deployment of the latest build. |
| CSS or JavaScript returns 404 | Inspect `dist/index.html`; generated asset URLs must include `/linux-command/`. Upload the entire `dist/`, with its `assets/` directory. |
| Client-side navigation returns 404 | Use the project root URL. Current navigation does not create URL routes. If routing is added later, prefer hash routing for Pages or implement and test a fallback deliberately. |
| Pages permission/deployment error | Select GitHub Actions as the Pages source; check Actions policy, explicit deploy-job permissions, and environment branch/approval restrictions. Confirm your plan and repository visibility support Pages. |
| `npm ci` fails | Commit `package-lock.json`. For intentional dependency changes, run `npm install` locally and review/commit both manifests; do not replace CI's `npm ci`. |
| Failed tests block publishing | Inspect the failing Actions step, reproduce with `npm test`, fix the problem, and push a new commit. Do not bypass checks or publish an older artifact. |
| Workflow does not run | Filters target `master`. Check the remote default branch and both YAML files after any branch rename. |

## Implementation verification (18 October 2026)

- Node.js v24.9.0 / npm 11.6.2: `npm.cmd ci --offline --no-audit --no-fund` passed using the existing npm cache (138 packages installed). The lockfile and package scripts were unchanged. Hosted workflows use normal `npm ci`.
- `npm.cmd run typecheck`: passed.
- `npm.cmd test`: 620 tests passed across 21 files.
- `npm.cmd run build`: passed; generated HTML references JavaScript and CSS under `/linux-command/assets/`.
- Resolved Vite configuration: development `/`, test `/`, production `/linux-command/`.
- Installed headless Chrome against the production preview: 19 assertions passed, with no runtime exceptions or application network failures. Coverage included direct root navigation, refresh, JavaScript/CSS responses and MIME types, applied CSS, initialization, both languages/themes, favorite/pin persistence, navigation, and responsive widths 1440/390/320px including mobile menu behavior. Chrome's automatic optional `/favicon.ico` request returned 404; this project has no favicon asset. No browser-testing dependency was installed.
- ESLint: not configured, so not run. `git diff --check`: passed.

No hosted workflow success or live-site verification is implied by local checks. The remaining deployment steps require the repository owner to enable Pages and push the reviewed changes.
