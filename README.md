# Elle's Gearbox

<img src="assets/icon.png" alt="Elle's Gearbox: an orange toolbox with a cream sprocket on petrol" width="128" height="128">

**Your tools. Your setup. Ready to code.**

A personal, declarative VS Code extension pack for a Windows and WSL development
setup. Install one pack to request the extension selection; no extension runtime
or activation code is included.

The current inventory contains **40 distinct extensions** from the default
profile: 11 on Windows and 37 in WSL, with overlap. The manifest has **25 direct
entries**; another **15 extensions** are supplied through nested packs.

## Nested packs

VS Code resolves `extensionPack` entries recursively. This pack includes:

| Parent | Indirectly included extensions |
| --- | --- |
| Catppuccin Pack | Catppuccin theme and icons |
| Extension Pack for Java | Java language support, debugger, tests, Maven, Gradle, and project manager |
| Spring Boot Extension Pack | Spring Boot tools, Initializr, and dashboard |
| OpenAI ChatGPT/Codex extension | Codex audio |
| Python | Python Debugger, Pylance, and Python Environments |

An extension can provide functionality and also declare pack members. The OpenAI
extension is retained for both purposes. Members are not redundantly listed at
the top level. Functional `extensionDependencies` are left to their owning
extensions; they are not used to minimize this pack.

In the source project, `package.json` contains the install list and
`extensions.snapshot.json` contains the complete reference inventory, source
labels, observed versions, and nested membership. The snapshot is not included
in the installed VSIX.

## Complete extension selection

The table includes both standalone extensions and every member of the nested
packs. Follow a Marketplace link to see an extension's description and
requirements. "Direct entry" means this pack lists the extension explicitly;
otherwise, the named parent pack supplies it.

<!-- extension-inventory:start -->

All **40 extensions** in the reference inventory:

