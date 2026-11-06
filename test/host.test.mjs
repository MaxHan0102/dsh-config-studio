import test from 'node:test'
import assert from 'node:assert/strict'
import { createHarness, z } from './fixtures.mjs'
const one = (definition, options) => createHarness([definition], options)

test('effective defaults and full replacement are projected without merging layers', async () => {
  const h = one({
    schema: z.object({ a: z.number(), b: z.number().default(50), enabled: z.boolean().default(true) }),
    inherited: { a: 1, b: 2 },
    override: { a: 9 },
    current: { a: 9 },
  })
  const { fields } = await h.read()
  assert.equal(fields.find((f) => f.key === 'b').value, 50)
  assert.equal(fields.find((f) => f.key === 'b').inherited, 2)
  assert.equal(fields.find((f) => f.key === 'enabled').value, true)
  assert.equal((await h.write([{ key: 'enabled', value: false }])).ok, true)
  assert.equal(h.rows[0].entry.options.config.enabled, false)
})

test('ordinary saves, resets and host validation', async () => {
  const h = one({ schema: z.object({ count: z.number().min(1) }), inherited: { count: 2 } })
  assert.equal((await h.write([{ key: 'count', value: 3 }])).ok, true)
  assert.equal((await h.write([{ key: 'count', value: -1 }])).error.code, 'validation')
  assert.equal((await h.write([{ key: 'count', reset: true }])).restoredDefault, true)
})

test('race between revision check and writer lock is rejected', async () => {
  const h = one(
    { schema: z.object({ a: z.number(), b: z.number() }), inherited: { a: 1, b: 1 } },
    {
      beforeEdit(row) {
        row.entry.options.config.b = 99
        row.override = { a: 1, b: 99 }
      },
    },
  )
  assert.equal((await h.write([{ key: 'a', value: 2 }])).error.code, 'conflict')
  assert.equal(h.rows[0].entry.options.config.b, 99)
  assert.equal(h.writes, 0)
})

test('two concurrent requests cannot overwrite each other', async () => {
  const h = one({ schema: z.object({ a: z.number() }), inherited: { a: 1 } })
  const { revision } = await h.read()
  const results = await Promise.all(
    [2, 3].map((value) =>
      h.call('write', { id: 'fixture', expectedRevision: revision, changes: [{ key: 'a', value }] }),
    ),
  )
  assert.equal(results.filter((r) => r.ok).length, 1)
  assert.equal(results.filter((r) => r.error?.code === 'conflict').length, 1)
})

for (const [label, schema, inherited, current] of [
  ['top-level', z.object({ token: z.string().role('secret') }), { token: 'PRIVATE-TOP' }],
  [
    'tuple',
    z.object({ pair: z.tuple([z.string(), z.string().role('secret')]) }),
    { pair: ['name', 'PRIVATE-TUPLE'] },
  ],
  [
    'inherited array',
    z.object({ accounts: z.array(z.object({ token: z.string().role('secret') })) }),
    { accounts: [{ token: 'PRIVATE-INHERITED' }] },
    { accounts: [] },
  ],
  [
    'nested credential reference',
    z.object({ account: z.object({ ref: z.string().role('credential-ref') }) }),
    { account: { ref: 'PRIVATE-REF' } },
  ],
])
  test(`credential data is absent from every response branch: ${label}`, async () => {
    const h = one({ schema, inherited, current: current ?? inherited, override: current ?? {} })
    const result = await h.read()
    assert.equal(JSON.stringify(result).includes('PRIVATE-'), false)
    assert.equal(result.fields[0].readonly, true)
    if (label === 'inherited array') assert.equal(result.fields[0].configured, false)
    const write = await h.write([{ key: result.fields[0].key, value: 'replacement' }])
    assert.equal(write.error.code, 'readonly')
    assert.equal(JSON.stringify(await h.call('list')).includes('PRIVATE-'), false)
  })

test('thrown validator and writer messages never disclose secret values', async () => {
  const schema = z.object({ token: z.string().role('secret'), count: z.number() })
  for (const useWriter of [false, true]) {
    const h = one(
      {
        schema: useWriter
          ? schema
          : z.transform(schema, (v) => {
              throw new Error(`rejected ${v.token}`)
            }),
        inherited: { token: 'PRIVATE-ERROR', count: 1 },
      },
      useWriter ? { editThrow: 'invalid config: PRIVATE-ERROR' } : {},
    )
    const result = await h.write([{ key: 'count', value: 2 }])
    assert.equal(result.error.code, 'validation')
    assert.equal(JSON.stringify(result).includes('PRIVATE-ERROR'), false)
    assert.equal(JSON.stringify(h.logs).includes('PRIVATE-ERROR'), false)
  }
})

