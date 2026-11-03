/**
 * dsh-config-studio — Host half.
 *
 * Exposes three stateless JSON endpoints over the Web carrier and performs all
 * configuration reads and writes through `ctx.configEditor`, the only supported
 * writer for the active profile patch:
 *
 *   POST /api/config-studio/list   -> addressable entries and their editability
 *   POST /api/config-studio/read   -> one entry's schema-derived fields and values
 *   POST /api/config-studio/write  -> one entry's changes, validated and applied
 *
 * Rules enforced here, never in the browser:
 *   - only entries returned by `configEditor.entries()` are addressable;
 *   - a write is rejected unless its revision matches the current composition;
 *   - `role('secret')` values never leave this process, only a presence flag;
 *   - `!!js` expressions and secret-bearing containers are read-only;
 *   - every write is validated against the plugin's own Config schema first;
 *   - log lines carry ids and field keys, never configuration values.
 *
 * The Host half imports no package. A locally linked plugin resolves only from
 * its own directory, so Node built-ins plus the services on `ctx` are the whole
 * dependency surface; the form shape is read from the live schemastery schema
 * that the Loader already holds for each entry.
 */

import { createHash } from 'node:crypto'

/** Plugin name used by Loader diagnostics. */
export const name = 'dsh-config-studio'
/** The two services this Host half cannot work without. */
export const inject = ['configEditor', 'connection']

/** Entries whose raw configuration exceeds this size are read-only. */
const MAX_ENTRY_BYTES = 64 * 1024
/** Request body cap; edits are field-sized, not document-sized. */
const MAX_BODY_BYTES = 256 * 1024
/** Route prefix owned by this plugin. */
const ROUTE_PREFIX = '/api/config-studio'
/** Bumped when the projected field shape changes, so revisions invalidate. */
const REVISION_SALT = 'config-studio/2'

/** Roles whose values must not cross the wire. */
const SECRET_ROLES = new Set(['secret'])
/** Roles that are configuration references rather than editable values. */
const OPAQUE_ROLES = new Set(['credential-ref'])

/* ------------------------------------------------------------------ */
/* small utilities                                                      */
/* ------------------------------------------------------------------ */

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key)

/** Whether a value is a plain data object. */
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Loader's unevaluated `!!js` expression marker. */
function isExpression(value) {
  return isRecord(value) && Object.keys(value).length === 1 && typeof value.__jsExpr === 'string'
}

/** Deep clone of JSON-compatible configuration data. */
function clone(value) {
  return value === undefined ? undefined : structuredClone(value)
}

/** Stable per-entry revision over the layers a form was derived from. */
function revisionOf(id, inherited, override, current) {
  const digest = createHash('sha256')
  digest.update(REVISION_SALT)
  digest.update('\u0000')
  digest.update(id)
  digest.update('\u0000')
  digest.update(JSON.stringify([inherited, override, current]))
  return digest.digest('hex').slice(0, 16)
}

/** Join a field path for diagnostics. */
function pathKey(path) {
  return path.join('.')
}

/** A schemastery node is callable and exposes `type`; anything else is unknown. */
function isSchemaNode(node) {
  return (typeof node === 'object' || typeof node === 'function') && node !== null && typeof node.type === 'string'
}

/* ------------------------------------------------------------------ */
/* schema introspection                                                 */
/* ------------------------------------------------------------------ */

/** Unwrap transform/lazy wrappers down to the first useful node. */
function unwrap(node, depth = 0) {
  if (!isSchemaNode(node) || depth > 6) return node
  if (node.type === 'lazy' && isSchemaNode(node.inner)) return unwrap(node.inner, depth + 1)
  if (node.type === 'transform' && isSchemaNode(node.inner)) return unwrap(node.inner, depth + 1)
  return node
}

/**
 * Describe the shape a schemastery node accepts.
 * @returns `{ kind, options?, minimum?, maximum?, ... }`.
 */
