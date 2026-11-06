/** Configuration endpoints. Derive mutations inside the host writer's lock. */
import { basename, dirname } from 'node:path'
import { randomUUID, createHash } from 'node:crypto'
import {
  MAX_BODY_BYTES,
  MAX_ENTRY_BYTES,
  hasOwn,
  isRecord,
  clone,
  equal,
  byteSize,
  isSchemaNode,
  buildFields,
  revisionOf,
  EditError,
  applyChanges,
} from './config-model.js'
import { categorize, originOf, entryStatus, statusReason } from './classification.js'

export const name = 'dsh-config-studio'
export const inject = ['configEditor', 'connection']

function json(payload) {
  return new Response(JSON.stringify(payload), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
function failure(code, message, extra = {}) {
  return json({ ok: false, error: { code, message, ...extra } })
}

async function readBody(request) {
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES)
    throw new EditError('body-too-large', 'Request exceeds 256 KB.')
  const reader = request.body?.getReader()
  const chunks = []
  let bytes = 0
  if (reader) {
    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        bytes += value.byteLength
        if (bytes > MAX_BODY_BYTES) {
          await reader.cancel()
          throw new EditError('body-too-large', 'Request exceeds 256 KB.')
        }
        chunks.push(Buffer.from(value))
      }
    } finally {
      reader.releaseLock()
    }
  }
  let body
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
  } catch {
    throw new EditError('bad-request', 'Expected a JSON object.')
  }
  if (!isRecord(body)) throw new EditError('bad-request', 'Expected a JSON object.')
  return body
}

function describeRow(row, current = row.entry.options?.config ?? {}, inherited = row.inherited ?? {}) {
  const entry = row.entry
  const override = isRecord(row.override) ? row.override : {}
  current = isRecord(current) ? current : {}
  inherited = isRecord(inherited) ? inherited : {}
  const id = entry.options.id
  return {
    id,
    name: entry.options.name,
    entry,
    schema: entry.fiber?.runtime?.Config,
    current,
    inherited,
    override,
    live: entry.fiber?.config ?? {},
    status: entryStatus(entry),
    overridden: Object.keys(override).length > 0,
    bytes: byteSize(current),
    revision: revisionOf(id, inherited, override, current),
  }
}

