<p align="center">
  <img src="icon.svg" width="72" alt="dsh-config-studio icon">
</p>

<h1 align="center">dsh-config-studio</h1>

<p align="center">
  <a href="./README.md"><b>English</b></a> · <a href="./README.zh.md">中文</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/dsh-config-studio"><img alt="npm version" src="https://img.shields.io/npm/v/dsh-config-studio" /></a>
  <a href="https://github.com/MaxHan0102/dsh-config-studio/releases"><img alt="release" src="https://img.shields.io/github/v/release/MaxHan0102/dsh-config-studio?label=release" /></a>
  <a href="https://github.com/MaxHan0102/dsh-config-studio/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/MaxHan0102/dsh-config-studio" /></a>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" /></a>
  <img alt="DSH 0.2.1-rc.5+" src="https://img.shields.io/badge/DSH-0.2.1--rc.5%2B-4d6bfe" />
</p>

A settings page for the part of DSH configuration the built-in pages never reach. It lists every **addressable Loader entry** in the active profile, renders a form from that plugin's own `Config` schema, and writes the fields you change into the profile's `cordis.patch.yml` — through `ctx.configEditor`, the same writer DSH's own settings use, but without the `volatile`-only restriction.

The page appears in **Settings → Plugin configuration** (设置 → 插件配置) and follows the Harness language (English / 简体中文).

## Why this exists

DSH's built-in settings forms write through `settings.mutate`, which only accepts fields a plugin declared with `.volatile()`; writing anything else throws `Config field "<path>" is not volatile`. Everything else is expected to be edited by hand in YAML.

That restriction is reasonable for live-reloadable preferences, but it leaves most of a real profile without a UI: plugin lists, timeouts, feature switches, provider tables, and the rest. This plugin takes the other road — the complete raw config — and lets the Host validate and apply it exactly as the Loader would.

## Features

- **Browse** — every entry `configEditor.entries()` returns, with package name, field count, override badge, and current status. Search by id or package; switch between *editable only* (default) and *all*; group by **function** (models, agents, tools, web, accounts, runtime, sessions, interface, platform, other) or by **origin** (built-in / third-party); collapse sections; the browsing state survives opening an entry and coming back.
- **Edit** — one field per top-level config key: text, number, switch, select for enums, and a JSON editor for objects and arrays. Each row shows the value in effect, whether it comes from the profile patch, and a one-click **Reset** back to the inherited value.
- **Review, then save** — a patch-shaped diff of what will be written, a revision check that refuses to overwrite a concurrent edit, and a result line that says whether the override was applied or removed.
- **Read-only by design** — credentials, `!!js` expressions, unsupported schema shapes are never writable here (table below).
- **Bilingual** — English and Simplified Chinese, following the Harness language, including the nav label, every section, and error messages.

> The `dev` branch contains `0.2.0-dev.2`, which has not been released to npm. Draft recovery, change history and the updated interface described here belong to this development version. `main` remains the stable source branch.

## Install

