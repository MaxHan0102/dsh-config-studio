import test, { afterEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { JSDOM } from 'jsdom'
import React, { act } from 'react'
import { jsx } from 'react/jsx-runtime'
import { createHarness, demoDefinitions, z } from './fixtures.mjs'

const dom = new JSDOM('<html><head></head><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
})
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
  IS_REACT_ACT_ENVIRONMENT: true,
})
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true })
const { createRoot } = await import('react-dom/client')
const source = fs.readFileSync(new URL('../client.js', import.meta.url), 'utf8')
let root,
  dispose = []
const runtimeErrors = []
window.addEventListener('error', (event) => runtimeErrors.push(event.error?.message ?? event.message))
afterEach(async () => {
  if (root) await act(() => root.unmount())
  root = undefined
  dispose.forEach((fn) => fn?.())
  dispose = []
  document.body.innerHTML = '<div id="root"></div>'
  const errors = runtimeErrors.splice(0)
  assert.deepEqual(errors, [], 'Unexpected client runtime error')
})
function load(harness = createHarness(demoDefinitions())) {
  let client, Section, dictionaries
  const t = (key, vars = {}) =>
    Object.entries(vars).reduce(
      (text, [k, v]) => text.replaceAll(`{${k}}`, v),
      dictionaries?.zh?.[key] ?? key,
    )
  globalThis.fetch = async (url, init) =>
    harness.routes.get(new URL(url, 'http://localhost').pathname)(
      new Request(new URL(url, 'http://localhost'), init),
    )
  window.__ModuleLoader__ = {
    load(def) {
      client = def.factory((name) => (name === 'react' ? React : { jsx }))
    },
  }
  vm.runInThisContext(
    source.replace(
      'return { inject, apply }',
      'return { inject, apply, parseField, collectChanges, FieldRow, Modal, checkValue, displayValue }',
    ),
  )
  client.apply({
    effect(fn) {
      const cleanup = fn()
      if (typeof cleanup === 'function') dispose.push(cleanup)
    },
    locale: {
      bind: () => t,
      register: (_, d) => {
        dictionaries = d
      },
      getSnapshot: () => ({ active: 'zh' }),
    },
    slots: {
      inject: (_, fn) => fn(),
      register: (_, component) => {
        Section = component
      },
    },
  })
  return { client, Section, t, harness }
}
async function mount(harness) {
  const loaded = load(harness)
  root = createRoot(document.getElementById('root'))
  await act(async () => {
    root.render(jsx(loaded.Section, { t: loaded.t, locale: 'zh' }))
  })
  return loaded
}
function button(text) {
  const result = [...document.querySelectorAll('button')].find((el) => el.textContent === text)
  assert.ok(result, `Missing button: ${text}`)
  return result
}
const click = async (el) =>
  act(async () => {
    el.click()
  })
async function openTheme() {
  await click([...document.querySelectorAll('.cs-item')].find((el) => el.textContent.includes('主题与字体')))
}
async function fill(key, text) {
  await act(async () => {
    const input = document.getElementById(`cs-field-${key}`)
    Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(input, text)
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
  })
}