function describeNode(node, depth = 0) {
  if (depth > 6 || !isSchemaNode(node)) return { kind: 'unsupported' }
  const meta = isRecord(node.meta) ? node.meta : {}
  switch (node.type) {
    case 'string':
      return {
        kind: 'string',
        minLength: typeof meta.min === 'number' ? meta.min : undefined,
        maxLength: typeof meta.max === 'number' ? meta.max : undefined,
        pattern: isRecord(meta.pattern) && typeof meta.pattern.source === 'string' ? meta.pattern.source : undefined,
      }
    case 'number': {
      const step = typeof meta.step === 'number' ? Math.abs(meta.step) : undefined
      return {
        kind: 'number',
        integer: step === 1,
        minimum: typeof meta.min === 'number' ? meta.min : undefined,
        maximum: typeof meta.max === 'number' ? meta.max : undefined,
        multipleOf: step !== undefined && step !== 1 ? step : undefined,
      }
    }
    case 'boolean':
      return { kind: 'boolean' }
    case 'const':
      return { kind: 'enum', options: [node.value] }
    case 'union': {
      const list = Array.isArray(node.list) ? node.list.filter(isSchemaNode) : []
      if (list.length > 0 && list.every((entry) => entry.type === 'const')) {
        return { kind: 'enum', options: list.map((entry) => entry.value) }
      }
      const described = list.map((entry) => describeNode(entry, depth + 1))
      const kinds = new Set(described.map((entry) => entry.kind))
      if (kinds.size === 1 && !kinds.has('unsupported')) return described[0]
      return { kind: 'json' }
    }
    case 'array':
      return {
        kind: 'array',
        items: describeNode(node.inner, depth + 1),
        minItems: typeof meta.min === 'number' ? meta.min : undefined,
        maxItems: typeof meta.max === 'number' ? meta.max : undefined,
      }
    case 'tuple':
      return { kind: 'array' }
    case 'dict':
      return { kind: 'json' }
    case 'object': {
      const entries = isRecord(node.dict) ? Object.entries(node.dict) : []
      return {
        kind: 'object',
        properties: Object.fromEntries(entries.map(([key, child]) => [key, describeNode(child, depth + 1)])),
      }
    }
    case 'intersect':
      return { kind: 'json' }
    case 'any':
      return { kind: 'json' }
    case 'transform':
      return { ...describeNode(node.inner, depth + 1), transformed: true }
    case 'lazy':
      return describeNode(node.inner, depth + 1)
    case 'never':
      return { kind: 'unsupported' }
    default:
      return { kind: 'unsupported' }
  }
}

/**
 * Walk a schemastery schema against a raw value and collect the paths of
 * `role('secret')` slots, whether each currently holds a value, and the
 * paths where an unevaluated `!!js` expression sits.
 * @returns `{ secrets: Map<string, boolean>, expressions: Set<string> }`
 */
function inspectValue(schema, value) {
  const secrets = new Map()
  const secretValues = []
  const expressions = new Set()
  const visit = (node, current, path) => {
    if (isExpression(current)) {
      expressions.add(pathKey(path))
      return
    }
    if (!isSchemaNode(node)) return
    if (node.meta?.role !== undefined && SECRET_ROLES.has(node.meta.role)) {
      secrets.set(pathKey(path), current !== undefined)
      if (typeof current === 'string' && current !== '') secretValues.push(current)
      return
    }
    switch (node.type) {
      case 'object': {
        if (!isRecord(current) || !isRecord(node.dict)) return
        for (const [key, child] of Object.entries(node.dict)) visit(child, current[key], [...path, key])
        return
      }
      case 'dict': {
        if (!isRecord(current)) return
        for (const [key, entry] of Object.entries(current)) visit(node.inner, entry, [...path, key])
        return
      }
      case 'array': {
        if (!Array.isArray(current)) return
        current.forEach((entry, index) => visit(node.inner, entry, [...path, String(index)]))
        return
      }
      case 'union':
      case 'intersect': {
        for (const child of node.list ?? []) visit(child, current, path)
        return
      }
      case 'transform':
      case 'lazy': {
        visit(node.inner, current, path)
        return
      }
      default:
    }
  }
  visit(schema, value, [])
  return { secrets, secretValues, expressions }
}

