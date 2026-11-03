# dsh-config-studio

A visual configuration editor for the active DSH profile. It lists every
addressable Loader entry, renders a form from that entry's own `Config` schema,
and writes the fields you change into the profile's `cordis.patch.yml` through
`ctx.configEditor` — the same writer DSH's own settings pages use, but without
the `volatile`-only restriction of `settings.mutate`.

The page appears in **Settings → Plugin configuration** (order 30) beside General
(通用设置), Models, and Plugins.

## What it does

- **List** — every entry `configEditor.entries()` returns, with its package
  name, field count, override state, and whether it can be edited right now.
  Search by entry id or package, and switch between editable-only (the default)
  and all rows; read-only rows are only listed in the second mode. Rows group by
  function or by origin (built-in vs third-party), each section collapses from
  its header, and the browsing state survives opening an entry and coming back.
- **Localized** — every string lives in the plugin's `settings.config-studio`
  dictionary as flat dotted keys (`en` + `zh`), and the Plugins-page entry reads
  `locale/en.json` / `locale/zh.json`. Switching the Harness language switches the
  nav label, the page, the group headings, and the error hints live.
- **Read** — one schema-derived field per top-level config key: label, JSON
  type, default, bounds, description, and the value in effect (profile override
  first, inherited layer otherwise). Values that are `!!js` expressions or
  credentials are shown as markers, never as text.
- **Write** — scalar, enum, object, and array fields. Scalars use text inputs,
  booleans a switch, enums a select, and objects/arrays a JSON editor. A review
  dialog shows the patch-shaped diff before anything is written.
- **Reset** — one field at a time, back to the inherited value. When every field
  matches the inherited layer the override row is removed entirely, which is
  what "restore the default" means for a whole-config patch.

## Read-only rules

These are decided on the Host and cannot be bypassed from the browser:

| Condition | Reason |
|---|---|
| `role('secret')` field | `secret` — value never leaves the Host, only a `configured` flag |
| `role('credential-ref')` field | `credential-ref` |
| An object that contains a secret somewhere below it | `contains-secret` |
| An unevaluated `!!js` expression | `expression` — edited in YAML only |
| A schema type the form does not understand | `unsupported` |
| `meta.disabled` on the field | `disabled` |
| Entry larger than 64 KiB | `oversized` |
| Entry disabled, failed, inactive, or a group | `disabledEntry` / `failed` / `inactive` / `groups` |
| Plugin declares no `Config` | `no-schema` |

## Endpoints

All three are `POST`, stateless, and same-origin behind the normal browser
session; they are registered through `ctx.connection.fetch`, so the `/api`
fence, Host/Origin checks, and cookie authentication apply before dispatch.

```
POST /api/config-studio/list
  {}                              -> { ok, entries[], stats }
  { query?: string }              -> server-side filter (the UI filters locally)

POST /api/config-studio/read
  { id }                          -> { ok, id, name, status, revision, fields[], readonly? }

POST /api/config-studio/write
  { id, expectedRevision, changes: [{ key, value } | { key, reset: true }] }
                                  -> { ok, revision, applied[], restoredDefault }
                                  -> { ok: false, error: { code, message, path? } }
```

`revision` is a stable hash of the entry's inherited layer, profile override,
and raw config. A write whose `expectedRevision` no longer matches returns
`conflict` instead of overwriting a concurrent edit.

Write path: rebuild the raw config from the entry's current config plus the
requested changes (so secrets and expressions elsewhere are preserved), replace
`!!js` expressions with the values the running fiber resolved for validation
only, validate against the plugin's own schema, then hand the result to
`configEditor.edit()`, which re-validates, locks the profile manifest, preserves
comments and `!!js`, writes atomically, reloads the entry, and rolls the file
back if the reload fails.

Validation failures report the offending field in `error.path`; schema messages
are scrubbed of credential text before they cross the wire.

## Install

`dsh plugin --profile <name> add /absolute/path/to/dsh-config-studio`, or use
Settings → Plugins and install the absolute directory. The package is a bundle
(`dsh.bundle.patch` inserts one Host row) with a browser half declared under
`dsh.client`.

## Not covered

- **Only uniquely addressed root rows.** Nested `include` entries own their own
  patches and are not writable here, by design of `configEditor`.
- **Nested fields render as JSON.** Object and array values are edited as JSON
  rather than as nested groups; the Host validates the result.
- **Diff preview is field-shaped.** The review dialog lists the changed keys, not
  a textual diff of the whole file; the real file edit stays inside
  `configEditor`.
- **A whole-config override pins values.** A profile patch replaces the complete
  config for an entry, so saving one field writes the entry's current config
  plus your change. Fields you did not touch keep their values.