Published on npm as [`dsh-config-studio`](https://www.npmjs.com/package/dsh-config-studio), and also a plain `dsh.bundle` bundle with **no runtime dependencies and no build step**. npm and release tarballs install published versions; the development branch can contain newer changes.

### Development branch

To try this branch, paste `github:MaxHan0102/dsh-config-studio#dev` into the Desktop plugin installer, or use a separate command-line test profile:

```bash
dsh plugin --profile web add 'github:MaxHan0102/dsh-config-studio#dev'
```

Desktop requires an existing third-party installation to be removed before installing it from another source. For source development, clone with `git clone --branch dev https://github.com/MaxHan0102/dsh-config-studio.git` and follow the Development section below.

### npm (recommended)

```bash
dsh plugin --profile web add dsh-config-studio
```

Replace `web` with your own profile name. Restart the host if it does not pick the plugin up, then reload the page.

**DSH Desktop** manages its own profile, so the command above cannot install into it: open **Settings → Plugins**, paste `dsh-config-studio` into the install box, make sure the plugin is enabled, then reload the page (`Cmd/Ctrl+R`).

### Without npm

The same version installs from the release tarball or straight from this repository — useful on a host that cannot reach the registry:

```bash
# release tarball (pinned to a tag, so the URL never rots)
dsh plugin --profile web add https://github.com/MaxHan0102/dsh-config-studio/releases/download/v0.1.0/dsh-config-studio-0.1.0.tgz

# or straight from the repository
dsh plugin --profile web add github:MaxHan0102/dsh-config-studio
```

On Desktop, paste either string into the same install box.

### Update

```bash
dsh plugin --profile web add dsh-config-studio@latest
```

On Desktop, use the update control on the plugin's card. A tarball or git install has no update check — remove and re-add it with the newer tag or commit.

### Remove

```bash
dsh plugin --profile web remove dsh-config-studio
```

Any override the plugin wrote stays in `cordis.patch.yml`; removing the plugin does not touch your configuration.

### Requirements

| | |
|---|---|
| DSH | `0.2.1-rc.5` or newer (tested on `0.2.1-rc.5` and `0.2.2-rc.1`) |
| Services | `ctx.configEditor` and `ctx.connection.fetch` — both ship with the Web composition |
| Node | 20+ |
| Browser | any current Web GUI; the section is a normal client plugin |

The package deliberately declares no DSH version range: it is plain JavaScript with no host imports, so it keeps installing on newer hosts instead of being gated out by a prerelease peer range.


## Usage

1. **Open** **Settings → Plugin configuration**. The first screen lists the entries that have something to edit; switch the filter to *All entries* to inspect the read-only ones.
2. **Pick an entry.** The pane shows its fields, generated from the plugin's own schema. A field marked **Overridden** comes from your profile patch; the rest show the inherited value.
3. **Edit.** Changed rows are highlighted; invalid numbers, enums, and JSON are marked before you save. **Reset** on a row marks it to be restored to the inherited value (the pending value is shown in the field).
4. **Review.** *Save to profile* opens a diff of exactly what will be written.
5. **Apply.** The Host validates the complete config against the plugin's schema, writes the patch atomically, and reloads the entry through the Loader. A value the schema rejects comes back with the offending field named; a concurrent edit comes back as a conflict and offers a reload.

### What the badges mean

| Badge | Meaning |
|---|---|
| **Overridden** (entry) | The profile patch has a `config:` record for this entry |
| **Overridden** (field) | This key is written in that record, so the value comes from the profile layer |
| **Read-only** | See the table below; the field is shown for context but will not be written |
| **Third-party** | The package is not under the `@deepseek-ai/` scope |

### Two behaviours worth knowing

**A patch replaces the whole config.** DSH applies a patch by replacing an entry's `config` object, not by merging keys. Saving one field therefore writes the entry's current config plus your change, and pins the other values it already had. If every field ends up equal to the inherited layer, the record is removed entirely — that is what *Reset* means for a whole entry.

**Some changes reload the plugin.** Every save goes through the Loader's normal lifecycle, so the plugin restarts with its new config. A few plugins only take effect after the host restarts; the page says so in the result line.

## Read-only rules

Decided on the Host; the browser cannot bypass them.

| Condition | Reason |
|---|---|
| `role('secret')` field | the value never leaves the Host — the page only learns whether it is set |
| `role('credential-ref')` field | a reference is not an editable value |
| An object with a secret somewhere below it | editing it as JSON could leak the secret |
| An unevaluated `!!js` expression | only YAML can express it safely |
| A schema type the form does not understand | no safe control exists |
| `meta.disabled` on the field | the plugin disables it |
| Entry disabled, failed, inactive, or a group | not addressable right now |
| Plugin declares no `Config` | nothing to generate a form from |

## How it works

Two halves, both in this repository:

- **Host** (`index.js`) — three `POST` endpoints registered through `ctx.connection.fetch`, so the `/api` fence, Host/Origin checks, and cookie authentication apply before dispatch. It imports nothing outside Node built-ins: the form shape is read from the live `schemastery` schema the Loader already holds.

  | Endpoint | Body | Answers |
  |---|---|---|
  | `/api/config-studio/list` | `{}` | entries, status, field counts, category, origin |
  | `/api/config-studio/read` | `{ id }` | revision, fields, values, read-only reason |
  | `/api/config-studio/write` | `{ id, expectedRevision, changes }` | `{ ok, revision }` or `{ ok: false, error }` |

- **Client** (`client.js`) — a `settings.section` registration written in the module-loader format, with no Harness client package imports. Controls are the plugin's own, styled with theme tokens.

Revision checks, candidate construction and schema prevalidation run inside the `configEditor.edit()` callback, against its lock-protected current configuration. The host then validates and atomically persists/reloads the result, rolling back on failure. The resulting raw config is limited to 64 KiB; oversized existing configs can be reduced. JSON edits cannot introduce executable expression markers. Third-party exception text never crosses the API boundary.

## Troubleshooting

| Symptom | Fix |
|---|---|
| No **Plugin configuration** section | Confirm the plugin is enabled and active, then reload the page. On the Desktop app, check the plugin's card in **Settings → Plugins**. |
| "The configuration service did not answer." | The Host half is not active: check the DSH version, and that the entry is `active` in the plugin list. |
| A field you need is read-only | It matches one of the rules above; edit `cordis.patch.yml` directly for secrets and `!!js`. |
| Save succeeded but nothing changed | Another layer wins: a home patch (`~/.dsh/cordis.patch.yml`) or a `--patch` overlay takes precedence over the profile layer. |
| Save failed with a conflict | Someone (or another tool) wrote the entry after the page read it; reload the entry and re-apply. |
| The page vanished after a DSH update | Check the upstream release notes for the settings surface; open an issue with the DSH version. |

## Security

- Only the active profile's `cordis.patch.yml` is ever written. Home patches, command-line overlays, and bundle layers are read but never modified.
- Only entries returned by `configEditor.entries()` are addressable; everything else is invisible to this page.
- Secrets are never sent to the browser, and schema error messages are scrubbed of credential text before they leave the Host.
- Logs carry entry ids and field keys only — never configuration values.
- The browser cannot pick a different write target: the Host rebuilds the candidate config from its own copy and re-validates it.

## Development

The runtime is plain JavaScript with no external dependencies or build step. Authoring and testing tools are devDependencies only.

```bash
npm ci
npm run check
npm test
npm run dev
```

The development server prints a loopback-only (`127.0.0.1`) URL. It uses the actual plugin and synthetic configuration with an in-memory writer, including save, undo, credential, error and conflict scenarios. This does not replace disk/reload testing in a real DSH host. Refresh after client changes; restart the server after host or development-entry changes.

```text
index.js           DSH host entry point
host.js            Endpoints, locked writes and session history
config-model.js    Projection, sensitive fields, validation and edits
classification.js  Entry categories
client.js          Settings UI, drafts, dialogs and localization
scripts/           Isolated development page (not published)
test/              Host and React regression tests (not published)
```

For real host integration, prepare a separate disposable profile first and use the same DSH_HOME for both installation and launch:

```bash
# This directory must already contain the prepared test profiles/web.
export DSH_HOME=/absolute/path/to/prepared-test-dsh-home
dsh plugin --profile web add /absolute/path/to/dsh-config-studio
dsh --profile web --no-open --port 0
```

Desktop owns its profile. These commands are for a separate command-line test host.

## Drafts, provenance and undo

- Fields distinguish defaults, inherited, custom and higher-priority values; switches and enums display their effective editable value.
- Search includes localized common names, categories, descriptions and field names. Filters include modified, unavailable and recently opened entries; details have field search.
- Drafts can survive returning to the list or closing the settings section within the current page process. They are not persisted to browser storage and may be lost on a full page, plugin or application reload.
- Conflicts preserve drafts and require comparison with the latest saved values before another save.
- History is host memory only: five records per entry, at most 24 entries. Only the latest unchanged revision can be undone. Restarting the host/plugin clears it.
- Objects and simple arrays have structured controls with a JSON alternative. Complex fields keep their descriptions and support formatting and validation.
- Saving replaces the complete config and pins other existing inherited raw values in the active profile. The preview explains this behavior.

## License

[MIT](./LICENSE)
