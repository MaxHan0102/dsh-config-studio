import z from '@deepseek-ai/schemastery'
import { apply } from '../index.js'
import { equal } from '../config-model.js'

export { z }
export function createHarness(definitions, options = {}) {
  const rows = definitions.map(
    ({
      id = 'fixture',
      name = 'fixture-plugin',
      schema,
      inherited = {},
      override = {},
      current = inherited,
      state = 2,
    }) => ({
      entry: {
        options: { id, name, config: structuredClone(current) },
        fiber: { state, runtime: { Config: schema }, config: {} },
      },
      inherited: structuredClone(inherited),
      override: structuredClone(override),
    }),
  )
  const resolve = (row) => {
    try {
      row.entry.fiber.config = row.entry.fiber.runtime.Config(structuredClone(row.entry.options.config))
    } catch {}
  }
  rows.forEach(resolve)
  const routes = new Map()
  const logs = []
  let queue = Promise.resolve()
  let writes = 0
  const editor = {
    documentPath: '/isolated-test/profiles/review/cordis.patch.yml',
    configuration: () => rows,
    edit: (entry, change) => {
      const run = queue.then(async () => {
        const row = rows.find((row) => row.entry === entry)
        if (options.beforeEdit) await options.beforeEdit(row)
        if (options.editThrow) throw new Error(options.editThrow)
        const next = change(structuredClone(entry.options.config), structuredClone(row.inherited))
        entry.options.config = structuredClone(next)
        row.override = equal(next, row.inherited) ? {} : structuredClone(next)
        resolve(row)
        writes++
        if (options.afterEdit) await options.afterEdit(row)
      })
      queue = run.catch(() => {})
      return run
    },
  }
  apply({
    configEditor: editor,
    connection: { fetch: { register: (route) => routes.set(route.path, route.fetch) } },
    logger: { info: (...args) => logs.push(args), warn: (...args) => logs.push(args) },
  })
  const call = async (endpoint, body = {}) =>
    (
      await routes.get(`/api/config-studio/${endpoint}`)(
        new Request(`http://localhost/${endpoint}`, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: { 'content-type': 'application/json' },
        }),
      )
    ).json()
  return {
    rows,
    routes,
    call,
    logs,
    resolve,
    get writes() {
      return writes
    },
    read: (id = 'fixture') => call('read', { id }),
    write: async (changes, id = 'fixture', extra = {}) => {
      const snapshot = await call('read', { id })
      return call('write', { id, expectedRevision: snapshot.revision, changes, ...extra })
    },
  }
}

export function demoDefinitions() {
  return [
    {
      id: 'ui-theme',
      name: '@deepseek-ai/dsh-client-ui-theme',
      schema: z.object({
        preference: z.union(['light', 'dark', 'system']).default('system').volatile(),
        fontSize: z
          .number()
          .step(1)
          .min(10)
          .max(22)
          .default(14)
          .volatile()
          .description({ zh: '正文显示字号，单位为像素。', en: 'Conversation text size in pixels.' }),
        codeFontSize: z.number().step(1).min(9).max(20).default(11).volatile(),
        enabled: z
          .boolean()
          .default(true)
          .description({ zh: '测试默认开启的开关。', en: 'A setting enabled by default.' }),
        textFontFamily: z.string().default(''),
      }),
      inherited: { preference: 'system' },
    },
    {
      id: 'agent-default-model',
      name: '@deepseek-ai/dsh-agent-default-model',
      schema: z.object({
        provider: z.string().required(),
        model: z.string().required(),
        reasoningEffort: z.union(['low', 'medium', 'high']).default('medium'),
        timeout: z
          .number()
          .min(1)
          .max(300)
          .default(60)
          .description({ zh: '请求超时，单位为秒。', en: 'Request timeout in seconds.' }),
      }),
      inherited: { provider: 'demo', model: 'review-model' },
    },
    {
      id: 'review-tools',
      name: 'review-fixture',
      schema: z.object({
        rules: z
          .object({ enabled: z.boolean().default(true), retries: z.number().min(0).max(5).default(2) })
          .description({
            zh: '控制测试任务的启用状态和最大重试次数。',
            en: 'Enable tasks and set retry limits.',
          }),
        paths: z
          .array(z.string())
          .description({ zh: '允许访问的测试目录列表。', en: 'Test directory list.' }),
        options: z.any().description({
          zh: '高级选项，不接受可执行表达式。',
          en: 'Advanced options. Expressions are not accepted.',
        }),
        note: z.string().default(''),
      }),
      inherited: { rules: { enabled: true, retries: 2 }, paths: ['demo/'], options: { mode: 'safe' } },
    },
    {
      id: 'credentials-demo',
      name: 'credential-fixture',
      schema: z.object({
        tuple: z.tuple([z.string(), z.string().role('secret')]),
        accounts: z.array(z.object({ token: z.string().role('secret') })),
        label: z.string(),
      }),
      inherited: {
        tuple: ['demo', 'SYNTHETIC-PRIVATE-TUPLE'],
        accounts: [{ token: 'SYNTHETIC-INHERITED-TOKEN' }],
        label: 'Example credentials',
      },
      current: { tuple: ['demo', 'SYNTHETIC-PRIVATE-TUPLE'], accounts: [], label: 'Example credentials' },
      override: { accounts: [] },
    },
    { id: 'failed-demo', name: 'failed-fixture', schema: z.object({ enabled: z.boolean() }), state: 3 },
  ]
}
