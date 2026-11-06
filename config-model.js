import { createHash } from 'node:crypto'
import { isDeepStrictEqual } from 'node:util'

export const MAX_ENTRY_BYTES = 64 * 1024
export const MAX_BODY_BYTES = 256 * 1024
export const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key)
export const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value)
export const clone = (value) => (value === undefined ? undefined : structuredClone(value))
export const equal = isDeepStrictEqual
export const isExpression = (value) =>
  isRecord(value) && Object.keys(value).length === 1 && typeof value.__jsExpr === 'string'
export const isSchemaNode = (node) =>
  node != null && ['object', 'function'].includes(typeof node) && typeof node.type === 'string'
export const byteSize = (value) => Buffer.byteLength(JSON.stringify(value) ?? 'null')

/** Scan raw data independently of its schema (including any/unknown properties). */
export function containsExpression(value, seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return false
  if (isExpression(value)) return true
  seen.add(value)
  return Object.values(value).some((child) => containsExpression(child, seen))
}

/** Protect declared credentials even when the current array/object is empty. */
function sensitiveRole(node, seen = new Set()) {
  if (!isSchemaNode(node) || seen.has(node)) return undefined
  seen.add(node)
  if (node.meta?.role === 'secret' || node.meta?.role === 'credential-ref') return node.meta.role
  const children = [...Object.values(node.dict ?? {}), ...(node.list ?? []), node.inner, node.sKey]
  for (const child of children) {
    const role = sensitiveRole(child, seen)
    if (role) return role
  }
}

function credentialPresent(node, value, seen = new Set()) {
  if (!isSchemaNode(node) || seen.has(node)) return false
  const ancestors = new Set(seen).add(node)
  value = value ?? node.meta?.default
  if (['secret', 'credential-ref'].includes(node.meta?.role)) {
    return (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      (typeof value !== 'object' || Object.keys(value).length > 0)
    )
  }
  if (node.type === 'object')
    return Object.entries(node.dict ?? {}).some(([key, child]) =>
      credentialPresent(child, value?.[key], ancestors),
    )
  if (node.type === 'array')
    return Array.isArray(value) && value.some((item) => credentialPresent(node.inner, item, ancestors))
  if (node.type === 'tuple')
    return (node.list ?? []).some((child, index) => credentialPresent(child, value?.[index], ancestors))
  if (node.type === 'dict')
    return (
      isRecord(value) && Object.values(value).some((item) => credentialPresent(node.inner, item, ancestors))
    )
  if (node.list) return node.list.some((child) => credentialPresent(child, value, ancestors))
  return credentialPresent(node.inner, value, ancestors)
}

function unwrap(node) {
  const seen = new Set()
  while (
    isSchemaNode(node) &&
    ['lazy', 'transform'].includes(node.type) &&
    isSchemaNode(node.inner) &&
    !seen.has(node)
  ) {
    seen.add(node)
    node = node.inner
  }
  return node
}

/** Schemastery may return VolatileRef values; only unwrap its documented marker. */
function liveValue(value) {
  if (
    value &&
    typeof value === 'object' &&
    Symbol.for('cosmokit.volatile.write') in value &&
    typeof value.get === 'function'
  )
    return value.get()
  return value
}

function safeCopy(value) {
  try {
    value = liveValue(value)
    if (value === undefined) return undefined
    const json = JSON.stringify(value)
    return json === undefined ? undefined : JSON.parse(json)
  } catch {
    return undefined
  }
}

function defaultValue(node) {
  const direct = node?.meta?.default
  if (direct !== undefined) return safeCopy(direct)
  const inner = unwrap(node)
  return inner !== node ? safeCopy(inner?.meta?.default) : undefined
}

export function humanize(key) {
  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
  return spaced ? spaced[0].toUpperCase() + spaced.slice(1) : key
}