test('default true generates an explicit false change', () => {
  const { client } = load()
  const result = client.collectChanges(
    [{ key: 'enabled', kind: 'boolean', value: true, source: 'default' }],
    { enabled: { boolean: false } },
  )
  assert.equal(result.changes[0].value, false)
})
test('union validation accepts all branches and enforces string length and step', () => {
  const { client } = load()
  assert.equal(
    client.parseField(
      {
        kind: 'number',
        alternatives: [
          { kind: 'number', maximum: 0 },
          { kind: 'number', minimum: 10 },
        ],
      },
      '20',
    ).value,
    20,
  )
  assert.equal(client.parseField({ kind: 'string', minLength: 2 }, 'x').error, 'outOfRange')
  assert.equal(client.parseField({ kind: 'number', multipleOf: 0.5 }, '1.2').error, 'outOfRange')
})
test('enum values preserve number/string identity', () => {
  const { client } = load()
  const field = { kind: 'enum', options: [{ value: 1 }, { value: '1' }] }
  assert.equal(client.parseField(field, '1').value, 1)
  assert.equal(client.parseField(field, '"1"').value, '1')
})
test('JSON expression input is rejected before preview', () => {
  const { client } = load()
  assert.equal(client.parseField({ kind: 'json' }, '{"a":[{"__jsExpr":"2"}]}').error, 'expressionBlocked')
})
test('missing values are distinct from explicit null in diff', () => {
  const { client, t } = load()
  assert.equal(client.displayValue(undefined, t), '未设置')
  assert.equal(client.displayValue(null, t), 'null')
})
test('reset switch and select show inherited target', async () => {
  const { client, t } = load()
  root = createRoot(document.getElementById('root'))
  await act(() =>
    root.render(
      jsx('div', {
        children: [
          jsx(
            client.FieldRow,
            {
              t,
              locale: 'zh',
              field: {
                key: 'enabled',
                kind: 'boolean',
                value: true,
                inherited: false,
                resetSource: 'inherited',
              },
              draft: { reset: true },
              onChange() {},
            },
            'boolean',
          ),
          jsx(
            client.FieldRow,
            {
              t,
              locale: 'zh',
              field: {
                key: 'theme',
                kind: 'enum',
                value: 'dark',
                inherited: 'light',
                resetSource: 'inherited',
                options: [
                  { value: 'light', label: 'light' },
                  { value: 'dark', label: 'dark' },
                ],
              },
              draft: { reset: true },
              onChange() {},
            },
            'enum',
          ),
        ],
      }),
    ),
  )
  assert.equal(document.querySelector('[role="switch"]').getAttribute('aria-checked'), 'false')
  assert.equal(document.querySelector('select').value, '"light"')
})
test('complex fields preserve their description', async () => {
  const { client, t } = load()
  root = createRoot(document.getElementById('root'))
  await act(() =>
    root.render(
      jsx(client.FieldRow, {
        t,
        locale: 'zh',
        field: { key: 'options', kind: 'json', value: {}, description: '专属字段说明' },
        onChange() {},
      }),
    ),
  )
  assert.ok(document.body.textContent.includes('专属字段说明'))
})
test('invalid input can be discarded while save remains disabled', async () => {
  await mount()
  await openTheme()
  await fill('fontSize', 'abc')
  assert.equal(button('放弃更改').disabled, false)
  assert.equal(button('预览并保存').disabled, true)
  await click(button('放弃更改'))
  assert.equal(document.getElementById('cs-field-fontSize').value, '14')
})
test('leave guard keeps draft and restores it on reentry', async () => {
  await mount()
  await openTheme()
  await fill('fontSize', '16')
  await click(button('返回列表'))
  assert.equal(document.querySelector('[role="dialog"]').getAttribute('aria-label'), '是否保留草稿？')
  await click(button('保留草稿并返回'))
  await openTheme()
  assert.equal(document.getElementById('cs-field-fontSize').value, '16')
  assert.ok(document.body.textContent.includes('已恢复未保存的草稿'))
})
test('modal traps Tab, consumes Escape, and restores focus', async () => {
  await mount()
  await openTheme()
  await fill('fontSize', '16')
  const trigger = button('预览并保存')
  trigger.focus()
  await click(trigger)
  const dialog = document.querySelector('[role="dialog"]')
  const buttons = [...dialog.querySelectorAll('button')]
  buttons.at(-1).focus()
  await act(() =>
    document.dispatchEvent(
      new dom.window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    ),
  )
  assert.equal(document.activeElement, buttons[0])
  let escaped = false
  const outer = () => {
    escaped = true
  }
  document.addEventListener('keydown', outer)
  await act(() =>
    document.dispatchEvent(
      new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    ),
  )
  document.removeEventListener('keydown', outer)
  assert.equal(escaped, false)
  assert.equal(document.querySelector('[role="dialog"]'), null)
  assert.equal(document.activeElement, trigger)
})
test('save and undo restore a missing default-enabled setting', async () => {
  const { harness } = await mount()
  await openTheme()
  await click(document.querySelector('[role="switch"]'))
  await click(button('预览并保存'))
  await click(button('应用'))
  assert.equal(harness.rows[0].entry.options.config.enabled, false)
  assert.equal(document.querySelector('[role="switch"]').getAttribute('aria-checked'), 'false')
  await click(button('撤销上次保存'))
  await click(
    [...document.querySelectorAll('[role="dialog"] button')].find((el) => el.textContent === '撤销上次保存'),
  )
  assert.equal(harness.rows[0].entry.options.config.enabled, undefined)
  assert.equal(document.querySelector('[role="switch"]').getAttribute('aria-checked'), 'true')
})
test('concurrent edits preserve draft and require explicit comparison', async () => {
  const { harness } = await mount()
  await openTheme()
  await fill('fontSize', '16')
  const row = harness.rows[0]
  row.entry.options.config.fontSize = 17
  row.override = structuredClone(row.entry.options.config)
  await click(button('预览并保存'))
  await click(button('应用'))
  assert.equal(document.getElementById('cs-field-fontSize').value, '16')
  assert.equal(button('预览并保存').disabled, true)
  await click(button('对比最新配置'))
  assert.ok(document.querySelector('[role="dialog"]').textContent.includes('17'))
  await click(button('在此版本上保留我的修改'))
  assert.equal(button('预览并保存').disabled, false)
})
test('post-save refresh failure does not retry the write and clears after a successful read', async () => {
  let failRead = false
  const harness = createHarness(demoDefinitions(), {
    beforeEdit() {
      failRead = true
    },
  })
  const original = harness.routes.get('/api/config-studio/read')
  harness.routes.set('/api/config-studio/read', (request) => {
    if (failRead) {
      failRead = false
      return new Response('', { status: 503 })
    }
    return original(request)
  })
  await mount(harness)
  await openTheme()
  await fill('fontSize', '16')
  await click(button('预览并保存'))
  await click(button('应用'))
  assert.equal(harness.writes, 1)
  assert.ok(document.body.textContent.includes('保存已完成，但页面刷新失败'))
  await click(button('重试'))
  assert.equal(harness.writes, 1)
  assert.equal(document.getElementById('cs-field-fontSize').value, '16')
  assert.equal(document.body.textContent.includes('页面刷新失败'), false)
})