/** Replace credential text that a schema error may have quoted. */
function scrubSecrets(message, secretValues) {
  let text = String(message)
  for (const secret of secretValues) {
    if (typeof secret === 'string' && secret.length >= 4) text = text.split(secret).join('••••')
  }
  return text
}

/** Whether any recorded path lies at or beneath the given field path. */
function hasDescendant(set, fieldPath) {
  if (set.has(fieldPath)) return true
  const prefix = `${fieldPath}.`
  for (const key of set.keys()) if (typeof key === 'string' && key.startsWith(prefix)) return true
  return false
}

/** Sentinel for a value the sanitized validation copy must omit. */
const OMIT = Symbol('config-studio.omit')

/** Read a nested path from the live resolved configuration. */
function readPath(value, path) {
  let current = value
  for (const key of path) {
    if (current === null || typeof current !== 'object') return undefined
    current = current[key]
  }
  return current
}

/**
 * Replace unevaluated `!!js` expressions with the value the Loader resolved for
 * the running fiber, so schema validation sees what the plugin sees while the
 * written config keeps the expression itself.
 * @param value - the candidate raw configuration.
 * @param live - `entry.fiber.config`, the resolved configuration.
 * @param path - current position inside the candidate.
 */
function sanitizeForValidation(value, live, path = []) {
  if (isExpression(value)) {
    const resolved = readPath(live, path)
    return resolved === undefined ? OMIT : resolved
  }
  if (Array.isArray(value)) {
    return value.map((entry, index) => {
      const next = sanitizeForValidation(entry, live, [...path, index])
      return next === OMIT ? undefined : next
    })
  }
  if (isRecord(value)) {
    const next = {}
    for (const [key, entry] of Object.entries(value)) {
      const sanitized = sanitizeForValidation(entry, live, [...path, key])
      if (sanitized !== OMIT) next[key] = sanitized
    }
    return next
  }
  return value
}

/** Read a localized description from a schemastery meta value. */
function descriptionOf(meta) {
  const value = meta?.description
  if (typeof value === 'string') return { text: value }
  if (isRecord(value)) return { text: undefined, map: value }
  return {}
}

/* ------------------------------------------------------------------ */
/* field construction                                                   */
/* ------------------------------------------------------------------ */