/** Only publish schema metadata for fields that contain no credential role. */
function shapeOf(node, depth = 0) {
  if (!isSchemaNode(node) || depth > 6) return { kind: 'unsupported' }
  const meta = node.meta ?? {}
  let shape
  switch (node.type) {
    case 'string':
      shape = {
        kind: 'string',
        minLength: meta.min,
        maxLength: meta.max,
        pattern: meta.pattern?.source,
        patternFlags: meta.pattern?.flags,
      }
      break
    case 'number':
      shape = {
        kind: 'number',
        minimum: meta.min,
        maximum: meta.max,
        integer: meta.step === 1,
        multipleOf: meta.step ? Math.abs(meta.step) : undefined,
      }
      break
    case 'boolean':
      shape = { kind: 'boolean' }
      break
    case 'const':
      shape = { kind: 'enum', options: [{ value: safeCopy(node.value), label: String(node.value) }] }
      break
    case 'union': {
      const list = (node.list ?? []).filter(isSchemaNode)
      if (list.length && list.every((child) => child.type === 'const')) {
        shape = {
          kind: 'enum',
          options: list.map((child) => ({ value: safeCopy(child.value), label: String(child.value) })),
        }
      } else {
        const alternatives = list.map((child) => shapeOf(child, depth + 1))
        const kinds = new Set(alternatives.map((child) => child.kind))
        // Do not apply just the first branch's bounds to the entire union.
        shape = { kind: kinds.size === 1 ? alternatives[0].kind : 'json', alternatives }
      }
      break
    }
    case 'object':
      shape = {
        kind: 'object',
        properties: Object.fromEntries(
          Object.entries(node.dict ?? {}).map(([key, child]) => [key, shapeOf(child, depth + 1)]),
        ),
      }
      break
    case 'array':
      shape = { kind: 'array', items: shapeOf(node.inner, depth + 1), minItems: meta.min, maxItems: meta.max }
      break
    case 'tuple':
      shape = { kind: 'array' }
      break
    case 'dict':
    case 'intersect':
    case 'any':
      shape = { kind: 'json' }
      break
    case 'transform':
    case 'lazy':
      shape = { ...shapeOf(node.inner, depth + 1), partial: node.type === 'transform' }
      break
    default:
      shape = { kind: 'unsupported' }
  }
  return {
    ...shape,
    required: meta.required === true,
    default: defaultValue(node),
    description: typeof meta.description === 'string' ? meta.description : undefined,
    descriptions: isRecord(meta.description) ? safeCopy(meta.description) : undefined,
  }
}

function rootFields(schema) {
  const root = unwrap(schema)
  if (root?.type === 'object') return root.dict ?? {}
  // A root intersection can redefine a field's role in another branch. Until
  // all branches can be projected together, keep it read-only rather than lose
  // credential annotations while flattening dictionaries.
  return {}
}

function effective(node, raw, live) {
  // Inputs must keep the pre-transform representation when explicitly set.
  const fallback = defaultValue(node)
  if (raw !== undefined && (raw !== null || fallback === undefined)) return safeCopy(raw)
  return fallback !== undefined ? fallback : safeCopy(live)
}

/** Project all output branches only after sensitive data checks. */
export function buildFields(schema, current = {}, inherited = {}, override = {}, live = {}) {
  const fields = []
  const secretFields = []
  const rootSensitive = [schema?.meta?.role, unwrap(schema)?.meta?.role].find((role) =>
    ['secret', 'credential-ref'].includes(role),
  )
  for (const [key, child] of Object.entries(rootFields(schema))) {
    if (!isSchemaNode(child) || child.meta?.hidden === true) continue
    const meta = child.meta ?? {}
    const role = rootSensitive ?? sensitiveRole(child)
    const raw = hasOwn(current, key) ? current[key] : undefined
    const inheritedRaw = hasOwn(inherited, key) ? inherited[key] : undefined
    const expression =
      isExpression(current) ||
      isExpression(inherited) ||
      containsExpression(raw) ||
      containsExpression(inheritedRaw) ||
      containsExpression(meta.default)
    const shape = role ? { kind: 'unsupported' } : shapeOf(child)
    const reason =
      role === 'secret'
        ? meta.role === 'secret'
          ? 'secret'
          : 'contains-secret'
        : role === 'credential-ref'
          ? 'credential-ref'
          : expression
            ? 'expression'
            : meta.disabled === true
              ? 'disabled'
              : shape.kind === 'unsupported'
                ? 'unsupported'
                : undefined
    const overridden = hasOwn(override, key)
    const field = {
      key,
      label: humanize(key),
      kind: shape.kind,
      required: meta.required === true,
      overridden,
      readonly: reason !== undefined,
      reason,
      volatile: meta.volatile === true,
      partial: shape.partial === true,
    }
    if (role || expression) {
      if (role) {
        field.configured = rootSensitive ? raw !== undefined : credentialPresent(child, raw)
        secretFields.push(key)
      } else field.expression = true
      // Values, defaults, enum options and inherited data stay on the host.
    } else {
      Object.assign(field, shape, {
        value: effective(child, raw, live?.[key]),
        rawValue: safeCopy(raw),
        isSet: hasOwn(current, key),
        inherited: effective(child, inheritedRaw, undefined),
        inheritedRaw: safeCopy(inheritedRaw),
        hasInherited: hasOwn(inherited, key),
        source:
          overridden && equal(raw, override[key])
            ? 'override'
            : hasOwn(current, key)
              ? hasOwn(inherited, key) && equal(raw, inheritedRaw)
                ? 'inherited'
                : 'overlay'
              : defaultValue(child) !== undefined
                ? 'default'
                : 'unset',
        resetSource: hasOwn(inherited, key)
          ? 'inherited'
          : defaultValue(child) !== undefined
            ? 'default'
            : 'unset',
      })
    }
    fields.push(field)
  }
  return { fields, secretFields }
}