export function apply(ctx) {
  const editor = ctx.configEditor
  // Bounded, host-only session history. Configuration values are never logged.
  const histories = new Map()
  const profilePath = typeof editor.documentPath === 'string' ? editor.documentPath : ''
  const profile = {
    name: profilePath ? basename(dirname(profilePath)) : 'active',
    path: profilePath,
    key: createHash('sha256')
      .update(profilePath || 'active')
      .digest('hex')
      .slice(0, 16),
  }

  function find(id) {
    if (typeof id !== 'string' || !id || id.length > 512)
      throw new EditError('bad-request', 'Expected an entry id.')
    let rows
    try {
      rows = editor.configuration()
    } catch {
      throw new EditError('unavailable', 'Configuration could not be read.')
    }
    const row = rows.find((item) => item.entry?.options?.id === id)
    if (!row) throw new EditError('not-found', 'This configuration entry is no longer available.')
    return row
  }
  function project(d) {
    return buildFields(d.schema, d.current, d.inherited, d.override, d.live)
  }

  function snapshot(row) {
    const d = describeRow(row)
    const reason = statusReason(d.status) ?? (!isSchemaNode(d.schema) ? 'no-schema' : undefined)
    const projected = reason ? { fields: [], secretFields: [] } : project(d)
    const readonlyReason = reason ?? (projected.fields.length === 0 ? 'no-schema' : undefined)
    const history = histories.get(d.id) ?? []
    return {
      ok: true,
      id: d.id,
      name: d.name,
      profile,
      status: d.status,
      overridden: d.overridden,
      revision: d.revision,
      bytes: d.bytes,
      limitBytes: MAX_ENTRY_BYTES,
      oversized: d.bytes > MAX_ENTRY_BYTES,
      ...projected,
      readonly: readonlyReason ? { code: readonlyReason } : undefined,
      history: history.map((item, index) => ({
        id: item.id,
        time: item.time,
        keys: item.keys,
        canUndo: index === 0 && item.afterRevision === d.revision && item.name === d.name,
      })),
    }
  }

  const list = async (body) => {
    let rows
    try {
      rows = editor.configuration()
    } catch {
      throw new EditError('unavailable', 'Configuration could not be read.')
    }
    const entries = rows
      .map((row) => {
        try {
          const d = describeRow(row)
          const fields = project(d).fields
          const reason =
            statusReason(d.status) ??
            (!fields.length ? 'no-schema' : fields.every((f) => f.readonly) ? 'all-readonly' : undefined)
          return {
            id: d.id,
            name: d.name,
            status: d.status,
            overridden: d.overridden,
            bytes: d.bytes,
            fields: fields.length,
            readonlyFields: fields.filter((f) => f.readonly).length,
            editable: !reason,
            reason,
            category: categorize(d.id, d.name),
            origin: originOf(d.name),
            fieldNames: fields.map((f) => ({
              key: f.key,
              description: f.description,
              descriptions: f.descriptions,
            })),
          }
        } catch {
          return {
            id: row.entry?.options?.id ?? '?',
            name: row.entry?.options?.name,
            status: 'failed',
            editable: false,
            reason: 'schema-error',
            fields: 0,
            category: categorize(row.entry?.options?.id, row.entry?.options?.name),
            origin: originOf(row.entry?.options?.name),
            fieldNames: [],
          }
        }
      })
      .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    const query = typeof body.query === 'string' ? body.query.trim().toLowerCase() : ''
    return {
      ok: true,
      profile,
      entries: query ? entries.filter((e) => `${e.id} ${e.name}`.toLowerCase().includes(query)) : entries,
      stats: {
        total: entries.length,
        editable: entries.filter((e) => e.editable).length,
        readonly: entries.filter((e) => !e.editable).length,
        overridden: entries.filter((e) => e.overridden).length,
      },
    }
  }

  const write = async (body) => {
    const row = find(body.id)
    const first = describeRow(row)
    if (typeof body.expectedRevision !== 'string')
      throw new EditError('bad-request', 'Expected a configuration revision.')
    if (first.revision !== body.expectedRevision)
      throw new EditError('conflict', 'Configuration changed. Review the latest version before saving.')
    let changes = body.changes
    if (body.undo !== undefined) {
      const record = histories.get(body.id)?.[0]
      if (
        !record ||
        record.id !== body.undo ||
        record.afterRevision !== first.revision ||
        record.name !== first.name
      ) {
        throw new EditError('conflict', 'This previous version can no longer be restored automatically.')
      }
      changes = record.previous
    }
    if (!Array.isArray(changes) || !changes.length || changes.length > 512)
      throw new EditError('bad-request', 'Expected field changes.')
    let record
    let expectedCurrent
    let expectedInherited
    try {
      await editor.edit(row.entry, (lockedCurrent, lockedInherited) => {
        const lockedRow = find(body.id)
        if (lockedRow.entry !== row.entry)
          throw new EditError('stale', 'The entry was replaced. Reload before saving.')
        const locked = describeRow(lockedRow, lockedCurrent, lockedInherited)
        // The host has acquired its file/HMR lock and reconciled external writes.
        if (locked.revision !== body.expectedRevision)
          throw new EditError('conflict', 'Configuration changed. Review the latest version before saving.')
        if (statusReason(locked.status)) throw new EditError('unavailable', 'This plugin is not active.')
        if (!isSchemaNode(locked.schema))
          throw new EditError('readonly', 'This plugin has no editable schema.')
        const next = applyChanges(locked, changes)
        expectedCurrent = clone(next)
        expectedInherited = clone(locked.inherited)
        const keys = changes.map((change) => change.key)
        record =
          locked.bytes <= MAX_ENTRY_BYTES
            ? {
                id: randomUUID(),
                name: locked.name,
                time: new Date().toISOString(),
                keys,
                previous: keys.map((key) =>
                  hasOwn(locked.current, key)
                    ? { key, value: clone(locked.current[key]) }
                    : { key, unset: true },
                ),
              }
            : undefined
        return next
      })
    } catch (error) {
      if (error instanceof EditError) throw error
      const message = String(error?.message ?? '')
      const code = /overridden by a home patch|command-line overlay/.test(message)
        ? 'overridden'
        : /no longer available|changed during|no longer active/.test(message)
          ? 'stale'
          : /invalid config:/i.test(message)
            ? 'validation'
            : 'write-failed'
      // Never return/log third-party exception text, which may contain credentials.
      throw new EditError(
        code,
        {
          overridden: 'A higher-priority configuration overrides this entry.',
          stale: 'The entry changed during the save.',
          validation: 'The plugin rejected this configuration.',
          'write-failed': 'The host could not apply the configuration.',
        }[code],
      )
    }
    let after
    try {
      after = describeRow(find(body.id))
    } catch {
      /* A save may unload its own entry. */
    }
    if (
      record &&
      after &&
      equal(after.current, expectedCurrent) &&
      equal(after.inherited, expectedInherited)
    ) {
      record.afterRevision = after.revision
      const history = histories.get(body.id) ?? []
      histories.delete(body.id)
      histories.set(body.id, [record, ...history].slice(0, 5))
      while (histories.size > 24) histories.delete(histories.keys().next().value)
    }
    ctx.logger.info('config-studio: applied %d field change(s)', changes.length)
    return {
      ok: true,
      revision: after?.revision,
      applied: changes.map((change) => change.key),
      restoredDefault: after ? equal(after.current, after.inherited) : false,
      refreshRequired: !after,
      undone: body.undo !== undefined,
    }
  }

  for (const [endpoint, handle] of [
    ['list', list],
    ['read', (body) => snapshot(find(body.id))],
    ['write', write],
  ]) {
    ctx.connection.fetch.register({
      path: `/api/config-studio/${endpoint}`,
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: async (request) => {
        try {
          return json(await handle(await readBody(request)))
        } catch (error) {
          if (error instanceof EditError) return failure(error.code, error.message, error.extra)
          ctx.logger.warn('config-studio: %s failed', endpoint)
          return failure('internal', 'The configuration service could not complete the request.')
        }
      },
    })
  }
}