/** Human label for a field key: `maxOutputBytes` -> "Max output bytes". */
function humanize(key) {
  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
  if (spaced === '') return key
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/**
 * Build the renderable field list for one entry from its live Config schema.
 * @param nativeSchema - the plugin's schemastery `Config`.
 * @param values - values shown to the user (override key wins over inherited).
 * @param inherited - the value the field returns to on reset.
 * @param overridden - keys present in the profile override.
 * @returns the ordered field descriptors and the secret-bearing keys.
 */
function buildFields(nativeSchema, values, inherited, overridden) {
  const root = unwrap(nativeSchema)
  if (!isSchemaNode(root) || root.type !== 'object' || !isRecord(root.dict)) return { fields: [], secretFields: [] }
  const inspection = inspectValue(nativeSchema, values)
  const inheritedInspection = inspectValue(nativeSchema, inherited)
  const fields = []
  const secretFields = []
  for (const [key, child] of Object.entries(root.dict)) {
    if (!isSchemaNode(child)) continue
    const meta = isRecord(child.meta) ? child.meta : {}
    if (meta.hidden === true) continue
    const shape = describeNode(child)
    const raw = hasOwn(values, key) ? values[key] : undefined
    const secret = meta.role !== undefined && SECRET_ROLES.has(meta.role)
    const opaque = meta.role !== undefined && OPAQUE_ROLES.has(meta.role)
    const containsSecret = hasDescendant(inspection.secrets, key)
    const expression = hasDescendant(inspection.expressions, key)
    let readonly
    let reason
    if (secret) {
      readonly = true
      reason = 'secret'
    } else if (opaque) {
      readonly = true
      reason = 'credential-ref'
    } else if (containsSecret) {
      readonly = true
      reason = 'contains-secret'
    } else if (expression) {
      readonly = true
      reason = 'expression'
    } else if (shape.kind === 'unsupported') {
      readonly = true
      reason = 'unsupported'
    } else if (meta.disabled === true) {
      readonly = true
      reason = 'disabled'
    }
    const description = descriptionOf(meta)
    const field = {
      key,
      label: humanize(key),
      description: description.text,
      descriptions: description.map,
      kind: shape.kind,
      required: meta.required === true,
      overridden: overridden.has(key),
      readonly: readonly === true,
      reason,
      volatile: meta.volatile === true,
      partial: shape.transformed === true || child.type === 'transform',
    }
    if (!secret && !containsSecret && !expression) field.default = clone(meta.default)
    if (shape.kind === 'enum') field.options = shape.options.map((option) => ({ value: option, label: String(option) }))
    for (const limit of ['minimum', 'maximum', 'multipleOf', 'minLength', 'maxLength', 'pattern', 'minItems', 'maxItems', 'integer']) {
      if (shape[limit] !== undefined) field[limit] = shape[limit]
    }
    if (secret) {
      field.configured = (inspection.secrets.get(key) ?? false) === true
      secretFields.push(key)
    } else if (containsSecret) {
      field.configured = true
      secretFields.push(key)
    } else if (expression) {
      field.expression = true
    } else {
      field.value = clone(raw)
      const inheritedRaw = hasOwn(inherited, key) ? inherited[key] : undefined
      const inheritedExpression = hasDescendant(inheritedInspection.expressions, key)
      if (!inheritedExpression) field.inherited = clone(inheritedRaw)
      field.hasInherited = hasOwn(inherited, key)
    }
    fields.push(field)
  }
  return { fields, secretFields }
}

/* ------------------------------------------------------------------ */
/* entry classification                                                 */
/* ------------------------------------------------------------------ */

/** Package scope the shipped plugins use. */
const OFFICIAL_SCOPE = '@deepseek-ai/'

/** Ids whose generic name would otherwise fall into the wrong bucket. */
const CATEGORY_OVERRIDES = {
  'agent-default-model': 'models',
  'subagent-model-selection-settings': 'models',
  webserver: 'platform',
  'web-runtime': 'platform',
  'web-startup': 'platform',
  connection: 'platform',
  'client-connection': 'platform',
  modules: 'platform',
  loader: 'platform',
  hmr: 'platform',
  'client-hmr': 'platform',
  settings: 'platform',
  'config-editor': 'platform',
  'ui-renderer': 'platform',
  'open-in-app': 'ui',
  'config-studio': 'ui',
  'cordis-host-runner': 'platform',
  'cordis-client-runner': 'platform',
  'file-upload': 'session',
  'product-analytics': 'platform',
  workspace: 'session',
  'workspace-changes': 'session',
  'user-questions': 'ui',
  'token-meter': 'models',
  'system-prompt': 'agents',
  'ptc-runtime': 'runtime',
}

/** Id prefixes whose bucket is decided before the package name is consulted. */
const ID_PREFIX_RULES = [
  ['ui', /^(ui-|ui:)/],
  ['tools', /^(command-|commands|tool-|tools-|skill-|mcp-)/],
  ['models', /^(llm-|agent-default-model)/],
  ['agents', /^(agent-|subagent-|goal|plan-|workflow|persona|team)/],
  ['session', /^(session-|storage-|attachment-|spill-|compaction-|checkpoint-|job|jobs|schedule|feedback)/],
  ['runtime', /^(sandbox|bash-|pwsh-|fs-|shell-|terminal|subprocess|worktree|directory|file-)/],
  ['web', /^(web-|browser|http-proxy)/],
  ['account', /^(credential|credentials|authorization|account-|deepseek-account)/],
  ['platform', /^(api-|typert|gateway|registry|otel|telemetry|brand|resources|store|cordis|permission|approval|plugin-|harness-|launch-|hmr|loader|modules|settings|config-editor)/],
]

/** Token buckets consulted when no id prefix matched. */
const CATEGORY_RULES = [
  ['models', /(^|[\s:/@-])(llm|model|models|provider|pi-ai)([\s:/@-]|$)/],
  ['agents', /(^|[\s:/@-])(agent|subagent|persona|goal|plan-mode|workflow|preset|team)([\s:/@-]|$)/],
  ['tools', /(^|[\s:/@-])(tool|tools|skill|mcp|command|commands|office)([\s:/@-]|$)/],
  ['web', /(^|[\s:/@-])(web|web-search|web-fetch|browser|http-proxy|fetch|search)([\s:/@-]|$)/],
  ['account', /(^|[\s:/@-])(account|credential|credentials|authorization)([\s:/@-]|$)/],
  ['runtime', /(^|[\s:/@-])(sandbox|bash|pwsh|shell|terminal|subprocess|worktree|fs|directory|files)([\s:/@-]|$)/],
  ['session', /(^|[\s:/@-])(session|storage|attachment|spill|compaction|checkpoint|job|jobs|schedule|feedback|memory)([\s:/@-]|$)/],
  ['ui', /(^|[\s:/@-])(ui|client|sidebar|layout|theme|locale|chat|conversation|dock|trajectory|shortcut|market|entry-customization)([\s:/@-]|$)/],
  ['platform', /(^|[\s:/@-])(api|typert|gateway|registry|scope|otel|telemetry|brand|resources|store|cordis|permission|approval|plugin|modules|analytics)([\s:/@-]|$)/],
]

/**
 * Assign a coarse function bucket to one Loader entry.
 * @param id - the entry's patch id.
 * @param name - the plugin package name.
 * @returns one of the category keys the Client localizes.
 */
function categorize(id, name) {
  const key = typeof id === 'string' ? id : ''
  if (hasOwn(CATEGORY_OVERRIDES, key)) return CATEGORY_OVERRIDES[key]
  const lowerId = key.toLowerCase()
  for (const [category, pattern] of ID_PREFIX_RULES) if (pattern.test(lowerId)) return category
  const text = `${key} ${name ?? ''}`.toLowerCase()
  for (const [category, pattern] of CATEGORY_RULES) if (pattern.test(text)) return category
  return 'other'
}

/** Whether the package ships with Harness itself. */
function originOf(name) {
  return typeof name === 'string' && name.startsWith(OFFICIAL_SCOPE) ? 'official' : 'third-party'
}

/* ------------------------------------------------------------------ */
/* entry inspection                                                     */
/* ------------------------------------------------------------------ */

/** Map a Loader entry to a coarse editable status. */
function entryStatus(entry) {
  let disabled = false
  try {
    disabled = entry.disabled === true
  } catch {
    disabled = false
  }
  if (entry.options?.group === true) return 'group'
  if (disabled) return 'disabled'
  const state = entry.fiber?.state
  if (state === undefined) return 'inactive'
  if (state === 2) return 'active'
  if (state === 3) return 'failed'
  return 'inactive'
}

/** Machine reason for an entry-level read-only state. */
function statusReason(status) {
  switch (status) {
    case 'group':
      return 'groups'
    case 'disabled':
      return 'disabledEntry'
    case 'failed':
      return 'failed'
    case 'inactive':
      return 'inactive'
    default:
      return undefined
  }
}

/**
 * Compute revision, layers, and raw value for one configuration row.
 * @param row - `{ entry, inherited, override }` from `configEditor.configuration()`.
 */
function describeRow(row) {
  const entry = row.entry
  const id = entry.options?.id
  const inherited = isRecord(row.inherited) ? row.inherited : {}
  const override = isRecord(row.override) ? row.override : {}
  const current = isRecord(entry.options?.config) ? entry.options.config : {}
  const overriddenKeys = new Set(Object.keys(override))
  const values = {}
  for (const key of new Set([...Object.keys(inherited), ...Object.keys(override)])) {
    values[key] = clone(hasOwn(override, key) ? override[key] : inherited[key])
  }
  const size = Buffer.byteLength(JSON.stringify(current) + JSON.stringify(override))
  return {
    id,
    name: entry.options?.name,
    entry,
    inherited,
    override,
    current,
    values,
    status: entryStatus(entry),
    overridden: overriddenKeys.size > 0,
    overriddenKeys,
    oversized: size > MAX_ENTRY_BYTES,
    bytes: size,
    revision: revisionOf(id, inherited, override, current),
  }
}

/* ------------------------------------------------------------------ */
/* HTTP plumbing                                                        */
/* ------------------------------------------------------------------ */

/** JSON response with no-store caching. */
function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

/** Uniform failure envelope. */
function failure(code, message, extra = {}) {
  return json({ ok: false, error: { code, message, ...extra } }, 200)
}

/** Read and parse a bounded JSON body. */
async function readBody(request) {
  const declared = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return { error: failure('body-too-large', 'request body is too large') }
  }
  let text
  try {
    text = await request.text()
  } catch {
    return { error: failure('body-unreadable', 'request body could not be read') }
  }
  if (text.length > MAX_BODY_BYTES) return { error: failure('body-too-large', 'request body is too large') }
  if (text.trim() === '') return { body: {} }
  try {
    const parsed = JSON.parse(text)
    if (!isRecord(parsed)) return { error: failure('bad-request', 'request body must be a JSON object') }
    return { body: parsed }
  } catch {
    return { error: failure('bad-request', 'request body is not valid JSON') }
  }
}