export function revisionOf(id, inherited, override, current) {
  return createHash('sha256')
    .update('config-studio/3\0')
    .update(String(id))
    .update('\0')
    .update(JSON.stringify([inherited, override, current]))
    .digest('hex')
    .slice(0, 24)
}

export class EditError extends Error {
  constructor(code, message, extra = {}) {
    super(message)
    this.code = code
    this.extra = extra
  }
}

/** Never send exception messages or invalid values from third-party code. */
export function validateCandidate(schema, candidate, live) {
  const sanitize = (value, currentLive) => {
    if (isExpression(value)) return safeCopy(liveValue(currentLive))
    if (Array.isArray(value)) return value.map((child, i) => sanitize(child, currentLive?.[i]))
    if (isRecord(value))
      return Object.fromEntries(
        Object.entries(value).map(([key, child]) => [key, sanitize(child, currentLive?.[key])]),
      )
    return value
  }
  let result
  try {
    result = schema['~standard'].validate(sanitize(candidate, live))
  } catch {
    throw new EditError('validation', 'The plugin rejected this configuration.')
  }
  if (result && typeof result.then === 'function') {
    Promise.resolve(result).catch(() => {})
    throw new EditError('validation', 'Asynchronous validation is not supported for this entry.')
  }
  if (result?.issues?.length) {
    const keys = new Set(Object.keys(rootFields(schema)))
    const path = result.issues[0]?.path?.[0]
    throw new EditError('validation', 'The value does not satisfy the plugin configuration schema.', {
      path: typeof path === 'string' && keys.has(path) ? path : undefined,
    })
  }
}

/** Build edits from the lock-protected current state. */
export function applyChanges({ schema, current, inherited, override, live }, changes) {
  const { fields } = buildFields(schema, current, inherited, override, live)
  const byKey = new Map(fields.map((field) => [field.key, field]))
  const next = clone(current)
  const seen = new Set()
  for (const change of changes) {
    if (!isRecord(change) || typeof change.key !== 'string' || seen.has(change.key))
      throw new EditError('bad-request', 'Changes must use unique field names.')
    seen.add(change.key)
    const field = byKey.get(change.key)
    if (!field) throw new EditError('unknown-field', 'This field is not available.')
    if (field.readonly)
      throw new EditError('readonly', 'This field cannot be edited here.', { path: change.key })
    if (Number(change.reset === true) + Number(change.unset === true) + Number(hasOwn(change, 'value')) !== 1)
      throw new EditError('bad-request', 'Each change needs exactly one operation.')
    let value
    if (change.reset === true)
      value = hasOwn(inherited, change.key) ? clone(inherited[change.key]) : undefined
    else if (change.unset !== true) {
      if (containsExpression(change.value))
        throw new EditError('expression', 'Expressions cannot be introduced through the form.', {
          path: change.key,
        })
      value = clone(change.value)
    }
    if (value === undefined) delete next[change.key]
    else
      Object.defineProperty(next, change.key, { value, enumerable: true, configurable: true, writable: true })
  }
  if (byteSize(next) > MAX_ENTRY_BYTES)
    throw new EditError('oversized', 'The resulting configuration exceeds 64 KB.')
  validateCandidate(schema, next, live)
  return next
}