| Extension ID | Included through |
| --- | --- |
| [asispts.neo-git-graph](https://marketplace.visualstudio.com/items?itemName=asispts.neo-git-graph) | Direct entry |
| [bruno-api-client.bruno](https://marketplace.visualstudio.com/items?itemName=bruno-api-client.bruno) | Direct entry |
| [catppuccin.catppuccin-vsc](https://marketplace.visualstudio.com/items?itemName=catppuccin.catppuccin-vsc) | [catppuccin.catppuccin-vsc-pack](https://marketplace.visualstudio.com/items?itemName=catppuccin.catppuccin-vsc-pack) |
| [catppuccin.catppuccin-vsc-icons](https://marketplace.visualstudio.com/items?itemName=catppuccin.catppuccin-vsc-icons) | [catppuccin.catppuccin-vsc-pack](https://marketplace.visualstudio.com/items?itemName=catppuccin.catppuccin-vsc-pack) |
| [catppuccin.catppuccin-vsc-pack](https://marketplace.visualstudio.com/items?itemName=catppuccin.catppuccin-vsc-pack) | Direct entry |
| [codezombiech.gitignore](https://marketplace.visualstudio.com/items?itemName=codezombiech.gitignore) | Direct entry |
| [donjayamanne.githistory](https://marketplace.visualstudio.com/items?itemName=donjayamanne.githistory) | Direct entry |
| [dooez.alt-catppuccin-vsc](https://marketplace.visualstudio.com/items?itemName=dooez.alt-catppuccin-vsc) | Direct entry |
| [eamodio.gitlens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) | Direct entry |
| [fedaykindev.openchamber](https://marketplace.visualstudio.com/items?itemName=fedaykindev.openchamber) | Direct entry |
| [git-ai.git-ai-vscode](https://marketplace.visualstudio.com/items?itemName=git-ai.git-ai-vscode) | Direct entry |
| [github.vscode-github-actions](https://marketplace.visualstudio.com/items?itemName=github.vscode-github-actions) | Direct entry |
| [gitlab.gitlab-workflow](https://marketplace.visualstudio.com/items?itemName=gitlab.gitlab-workflow) | Direct entry |
| [golang.go](https://marketplace.visualstudio.com/items?itemName=golang.go) | Direct entry |
| [graphql.vscode-graphql](https://marketplace.visualstudio.com/items?itemName=graphql.vscode-graphql) | Direct entry |
| [graphql.vscode-graphql-syntax](https://marketplace.visualstudio.com/items?itemName=graphql.vscode-graphql-syntax) | Direct entry |
| [johnpapa.vscode-peacock](https://marketplace.visualstudio.com/items?itemName=johnpapa.vscode-peacock) | Direct entry |
| [mechatroner.rainbow-csv](https://marketplace.visualstudio.com/items?itemName=mechatroner.rainbow-csv) | Direct entry |
| [moshfeu.compare-folders](https://marketplace.visualstudio.com/items?itemName=moshfeu.compare-folders) | Direct entry |
| [ms-edgedevtools.vscode-edge-devtools](https://marketplace.visualstudio.com/items?itemName=ms-edgedevtools.vscode-edge-devtools) | Direct entry |
| [ms-python.debugpy](https://marketplace.visualstudio.com/items?itemName=ms-python.debugpy) | [ms-python.python](https://marketplace.visualstudio.com/items?itemName=ms-python.python) |
| [ms-python.python](https://marketplace.visualstudio.com/items?itemName=ms-python.python) | Direct entry |
| [ms-python.vscode-pylance](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance) | [ms-python.python](https://marketplace.visualstudio.com/items?itemName=ms-python.python) |
| [ms-python.vscode-python-envs](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-python-envs) | [ms-python.python](https://marketplace.visualstudio.com/items?itemName=ms-python.python) |
| [ms-vscode-remote.remote-wsl](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) | Direct entry |
| [ms-vscode.makefile-tools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.makefile-tools) | Direct entry |
| [openai.chatgpt](https://marketplace.visualstudio.com/items?itemName=openai.chatgpt) | Direct entry |
| [openai.codex-audio](https://marketplace.visualstudio.com/items?itemName=openai.codex-audio) | [openai.chatgpt](https://marketplace.visualstudio.com/items?itemName=openai.chatgpt) |
| [redhat.java](https://marketplace.visualstudio.com/items?itemName=redhat.java) | [vscjava.vscode-java-pack](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack) |
| [shd101wyy.markdown-preview-enhanced](https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced) | Direct entry |
| [vmware.vscode-boot-dev-pack](https://marketplace.visualstudio.com/items?itemName=vmware.vscode-boot-dev-pack) | Direct entry |
| [vmware.vscode-spring-boot](https://marketplace.visualstudio.com/items?itemName=vmware.vscode-spring-boot) | [vmware.vscode-boot-dev-pack](https://marketplace.visualstudio.com/items?itemName=vmware.vscode-boot-dev-pack) |
| [vscjava.vscode-gradle](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-gradle) | [vscjava.vscode-java-pack](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack) |
| [vscjava.vscode-java-debug](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-debug) | [vscjava.vscode-java-pack](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack) |
| [vscjava.vscode-java-dependency](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-dependency) | [vscjava.vscode-java-pack](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack) |
| [vscjava.vscode-java-pack](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack) | Direct entry |
| [vscjava.vscode-java-test](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-test) | [vscjava.vscode-java-pack](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack) |
| [vscjava.vscode-maven](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-maven) | [vscjava.vscode-java-pack](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack) |
| [vscjava.vscode-spring-boot-dashboard](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-spring-boot-dashboard) | [vmware.vscode-boot-dev-pack](https://marketplace.visualstudio.com/items?itemName=vmware.vscode-boot-dev-pack) |
| [vscjava.vscode-spring-initializr](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-spring-initializr) | [vmware.vscode-boot-dev-pack](https://marketplace.visualstudio.com/items?itemName=vmware.vscode-boot-dev-pack) |

<!-- extension-inventory:end -->

This table is generated from the saved inventory by `npm run sync -- ... --write`.
`npm run validate` rejects a stale table before packaging. Upstream pack changes
can still affect a fresh installation until the inventory is refreshed.

## Build a local VSIX

Requirements: Node.js **22.14+ on the 22.x line, or 24.10+**, and npm. CI uses
Node.js 22. VS Code **1.85 or newer** can
recognize this pack; individual extensions may require a newer VS Code version.

```sh
npm ci
npm test
npm run package
```

The package command validates the saved inventory and creates
`elles-gearbox-0.1.0.vsix` in the project directory. The VSIX contains only
the manifest, PNG icon, and documentation, plus packaging metadata. Development tooling,
tests, and the inventory snapshot are excluded.

The publisher `elmar-local` is a **local placeholder**, not a claim to a registered
Marketplace publisher. Publisher registration and Marketplace publication are
separate work. GitHub releases do not publish the extension to the Marketplace.

The source, documentation, and original artwork are licensed under
[MIT](./LICENSE). Third-party extensions retain their own licenses.
The npm `private` flag prevents accidental npm publication; it does not make
this GitHub repository or its release downloads private.

## Automated GitHub releases

Download published VSIX packages from
[GitHub Releases](https://github.com/ellevaoche/elles-gearbox/releases).
The filenames contain the release version, for example
`elles-gearbox-1.0.0.vsix`. Local builds use the version in `package.json`
(initially `0.1.0`); substitute the downloaded filename in installation commands.

Every pull request to `main` and every push to `main` runs tests and builds the
pack on Linux and Windows. CI stores validation VSIX files as workflow artifacts.
Only successful pushes to `main` can publish a release, after both builds pass.

Use Conventional Commits:

| Commit | Release |
| --- | --- |
| `fix: correct an extension reference` | Patch, such as `1.0.0` to `1.0.1` |
| `feat: add a development tool` | Minor, such as `1.0.0` to `1.1.0` |
| `feat!: replace the installation contract` | Major, such as `1.0.0` to `2.0.0` |
| Any type with a `BREAKING CHANGE:` footer | Major |
| `chore: update development tooling` | None |
| `docs: clarify setup`, `test: extend coverage`, `ci: adjust builds` | None |

A breaking `chore!:` also causes a major release. Several commits in one push
produce at most one release, using the highest required bump. A maintenance-only
push creates no release; maintenance changes are included in the next release.
Squash-merged pull requests need a Conventional Commit PR title because that
becomes the commit message on `main`.

The first automated release starts at **1.0.0** when there is no existing release
tag. After that, semantic-release derives the next version from reachable `v*`
tags and commit history, not the development version in `package.json`.

The release job:

1. Analyzes commits since the last release and generates release notes.
2. Updates the package version and lockfile in the runner checkout only.
3. Builds a VSIX with that version in its manifest and filename.
4. Creates the Git tag and GitHub Release and uploads the exact versioned VSIX.

Version changes are not committed back to `main`; Git tags and GitHub Releases
are the release source of truth. [Changelog](./CHANGELOG.md) links to that history.
Do not manually tag new versions or bump the manifest for normal releases.

Only GitHub's built-in `GITHUB_TOKEN` is needed, with `contents: write` limited
to the release job. No npm, Marketplace, or Azure publishing token is used.
No release is published from a pull request. The workflow has serialized runs
per branch and pinned action revisions.

## Logo

The original logo combines a toolbox with a bicycle sprocket. Deep petrol
(`#142F35`), warm orange (`#F5A34B`), and cream (`#F8EBD5`) keep the mark clear
without lettering at small sizes.

- `assets/gearbox.svg`: editable vector master, excluded from the VSIX.
- `assets/icon.png`: 256 x 256 PNG used by VS Code and the Marketplace.

To regenerate the PNG with the optional CairoSVG conversion tool:

```sh
cairosvg assets/gearbox.svg -o assets/icon.png
```

Larger exports can be made to a separate file using `-s 4` for 1024 x 1024.
CairoSVG is an artwork tool,
not a dependency of the extension or its normal build.

Packaging resolves README image and documentation links against the public
GitHub repository. The PNG is also embedded in the VSIX as the extension icon.

## Install on another computer

1. Copy the generated VSIX to that computer.
2. Open Extensions in VS Code.
3. Select **Install from VSIX...** from the Extensions view's menu.
4. Choose the file and allow VS Code to install its referenced extensions.
5. Review installation errors and platform-specific skips.

Alternatively, use the appropriate **local client** CLI:

```sh
code --install-extension ./elles-gearbox-0.1.0.vsix
```

Internet access to the Marketplace is normally required. The VSIX references
other extensions; it does not embed their code and is not an offline backup.

### Windows and WSL

A CLI inside a WSL window can manage only the WSL extension host. Use the Windows
client for local UI extensions and Remote - WSL. Open the desired WSL workspace
and check its Extensions view for extensions that need installation there. If
the pack is not present on the WSL side, install the same VSIX through that
window or its remote CLI and review placement.

VS Code chooses installation and activation locations according to each
extension's capabilities and the current environment. A single pack does not
preserve the original Windows/WSL placement mapping. Remote - WSL is relevant
to Windows-based WSL usage; it may not install or be useful on other platforms.

## Maintain the inventory

The maintenance script reads explicit VS Code `extensions.json` registries and
their installed manifests. It does not read settings, credentials, or runtime
data. Paths are supplied locally and are not stored in the snapshot.

For the default profile, typical registry locations are:

- Windows: `%USERPROFILE%\.vscode\extensions\extensions.json`
- WSL: `~/.vscode-server/extensions/extensions.json`
- Local Linux: `~/.vscode/extensions/extensions.json`

The selection uses the Windows and WSL **default profile**. Do not point
the script at a shared registry when you intend to select only a different
profile's subset. Supply the correct profile registry, with resolvable installed
manifest locations, or prepare a filtered registry first. `code --list-extensions
--profile "Profile Name"` can help confirm membership, but its text output is not
a registry and does not include the nested-pack metadata this script needs.

### Preview, then explicitly apply

Run from WSL, replacing the Windows account and paths as appropriate:

```sh
npm run sync -- \
  --source "windows=/mnt/c/Users/YOUR_ACCOUNT/.vscode/extensions/extensions.json" \
  --source "wsl=$HOME/.vscode-server/extensions/extensions.json"
```

This is **preview only**. It reports inventory additions/removals, changed pack
relations, observed versions/source changes, direct-list changes, and whether
the README inventory needs updating.

After reviewing, repeat the same command with `--write`:

```sh
npm run sync -- \
  --source "windows=/mnt/c/Users/YOUR_ACCOUNT/.vscode/extensions/extensions.json" \
  --source "wsl=$HOME/.vscode-server/extensions/extensions.json" \
  --write
```

Always supply **all selected sources**. Previously captured source labels are
required on future updates to prevent accidental deletion of one installation's
extensions. Adding another source is supported; deliberately removing or
renaming a source is a scope change requiring a reviewed snapshot adjustment.
Run where all source registries and installed directories are accessible.
Windows URI paths in registries are mapped to `/mnt/<drive>/...` on WSL; other
mount layouts need registry paths that resolve in the environment running Node.

The script normalizes IDs, excludes built-ins and this pack, deduplicates across
sources, and recursively removes redundant direct entries. It rejects missing
members, cycles, conflicting pack contents between sources, invalid registries,
and unreadable manifests rather than writing a partial inventory.

```sh
npm run validate      # Offline: saved snapshot versus package.json and README
npm test              # Maintenance tests and current selection acceptance test
npm run sync -- --help
```

The selection acceptance test deliberately asserts **40 / 25 / 15** and the five
nested parents. When intentionally changing the selection, review and update
that test along with the snapshot and manifest. Future extension versions can
change pack membership, so those counts are not permanent product limits.

## What this does not restore

- Settings, keybindings, snippets, profiles, or enabled/disabled states.
- Accounts, login sessions, credentials, or licenses for paid functionality.
- External SDKs, runtimes, tools, or system dependencies.
- Exact versions, pre-release choices, or version pins. Observed versions are
  reference information only.
- A guaranteed identical future selection: upstream packs can add/remove
  members, extensions can disappear from the Marketplace, and compatible
  versions can differ by platform and VS Code version.

The compact nesting is intentional: if a parent removes a member, a future
installation may no longer install that member. The saved snapshot makes that
change visible when refreshed, but cannot control future upstream releases.
Installing or updating a pack is not an exact reconciliation operation: it
does not guarantee removal of previously installed extensions.

VS Code profile export and Settings Sync can complement the pack for settings
and other preferences; neither is required to build the VSIX.

## Verification and clean-profile smoke test

Automated checks validate the saved graph and package selection. Inspect the
archive separately if needed:

```sh
unzip -l elles-gearbox-0.1.0.vsix
unzip -p elles-gearbox-0.1.0.vsix extension/package.json
```

These checks do **not** prove that every referenced extension can currently be
downloaded. For an online smoke test, use a disposable VS Code client with
separate user-data and extension directories, not the active profile. For
example, in a local Linux shell (not a WSL remote CLI):

```sh
test_dir=$(mktemp -d)
code --user-data-dir "$test_dir/user-data" \
  --extensions-dir "$test_dir/extensions" \
  --install-extension "$PWD/elles-gearbox-0.1.0.vsix"
code --user-data-dir "$test_dir/user-data" \
  --extensions-dir "$test_dir/extensions" \
  --list-extensions
```

Compare the result case-insensitively against the 40 snapshot IDs, plus
`elmar-local.elles-gearbox`. Investigate missing entries and review any
extra dependencies or newer upstream pack members; do not infer success only
from the top-level pack being installed. Test Windows/WSL placement separately
on the target setup. Retain the exact temporary path for targeted cleanup after
closing that disposable client.

## References

- [VS Code extension packs](https://code.visualstudio.com/api/references/extension-manifest#extension-packs)
- [VS Code CLI](https://code.visualstudio.com/docs/configure/command-line#_working-with-extensions)
- [VSIX packaging](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