test('expressions are found inside any and rejected on every write level', async () => {
  const marker = { __jsExpr: '1 + 1' }
  const existing = one({ schema: z.object({ options: z.any() }), inherited: { options: { a: [marker] } } })
  assert.equal((await existing.read()).fields[0].reason, 'expression')
  assert.equal(JSON.stringify(await existing.read()).includes('__jsExpr'), false)
  const clean = one({ schema: z.object({ options: z.any() }), inherited: { options: {} } })
  assert.equal(
    (await clean.write([{ key: 'options', value: { nested: [marker] } }])).error.code,
    'expression',
  )
  assert.equal(clean.writes, 0)
})

test('existing expressions in unrelated fields are preserved during validation', async () => {
  const h = one({
    schema: z.object({ resolved: z.number(), count: z.number() }),
    inherited: { resolved: { __jsExpr: '2' }, count: 1 },
  })
  h.rows[0].entry.fiber.config = { resolved: 2, count: 1 }
  assert.equal((await h.write([{ key: 'count', value: 3 }])).ok, true)
  assert.deepEqual(h.rows[0].entry.options.config.resolved, { __jsExpr: '2' })
})

test('40 KB entries stay editable; oversized candidates are rejected and old entries can shrink', async () => {
  const h = one({ schema: z.object({ text: z.string() }), inherited: { text: '' } })
  assert.equal((await h.write([{ key: 'text', value: 'x'.repeat(40000) }])).ok, true)
  const read = await h.read()
  assert.equal(read.oversized, false)
  assert.equal(read.readonly, undefined)
  assert.equal((await h.write([{ key: 'text', value: 'x'.repeat(70000) }])).error.code, 'oversized')
  h.rows[0].entry.options.config.text = 'x'.repeat(70000)
  assert.equal((await h.write([{ key: 'text', reset: true }])).ok, true)
})

test('numeric union retains all branches and accepts second-branch values', async () => {
  const h = one({
    schema: z.object({ count: z.union([z.number().max(0), z.number().min(10)]) }),
    inherited: { count: 10 },
  })
  const field = (await h.read()).fields[0]
  assert.equal(field.maximum, undefined)
  assert.equal(field.alternatives.length, 2)
  assert.equal((await h.write([{ key: 'count', value: 20 }])).ok, true)
})

test('session undo restores raw absence, uses a revision and returns no old values', async () => {
  const h = one({ schema: z.object({ enabled: z.boolean().default(true) }) })
  await h.write([{ key: 'enabled', value: false }])
  const read = await h.read()
  assert.equal(read.history[0].canUndo, true)
  assert.equal(read.history[0].previous, undefined)
  const undo = await h.call('write', {
    id: 'fixture',
    expectedRevision: read.revision,
    undo: read.history[0].id,
  })
  assert.equal(undo.ok, true)
  assert.equal('enabled' in h.rows[0].entry.options.config, false)
  assert.equal((await h.read()).fields[0].value, true)
})

test('unknown, readonly and duplicate fields are refused without writes', async () => {
  const h = one({ schema: z.object({ count: z.number() }) })
  assert.equal((await h.write([{ key: 'unknown', value: 1 }])).error.code, 'unknown-field')
  assert.equal(
    (
      await h.write([
        { key: 'count', value: 1 },
        { key: 'count', value: 2 },
      ])
    ).error.code,
    'bad-request',
  )
  assert.equal(h.writes, 0)
})

test('UTF-8 request cap counts bytes rather than JavaScript characters', async () => {
  const h = one({ schema: z.object({ text: z.string() }) })
  const result = await h.call('list', { query: '汉'.repeat(100000) })
  assert.equal(result.error.code, 'body-too-large')
})
test('nullable raw values follow schema defaults and root credentials are protected', async () => {
  const h = one({ schema: z.object({ enabled: z.boolean().default(true) }), inherited: { enabled: null } })
  assert.equal((await h.read()).fields[0].value, true)
  const protectedRoot = one({
    schema: z.transform(z.object({ token: z.string() }).role('secret'), (value) => value),
    inherited: { token: 'PRIVATE-ROOT' },
  })
  assert.equal(JSON.stringify(await protectedRoot.read()).includes('PRIVATE-ROOT'), false)
})

test('a later external write cannot be captured as the revision for undo', async () => {
  const h = one(
    { schema: z.object({ count: z.number() }), inherited: { count: 1 } },
    {
      afterEdit(row) {
        row.entry.options.config.count = 99
        row.override = { count: 99 }
      },
    },
  )
  assert.equal((await h.write([{ key: 'count', value: 2 }])).ok, true)
  assert.equal(h.rows[0].entry.options.config.count, 99)
  assert.deepEqual((await h.read()).history, [])
})

test('unprojectable root schemas stay readonly without dropping secret roles', async () => {
  const h = one({
    schema: z.intersect([z.object({ token: z.string().role('secret') }), z.object({ token: z.string() })]),
    inherited: { token: 'PRIVATE-INTERSECTION' },
  })
  const read = await h.read()
  assert.equal(read.readonly.code, 'no-schema')
  assert.deepEqual(read.fields, [])
  assert.equal(JSON.stringify(read).includes('PRIVATE-INTERSECTION'), false)
})