/** Validate the `id` field shared by the read and write endpoints. */
function requireId(body) {
  const id = body.id
  if (typeof id !== 'string' || id === '') return { error: failure('bad-request', 'id must be a non-empty string') }
  return { id }
}

/** Find one configuration row by entry id. */
function findRow(configEditor, id) {
  let rows
  try {
    rows = configEditor.configuration()
  } catch (error) {
    return { error: failure('unavailable', `configuration could not be read: ${error instanceof Error ? error.message : String(error)}`) }
  }
  const row = rows.find((candidate) => candidate.entry?.options?.id === id)
  if (row === undefined) return { error: failure('not-found', `no addressable configuration entry with id ${JSON.stringify(id)}`) }
  return { row }
}

/* ------------------------------------------------------------------ */
/* plugin                                                               */
/* ------------------------------------------------------------------ */

/**
 * Register the three configuration endpoints.
 * @param ctx - owning Cordis context.
 */
export function apply(ctx) {
  const configEditor = ctx.configEditor

  /** Build the entry summary used by the list endpoint. */
  const summarize = (row) => {
    const described = describeRow(row)
    const nativeSchema = row.entry.fiber?.runtime?.Config
    const { fields } = buildFields(nativeSchema, described.values, described.inherited, described.overriddenKeys)
    const status = described.status
    const writableField = fields.some((field) => field.readonly !== true)
    const reasonCode = described.oversized
      ? 'oversized'
      : statusReason(status)
        ?? (fields.length === 0 ? 'no-schema' : writableField ? undefined : 'all-readonly')
    return {
      id: described.id,
      name: described.name,
      status,
      overridden: described.overridden,
      overriddenCount: described.overriddenKeys.size,
      fields: fields.length,
      readonlyFields: fields.filter((field) => field.readonly).length,
      editable: reasonCode === undefined,
      reason: reasonCode,
      bytes: described.bytes,
      category: categorize(described.id, described.name),
      origin: originOf(described.name),
    }
  }

  const handleList = async (request) => {
    const { body, error } = await readBody(request)
    if (error !== undefined) return error
    const query = typeof body.query === 'string' ? body.query.trim().toLowerCase() : ''
    let rows
    try {
      rows = configEditor.configuration()
    } catch (cause) {
      return failure('unavailable', `configuration could not be read: ${cause instanceof Error ? cause.message : String(cause)}`)
    }
    const entries = []
    for (const row of rows) {
      try {
        entries.push(summarize(row))
      } catch (cause) {
        ctx.logger.warn('config-studio: entry summary failed for %s: %s', String(row.entry?.options?.id), String(cause?.message ?? cause))
        entries.push({
          id: row.entry?.options?.id ?? '?',
          name: row.entry?.options?.name,
          status: 'failed',
          overridden: false,
          overriddenCount: 0,
          fields: 0,
          readonlyFields: 0,
          editable: false,
          reason: 'schema-error',
          bytes: 0,
          category: categorize(row.entry?.options?.id, row.entry?.options?.name),
          origin: originOf(row.entry?.options?.name),
        })
      }
    }
    entries.sort((left, right) => String(left.id).localeCompare(String(right.id)))
    const filtered = query === ''
      ? entries
      : entries.filter((entry) => `${entry.id} ${entry.name ?? ''}`.toLowerCase().includes(query))
    const editable = entries.filter((entry) => entry.editable).length
    return json({
      ok: true,
      entries: filtered,
      stats: {
        total: entries.length,
        editable,
        readonly: entries.length - editable,
        overridden: entries.filter((entry) => entry.overridden).length,
        fields: entries.reduce((total, entry) => total + entry.fields, 0),
      },
    })
  }

  const handleRead = async (request) => {
    const { body, error } = await readBody(request)
    if (error !== undefined) return error
    const parsed = requireId(body)
    if (parsed.error !== undefined) return parsed.error
    const found = findRow(configEditor, parsed.id)
    if (found.error !== undefined) return found.error
    const described = describeRow(found.row)
    const nativeSchema = found.row.entry.fiber?.runtime?.Config
    const payload = {
      ok: true,
      id: described.id,
      name: described.name,
      status: described.status,
      overridden: described.overridden,
      overriddenKeys: [...described.overriddenKeys],
      inheritedKeys: Object.keys(described.inherited),
      revision: described.revision,
      bytes: described.bytes,
    }
    if (described.oversized) {
      return json({
        ...payload,
        fields: [],
        readonly: { code: 'oversized', message: `configuration is ${described.bytes} bytes, above the ${MAX_ENTRY_BYTES}-byte editing limit` },
      })
    }
    const statusReasonCode = statusReason(described.status)
    if (statusReasonCode !== undefined) {
      return json({ ...payload, fields: [], readonly: { code: statusReasonCode } })
    }
    if (!isSchemaNode(nativeSchema)) {
      return json({ ...payload, fields: [], readonly: { code: 'no-schema' } })
    }
    const { fields, secretFields } = buildFields(nativeSchema, described.values, described.inherited, described.overriddenKeys)
    if (fields.length === 0) return json({ ...payload, fields, secretFields, readonly: { code: 'no-schema' } })
    return json({ ...payload, fields, secretFields })
  }

  const handleWrite = async (request) => {
    const { body, error } = await readBody(request)
    if (error !== undefined) return error
    const parsed = requireId(body)
    if (parsed.error !== undefined) return parsed.error
    if (typeof body.expectedRevision !== 'string') return failure('bad-request', 'expectedRevision must be a string')
    if (!Array.isArray(body.changes) || body.changes.length === 0) return failure('bad-request', 'changes must be a non-empty array')
    const found = findRow(configEditor, parsed.id)
    if (found.error !== undefined) return found.error
    const described = describeRow(found.row)
    if (described.revision !== body.expectedRevision) {
      return failure('conflict', 'the configuration changed since it was read; reload the entry and try again', {
        revision: described.revision,
      })
    }
    if (described.oversized) return failure('readonly', 'this entry is too large to edit')
    const statusCode = statusReason(described.status)
    if (statusCode !== undefined) return failure('unavailable', `this entry is not editable (${statusCode})`)
    const nativeSchema = found.row.entry.fiber?.runtime?.Config
    if (!isSchemaNode(nativeSchema)) return failure('readonly', 'this entry declares no Config schema')
    const { fields } = buildFields(nativeSchema, described.values, described.inherited, described.overriddenKeys)
    const byKey = new Map(fields.map((field) => [field.key, field]))
    const next = clone(described.current)
    const applied = []
    for (const change of body.changes) {
      if (!isRecord(change) || typeof change.key !== 'string') return failure('bad-request', 'each change needs a string key')
      const field = byKey.get(change.key)
      if (field === undefined) return failure('unknown-field', `unknown configuration field ${JSON.stringify(change.key)}`, { path: change.key })
      if (field.readonly) {
        return failure('readonly', `field ${JSON.stringify(change.key)} is read-only (${field.reason ?? 'unsupported'})`, { path: change.key })
      }
      if (change.reset === true) {
        if (hasOwn(described.inherited, change.key)) next[change.key] = clone(described.inherited[change.key])
        else delete next[change.key]
        applied.push(change.key)
        continue
      }
      if (!hasOwn(change, 'value')) return failure('bad-request', `change for ${JSON.stringify(change.key)} has no value`)
      next[change.key] = clone(change.value)
      applied.push(change.key)
    }
    let issues
    try {
      const candidate = sanitizeForValidation(next, found.row.entry.fiber?.config ?? {})
      const result = nativeSchema['~standard'].validate(candidate)
      if (result !== undefined && typeof result.then === 'function') {
        return failure('validation', 'this plugin validates configuration asynchronously and cannot be edited here')
      }
      issues = result?.issues
    } catch (cause) {
      return failure('validation', cause instanceof Error ? cause.message : String(cause))
    }
    if (Array.isArray(issues) && issues.length > 0) {
      const first = issues[0]
      const secretValues = inspectValue(nativeSchema, described.values).secretValues
        .concat(inspectValue(nativeSchema, found.row.entry.fiber?.config ?? {}).secretValues)
      return failure('validation', scrubSecrets(first?.message ?? 'configuration is invalid', secretValues), {
        path: Array.isArray(first?.path) ? first.path.join('.') : undefined,
        issues: issues.slice(0, 8).map((issue) => ({
          message: scrubSecrets(issue?.message, secretValues),
          path: Array.isArray(issue?.path) ? issue.path.join('.') : undefined,
        })),
      })
    }
    try {
      await configEditor.edit(found.row.entry, () => next)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause)
      if (/^invalid config:/.test(message)) {
        const at = /\(at ([^)]+)\)/.exec(message)
        return failure('validation', message, { path: at?.[1] })
      }
      const code = /overridden by a home patch|command-line overlay/.test(message)
        ? 'overridden'
        : /no longer available|changed during|no longer active/.test(message)
          ? 'stale'
          : 'write-failed'
      ctx.logger.warn('config-studio: write failed for %s (%s)', String(described.id), code)
      return failure(code, message)
    }
    const after = findRow(configEditor, described.id)
    const revision = after.row === undefined ? undefined : describeRow(after.row).revision
    ctx.logger.info('config-studio: applied %d change(s) to %s', applied.length, String(described.id))
    return json({
      ok: true,
      revision,
      applied,
      restoredDefault: after.row === undefined ? false : Object.keys(after.row.override ?? {}).length === 0,
    })
  }

  for (const [endpoint, handler] of [
    ['list', handleList],
    ['read', handleRead],
    ['write', handleWrite],
  ]) {
    ctx.connection.fetch.register({
      path: `${ROUTE_PREFIX}/${endpoint}`,
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: async (request) => {
        try {
          return await handler(request)
        } catch (cause) {
          ctx.logger.warn('config-studio: %s failed: %s', endpoint, String(cause?.message ?? cause))
          return failure('internal', 'the configuration service failed unexpectedly')
        }
      },
    })
  }
}
