import React from 'react'
import { jsx } from 'react/jsx-runtime'
import { createRoot } from 'react-dom/client'
const h = (type, props) => {
  const { children, ...rest } = props ?? {}
  return React.createElement(type, rest, ...(Array.isArray(children) ? children : [children]))
}

let Section
let active = 'zh'
let dictionaries = {}
const root = createRoot(document.getElementById('app'))
const t = (key, vars = {}) => {
  let value = dictionaries[active]?.[key] ?? dictionaries.en?.[key] ?? key
  for (const [name, replacement] of Object.entries(vars)) value = value.replaceAll(`{${name}}`, replacement)
  return value
}
window.__ModuleLoader__ = {
  load(definition) {
    const plugin = definition.factory((name) => {
      if (name === 'react') return React
      if (name === 'react/jsx-runtime') return { jsx }
      throw new Error(`Unknown dependency ${name}`)
    })
    plugin.apply({
      effect: (fn) => fn(),
      locale: {
        bind: () => t,
        register: (_name, data) => {
          dictionaries = data
        },
        getSnapshot: () => ({ active }),
      },
      slots: {
        inject: (_name, fn) => fn(),
        register: (_definition, component) => {
          Section = component
        },
      },
    })
    root.render(h(App, {}))
  },
}

function App() {
  const [locale, setLocale] = React.useState('zh')
  const [theme, setTheme] = React.useState('dark')
  const [tab, setTab] = React.useState('studio')
  const [notice, setNotice] = React.useState('')
  active = locale
  React.useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  async function simulate(operation) {
    const response = await fetch('/__review/control', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ operation }),
    })
    const result = await response.json()
    setNotice(result.message)
  }
  return h('div', {
    className: 'review-shell',
    children: [
      h('header', {
        className: 'review-header',
        children: [
          h('strong', { children: 'DSH Config Studio · 隔离功能测试' }),
          h('p', { children: '使用合成配置；所有保存仅保存在此测试进程的内存中。' }),
          h('div', {
            className: 'review-controls',
            children: [
              h('button', { onClick: () => setTab('studio'), children: '插件配置' }),
              h('button', { onClick: () => setTab('other'), children: '切换到其他页面' }),
              h('button', {
                onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
                children: theme === 'dark' ? '切换浅色' : '切换深色',
              }),
              h('button', {
                onClick: () => setLocale(locale === 'zh' ? 'en' : 'zh'),
                children: locale === 'zh' ? 'English' : '中文',
              }),
            ],
          }),
          h('details', {
            children: [
              h('summary', { children: '测试控制' }),
              h('div', {
                className: 'review-controls',
                children: [
                  h('button', { onClick: () => simulate('conflict'), children: '模拟外部修改字号' }),
                  h('button', { onClick: () => simulate('save-error'), children: '模拟下次保存失败' }),
                  h('button', { onClick: () => simulate('refresh-error'), children: '模拟保存后刷新失败' }),
                  h('button', { onClick: () => simulate('offline'), children: '模拟接口离线' }),
                  h('button', { onClick: () => simulate('online'), children: '恢复接口' }),
                ],
              }),
            ],
          }),
          h('p', { role: 'status', children: notice }),
        ],
      }),
      h('main', {
        children:
          tab === 'studio'
            ? h(Section, { t, locale })
            : h('p', { children: '此处模拟其他设置页面。返回插件配置可检查草稿是否保留。' }),
      }),
    ],
  })
}
const script = document.createElement('script')
script.src = '/client.js'
document.head.appendChild(script)
