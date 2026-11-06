import http from 'node:http'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { createHarness, demoDefinitions } from '../test/fixtures.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const bundle = await build({
  entryPoints: [root + 'scripts/dev-client.mjs'],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'browser',
  define: { 'process.env.NODE_ENV': '"development"' },
})
const flags = { offline: false, saveError: false, refreshError: false, failRead: false }
const harness = createHarness(demoDefinitions(), {
  beforeEdit() {
    if (flags.saveError) {
      flags.saveError = false
      throw new Error('invalid config: SYNTHETIC-DO-NOT-DISCLOSE')
    }
    if (flags.refreshError) {
      flags.refreshError = false
      flags.failRead = true
    }
  },
})
const html = `<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>DSH 插件隔离测试</title>
<style>
:root{color-scheme:dark;--dsw-alias-label-primary:#eeeeF2;--dsw-alias-label-secondary:#c1c3ce;--dsw-alias-label-tertiary:#a2a5b3;--dsw-alias-bg-layer-1:#17181d;--dsw-alias-bg-layer-2:#24262d;--dsw-alias-bg-layer-3:#2f323c;--dsw-alias-border-l2:#484b58;--dsw-alias-border-l3:#606473;--dsw-alias-border-l4:#555966;--dsw-alias-brand-primary:#8b9dff;--dsw-alias-state-business-primary:#9caaff;--dsw-alias-state-error-primary:#ff9b9b;--dsw-alias-state-warn-primary:#f1c77c;--dsw-radius-md:8px;--dsw-radius-panel:14px;--dsw-alias-bg-mask-1:#0009;--dsw-elevation-prominent:0 16px 60px #0006}
:root[data-theme=light]{color-scheme:light;--dsw-alias-label-primary:#23252c;--dsw-alias-label-secondary:#4c5160;--dsw-alias-label-tertiary:#656a77;--dsw-alias-bg-layer-1:#fff;--dsw-alias-bg-layer-2:#f4f5f7;--dsw-alias-bg-layer-3:#e9ebf1;--dsw-alias-border-l2:#c8cbd6;--dsw-alias-border-l3:#aeb4c4;--dsw-alias-border-l4:#b4b8c4;--dsw-alias-brand-primary:#415ac5;--dsw-alias-state-business-primary:#415ac5;--dsw-alias-state-error-primary:#ae2234}
*{box-sizing:border-box}body{margin:0;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:14px/1.5 system-ui,sans-serif}.review-shell{max-width:1040px;margin:auto;padding:24px}.review-header{padding:0 0 20px;border-bottom:1px solid var(--dsw-alias-border-l2);margin-bottom:20px}.review-header p{font-size:12px;color:var(--dsw-alias-label-secondary)}.review-controls{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.review-controls button{padding:7px 11px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-2);color:inherit;cursor:pointer}main{padding:22px;background:var(--dsw-alias-bg-layer-2);border-radius:12px}@media(max-width:600px){.review-shell{padding:10px}main{padding:12px}}
</style><div id="app"></div><script type="module" src="/bootstrap.js"></script></html>`
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
    const host = req.headers.host
    if (req.headers.origin && req.headers.origin !== `http://${host}`) {
      res.writeHead(403).end()
      return
    }
    if (url.pathname === '/') {
      res.setHeader('content-type', 'text/html; charset=utf-8')
      res.end(html)
      return
    }
    if (url.pathname === '/bootstrap.js') {
      res.setHeader('content-type', 'text/javascript')
      res.end(bundle.outputFiles[0].contents)
      return
    }
    if (url.pathname === '/client.js') {
      res.setHeader('content-type', 'text/javascript')
      res.setHeader('cache-control', 'no-store')
      res.end(await fs.readFile(root + 'client.js'))
      return
    }
    if (req.method !== 'POST') {
      res.writeHead(404).end()
      return
    }
    const chunks = []
    let size = 0
    for await (const chunk of req) {
      size += chunk.length
      if (size > 1024 * 1024) {
        res.writeHead(413).end()
        return
      }
      chunks.push(chunk)
    }
    const body = Buffer.concat(chunks)
    if (url.pathname === '/__review/control') {
      const { operation } = JSON.parse(body)
      if (operation === 'conflict') {
        const row = harness.rows[0]
        row.entry.options.config.fontSize = (row.entry.options.config.fontSize ?? 14) === 17 ? 18 : 17
        row.override = structuredClone(row.entry.options.config)
        harness.resolve(row)
      }
      if (operation === 'save-error') flags.saveError = true
      if (operation === 'refresh-error') flags.refreshError = true
      if (operation === 'offline') flags.offline = true
      if (operation === 'online') flags.offline = false
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ message: `测试状态已更新：${operation}` }))
      return
    }
    const handle = harness.routes.get(url.pathname)
    if (!handle) {
      res.writeHead(404).end()
      return
    }
    if (flags.offline || (flags.failRead && url.pathname.endsWith('/read'))) {
      flags.failRead = false
      res.writeHead(503).end()
      return
    }
    const response = await handle(
      new Request(`http://${host}${url.pathname}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      }),
    )
    res.writeHead(response.status, Object.fromEntries(response.headers))
    res.end(Buffer.from(await response.arrayBuffer()))
  } catch {
    res.writeHead(500).end('Test server error')
  }
})
server.listen(Number(process.env.REVIEW_PORT ?? 0), '127.0.0.1', () =>
  console.log(`Review UI: http://127.0.0.1:${server.address().port}`),
)
