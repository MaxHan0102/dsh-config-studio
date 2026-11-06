import { hasOwn } from './config-model.js'

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
  [
    'platform',
    /^(api-|typert|gateway|registry|otel|telemetry|brand|resources|store|cordis|permission|approval|plugin-|harness-|launch-|hmr|loader|modules|settings|config-editor)/,
  ],
]

/** Token buckets consulted when no id prefix matched. */
const CATEGORY_RULES = [
  ['models', /(^|[\s:/@-])(llm|model|models|provider|pi-ai)([\s:/@-]|$)/],
  ['agents', /(^|[\s:/@-])(agent|subagent|persona|goal|plan-mode|workflow|preset|team)([\s:/@-]|$)/],
  ['tools', /(^|[\s:/@-])(tool|tools|skill|mcp|command|commands|office)([\s:/@-]|$)/],
  ['web', /(^|[\s:/@-])(web|web-search|web-fetch|browser|http-proxy|fetch|search)([\s:/@-]|$)/],
  ['account', /(^|[\s:/@-])(account|credential|credentials|authorization)([\s:/@-]|$)/],
  [
    'runtime',
    /(^|[\s:/@-])(sandbox|bash|pwsh|shell|terminal|subprocess|worktree|fs|directory|files)([\s:/@-]|$)/,
  ],
  [
    'session',
    /(^|[\s:/@-])(session|storage|attachment|spill|compaction|checkpoint|job|jobs|schedule|feedback|memory)([\s:/@-]|$)/,
  ],
  [
    'ui',
    /(^|[\s:/@-])(ui|client|sidebar|layout|theme|locale|chat|conversation|dock|trajectory|shortcut|market|entry-customization)([\s:/@-]|$)/,
  ],
  [
    'platform',
    /(^|[\s:/@-])(api|typert|gateway|registry|scope|otel|telemetry|brand|resources|store|cordis|permission|approval|plugin|modules|analytics)([\s:/@-]|$)/,
  ],
]

/**
 * Assign a coarse function bucket to one Loader entry.
 * @param id - the entry's patch id.
 * @param name - the plugin package name.
 * @returns one of the category keys the Client localizes.
 */
export function categorize(id, name) {
  const key = typeof id === 'string' ? id : ''
  if (hasOwn(CATEGORY_OVERRIDES, key)) return CATEGORY_OVERRIDES[key]
  const lowerId = key.toLowerCase()
  for (const [category, pattern] of ID_PREFIX_RULES) if (pattern.test(lowerId)) return category
  const text = `${key} ${name ?? ''}`.toLowerCase()
  for (const [category, pattern] of CATEGORY_RULES) if (pattern.test(text)) return category
  return 'other'
}

/** Whether the package ships with Harness itself. */
export function originOf(name) {
  return typeof name === 'string' && name.startsWith(OFFICIAL_SCOPE) ? 'official' : 'third-party'
}

/* ------------------------------------------------------------------ */
/* entry inspection                                                     */
/* ------------------------------------------------------------------ */

/** Map a Loader entry to a coarse editable status. */
export function entryStatus(entry) {
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
export function statusReason(status) {
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
