window.__ModuleLoader__.load({
  id: 'dsh-config-studio',
  factory(require) {
    const React = require('react')
    const { jsx } = require('react/jsx-runtime')

    /** Element helper: `h(type, props, key)`. */
    const h = (type, props, key) => jsx(type, props ?? {}, key)

    /** Dictionary namespace owned by this plugin. */
    const NS = 'settings.config-studio'

    /* ---------------------------------------------------------------- */
    /* copy                                                              */
    /* ---------------------------------------------------------------- */

    const en = {
      nav: 'Plugin configuration',
      title: 'Plugin configuration',
      subtitle: 'Edit any configurable plugin in the active profile. Saves go to the profile patch and reload through the Loader; a few plugins only pick the change up after a restart.',
      search: 'Search by entry id or package',
      refresh: 'Reload',
      reload: 'Reload entry',
      back: 'Back to the list',
      loading: 'Loading configuration…',
      loadFailed: 'The configuration service did not answer.',
      hintNetwork: 'The page could not reach the Host. Reload the page, and check that the Host is still running.',
      hintUnauthorized: 'This page is not authenticated for the Host. Reopen it from the URL the Host printed.',
      retry: 'Retry',
      emptyTitle: 'No addressable configuration',
      emptyBody: 'This profile exposes no editable Loader entry. A profile managed exclusively by the desktop application still composes entries here; nested includes stay read-only.',
      emptyFilter: 'No entry matches this search.',
      emptyEditable: 'No editable entry in this profile. Switch to All entries to inspect read-only ones.',
      onlyEditable: 'Editable only',
      allEntries: 'All entries',
      filterLabel: 'Filter entries',
      groupLabel: 'Group by',
      groupByFunction: 'By function',
      groupByOrigin: 'By origin',
      expandAll: 'Expand all',
      collapseAll: 'Collapse all',
      'origin.official': 'Official',
      'origin.third-party': 'Third-party',
      'category.models': 'Models & inference',
      'category.agents': 'Agents & presets',
      'category.tools': 'Tools & skills',
      'category.web': 'Web access',
      'category.account': 'Accounts & credentials',
      'category.runtime': 'Runtime & files',
      'category.session': 'Sessions & storage',
      'category.ui': 'Interface',
      'category.platform': 'Platform services',
      'category.other': 'Other',
      stats: '{editable} editable / {readonly} read-only',
      statsAll: '{total} entries · {editable} editable · {readonly} read-only',
      fieldCount: '{fields} fields',
      overridden: 'Overridden',
      readonlyBadge: 'Read-only',
      save: 'Save to profile',
      saving: 'Saving…',
      saved: 'Saved',
      discard: 'Discard changes',
      reset: 'Reset',
      undoReset: 'Undo',
      resetHint: 'Will be restored to the inherited value on save.',
      unsaved: 'Unsaved changes',
      noFields: 'This entry declares no configurable field.',
      applied: 'Configuration applied',
      appliedRestore: 'Override removed; the inherited configuration applies again.',
      conflictTitle: 'This entry changed elsewhere',
      conflictBody: 'Another edit was applied after this page read the entry. Reload it and apply your changes again.',
      conflictReload: 'Reload entry',
      errorGeneric: 'The change was not applied.',
      invalidValue: 'The Host rejected this value:',
      readonlyChange: 'That field is read-only in this entry.',
      staleEntry: 'This entry was replaced while the form was open. Reload it and try again.',
      overriddenByLayer: 'A home patch or command-line overlay takes precedence, so this profile write would have no effect.',
      invalidNumber: 'Enter a number.',
      invalidInteger: 'Enter a whole number.',
      invalidJson: 'This value is not valid JSON.',
      invalidPattern: 'The value does not match the required pattern.',
      outOfRange: 'The value is outside the allowed range.',
      required: 'Required',
      volatile: 'Live',
      partial: 'Partly projected',
      secretNotice: 'This field holds a credential. Its value never leaves the Host and cannot be edited here.',
      expressionNotice: 'This field is a !!js expression and can only be edited in YAML.',
      complexHint: 'Edit as JSON. The Host validates the saved value against the plugin schema.',
      unchanged: 'No changes yet.',
      fixInvalid: 'Fix the highlighted fields before saving.',
      diffTitle: 'Review changes',
      diffNote: 'Only the fields changed here are written; the whole config object is replaced in the profile patch and the plugin reloads through the Loader.',
      diffApply: 'Apply',
      diffCancel: 'Cancel',
      diffEmpty: 'Nothing to apply.',
      diffResult: 'Inherited',
      close: 'Close',
      'reason.secret': 'Contains a credential',
      'reason.credential-ref': 'Credential reference',
      'reason.contains-secret': 'Contains a credential',
      'reason.expression': 'Uses a !!js expression',
      'reason.unsupported': 'Unsupported schema type',
      'reason.disabled': 'Disabled by the schema',
      'reason.oversized': 'Configuration is larger than 64 KB',
      'reason.no-schema': 'This plugin declares no Config schema',
      'reason.schema-error': 'The Config schema could not be projected',
      'reason.all-readonly': 'Every declared field is read-only',
      'reason.failed': 'This plugin failed to load',
      'reason.disabledEntry': 'This plugin is disabled',
      'reason.inactive': 'This plugin is not active',
      'reason.groups': 'Group rows hold other entries, not configuration',
    }

    const zh = {
      nav: '插件配置',
      title: '插件配置',
      subtitle: '编辑当前 profile 中任意可配置插件；保存会写入 profile 补丁并由 Loader 重载，个别插件需要重启应用后才完全生效。',
      search: '按条目 id 或包名搜索',
      refresh: '重新加载',
      reload: '重新读取',
      back: '返回列表',
      loading: '正在读取配置…',
      loadFailed: '配置服务没有响应。',
      hintNetwork: '页面无法连接到宿主。请刷新页面；若仍然失败，请确认宿主仍在运行。',
      hintUnauthorized: '当前页面未通过宿主认证。请用宿主打印的地址重新打开。',
      retry: '重试',
      emptyTitle: '没有可寻址的配置条目',
      emptyBody: '当前 profile 没有暴露可编辑的 Loader 条目。由桌面应用独占管理的 profile 也会在这里列出条目；嵌套 include 中的条目保持只读。',
      emptyFilter: '没有条目匹配该搜索。',
      emptyEditable: '当前 profile 没有可编辑条目；切换到「全部条目」可查看只读条目。',
      onlyEditable: '仅可编辑',
      allEntries: '全部条目',
      filterLabel: '条目过滤',
      groupLabel: '分组方式',
      groupByFunction: '按功能',
      groupByOrigin: '按来源',
      expandAll: '全部展开',
      collapseAll: '全部收起',
      'origin.official': '官方',
      'origin.third-party': '第三方',
      'category.models': '模型与推理',
      'category.agents': 'Agent 与预设',
      'category.tools': '工具与技能',
      'category.web': '联网',
      'category.account': '账号与凭据',
      'category.runtime': '执行与文件',
      'category.session': '会话与存储',
      'category.ui': '界面',
      'category.platform': '平台服务',
      'category.other': '其他',
      stats: '可编辑 {editable} / 只读 {readonly}',
      statsAll: '共 {total} 个条目 · 可编辑 {editable} · 只读 {readonly}',
      fieldCount: '{fields} 个字段',
      overridden: '已覆盖',
      readonlyBadge: '只读',
      save: '保存到 profile',
      saving: '保存中…',
      saved: '已保存',
      discard: '放弃更改',
      reset: '恢复默认',
      undoReset: '撤销',
      resetHint: '保存时将恢复为继承值。',
      unsaved: '有未保存的更改',
      noFields: '该条目没有声明可配置字段。',
      applied: '配置已应用',
      appliedRestore: '覆盖已移除，重新使用继承配置。',
      conflictTitle: '该条目已在别处被修改',
      conflictBody: '本页读取之后又有一次编辑生效。请重新读取该条目后再提交。',
      conflictReload: '重新读取',
      errorGeneric: '更改未生效。',
      invalidValue: '宿主拒绝了该值：',
      readonlyChange: '该字段在此条目中只读。',
      staleEntry: '表单打开期间该条目已被替换，请重新读取后再试。',
      overriddenByLayer: '该条目被 home 补丁或命令行覆盖接管，写入 profile 层不会生效。',
      invalidNumber: '请填数字。',
      invalidInteger: '请填整数。',
      invalidJson: '该值不是合法的 JSON。',
      invalidPattern: '值不符合要求的格式。',
      outOfRange: '值超出允许范围。',
      required: '必填',
      volatile: '热更新',
      partial: '部分投影',
      secretNotice: '该字段保存密钥；其值不会离开宿主，也不能在此修改。',
      expressionNotice: '该字段是 !!js 表达式，只能在 YAML 中修改。',
      complexHint: '以 JSON 编辑；保存时由宿主按插件 schema 校验。',
      unchanged: '尚未修改。',
      fixInvalid: '请先修正标红的字段。',
      diffTitle: '确认变更',
      diffNote: '只写入这里修改过的字段；profile 补丁中的整个 config 会被替换，保存后该插件由 Loader 重载。',
      diffApply: '应用',
      diffCancel: '取消',
      diffEmpty: '没有需要应用的更改。',
      diffResult: '继承值',
      close: '关闭',
      'reason.secret': '包含密钥',
      'reason.credential-ref': '凭据引用',
      'reason.contains-secret': '包含密钥',
      'reason.expression': '使用 !!js 表达式',
      'reason.unsupported': '不支持的 schema 类型',
      'reason.disabled': 'schema 中已禁用',
      'reason.oversized': '配置超过 64 KB',
      'reason.no-schema': '该插件未声明 Config schema',
      'reason.schema-error': 'Config schema 投影失败',
      'reason.all-readonly': '声明的字段全部只读',
      'reason.failed': '该插件加载失败',
      'reason.disabledEntry': '该插件已禁用',
      'reason.inactive': '该插件当前未激活',
      'reason.groups': '分组条目承载的是其它条目，而不是配置',
    }

    /* ---------------------------------------------------------------- */
    /* styles                                                            */
    /* ---------------------------------------------------------------- */

    const CSS = `
.cs-root { display: flex; flex-direction: column; gap: 14px; width: 100%; color: var(--dsw-alias-label-primary); }
.cs-head { display: flex; flex-direction: column; gap: 6px; }
.cs-title { margin: 0; font-size: 15px; font-weight: 600; line-height: 1.4; }
.cs-sub { margin: 0; font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-tertiary); }
.cs-toolbar { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.cs-search { flex: 1; min-width: 0; height: 32px; padding: 0 12px; border: .5px solid var(--dsw-alias-border-l4); border-radius: var(--dsw-radius-md); background: var(--dsw-alias-bg-layer-3); font: inherit; font-size: 13px; color: var(--dsw-alias-label-primary); }
.cs-search:focus-visible { outline: none; border-color: var(--dsw-alias-state-business-primary); }
.cs-button { appearance: none; display: inline-flex; align-items: center; justify-content: center; gap: 4px; height: 32px; padding: 0 12px; border: .5px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-md); background: transparent; font: inherit; font-size: 13px; color: var(--dsw-alias-label-primary); cursor: pointer; white-space: nowrap; }
.cs-button:hover:not(:disabled) { background: var(--dsw-alias-bg-layer-2); }
.cs-button:disabled { opacity: .5; cursor: default; }
.cs-button:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-business-primary); outline-offset: 1px; }
.cs-button-primary { border-color: transparent; background: var(--dsw-alias-label-primary); color: var(--dsw-alias-bg-layer-1); }
.cs-button-primary:hover:not(:disabled) { background: var(--dsw-alias-label-primary); opacity: .9; }
.cs-button-quiet { border-color: transparent; color: var(--dsw-alias-label-secondary); padding: 0 6px; }
.cs-segmented { display: inline-flex; align-items: center; gap: 2px; height: 32px; padding: 2px; box-sizing: border-box; border: .5px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-md); background: var(--dsw-alias-bg-layer-2); }
.cs-seg { appearance: none; height: 26px; padding: 0 10px; border: 0; border-radius: 6px; background: transparent; font: inherit; font-size: 12.5px; color: var(--dsw-alias-label-secondary); cursor: pointer; white-space: nowrap; }
.cs-seg[aria-pressed="true"] { background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); box-shadow: 0 0 0 .5px var(--dsw-alias-border-l2); }
.cs-seg:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-business-primary); outline-offset: 1px; }
.cs-stats-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.cs-stats { margin: 0; font-size: 12px; color: var(--dsw-alias-label-tertiary); }
.cs-link { border: none; background: none; padding: 0; font: inherit; font-size: 12px; color: var(--dsw-alias-label-secondary); cursor: pointer; white-space: nowrap; }
.cs-link:hover { color: var(--dsw-alias-label-primary); }
.cs-link:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-business-primary); outline-offset: 1px; }
.cs-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cs-groups { display: flex; flex-direction: column; gap: 16px; }
.cs-group { display: flex; flex-direction: column; gap: 4px; }
.cs-group-head { display: flex; align-items: center; gap: 6px; width: 100%; padding: 4px 8px; border: 0; border-radius: var(--dsw-radius-md); background: transparent; font: inherit; text-align: left; color: var(--dsw-alias-label-tertiary); cursor: pointer; }
.cs-group-head:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); }
.cs-group-head:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-business-primary); outline-offset: -1px; }
.cs-chevron { flex: none; transition: transform .12s ease; }
.cs-group-head[aria-expanded="true"] .cs-chevron { transform: rotate(90deg); }
.cs-group-label { flex: 1; min-width: 0; font-size: 12px; font-weight: 500; color: var(--dsw-alias-label-secondary); }
.cs-group-count { font-size: 11px; color: var(--dsw-alias-label-tertiary); }
.cs-list { display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 0; list-style: none; }
.cs-item { display: flex; flex-direction: column; gap: 3px; width: 100%; padding: 9px 12px; border: 0; border-radius: var(--dsw-radius-md); background: transparent; text-align: left; font: inherit; color: inherit; cursor: pointer; }
.cs-item:hover { background: var(--dsw-alias-bg-layer-2); }
.cs-item:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-business-primary); outline-offset: -1px; }
.cs-item[aria-current="true"] { background: var(--dsw-alias-bg-layer-2); box-shadow: inset 2px 0 0 var(--dsw-alias-brand-primary); }
.cs-item[data-readonly="true"] .cs-item-id { color: var(--dsw-alias-label-secondary); }
.cs-item-top { display: flex; align-items: center; gap: 8px; min-width: 0; }
.cs-item-id { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--dsw-font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace); font-size: 12.5px; }
.cs-item-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11.5px; color: var(--dsw-alias-label-tertiary); }
.cs-item-meta { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--dsw-alias-label-tertiary); }
.cs-tag { display: inline-flex; align-items: center; padding: 0 7px; border-radius: 999px; font-size: 10.5px; line-height: 17px; font-weight: 500; white-space: nowrap; background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-secondary); }
.cs-tag-accent { background: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-layer-1); }
.cs-tag-warn { color: var(--dsw-alias-state-warn-primary); }
.cs-tag-error { color: var(--dsw-alias-state-error-primary); }
.cs-empty { padding: 28px 8px; text-align: center; }
.cs-empty-title { margin: 0 0 6px; font-size: 13px; font-weight: 500; }
.cs-empty-body { margin: 0 auto; max-width: 44ch; font-size: 12px; line-height: 1.6; color: var(--dsw-alias-label-tertiary); }
.cs-notice { display: flex; gap: 8px; padding: 10px 12px; border-radius: var(--dsw-radius-md); background: var(--dsw-alias-bg-layer-3); font-size: 12px; line-height: 1.6; color: var(--dsw-alias-label-secondary); }
.cs-notice[data-tone="error"] { color: var(--dsw-alias-state-error-primary); }
.cs-detail-head { display: flex; flex-direction: column; gap: 4px; }
.cs-detail-title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cs-detail-id { font-family: var(--dsw-font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace); font-size: 14px; font-weight: 600; word-break: break-all; }
.cs-detail-name { font-size: 12px; color: var(--dsw-alias-label-tertiary); word-break: break-all; }
.cs-detail-actions { display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
.cs-fields { display: flex; flex-direction: column; }
.cs-field { display: flex; flex-direction: column; gap: 6px; padding: 12px 0; }
.cs-field + .cs-field { border-top: .5px solid var(--dsw-alias-border-l2); }
.cs-field[data-dirty="true"] { box-shadow: inset 2px 0 0 var(--dsw-alias-brand-primary); padding-left: 10px; }
.cs-field-head { display: flex; align-items: center; gap: 8px; min-width: 0; }
.cs-field-label { flex: 0 1 auto; min-width: 0; font-size: 13px; font-weight: 500; line-height: 1.5; }
.cs-field-key { font-family: var(--dsw-font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace); font-size: 11px; color: var(--dsw-alias-label-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cs-field-badges { display: inline-flex; align-items: center; gap: 8px; margin-left: auto; }
.cs-reset { border: none; background: none; padding: 0; font: inherit; font-size: 12px; color: var(--dsw-alias-label-secondary); cursor: pointer; }
.cs-reset:hover:not(:disabled) { color: var(--dsw-alias-label-primary); }
.cs-reset:disabled { opacity: .5; cursor: default; }
.cs-input { box-sizing: border-box; width: 100%; height: 34px; padding: 0 12px; border: .5px solid var(--dsw-alias-border-l4); border-radius: var(--dsw-radius-md); background: var(--dsw-alias-bg-layer-3); font: inherit; font-size: 13px; line-height: 1.5; color: var(--dsw-alias-label-primary); }
.cs-input:focus-visible { outline: none; border-color: var(--dsw-alias-state-business-primary); }
.cs-input:disabled { color: var(--dsw-alias-label-tertiary); cursor: default; }
.cs-input[aria-invalid="true"] { border-color: var(--dsw-alias-state-error-primary); }
.cs-textarea { box-sizing: border-box; width: 100%; min-height: 84px; padding: 8px 12px; resize: vertical; border: .5px solid var(--dsw-alias-border-l4); border-radius: var(--dsw-radius-md); background: var(--dsw-alias-bg-layer-3); font-family: var(--dsw-font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace); font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-primary); }
.cs-textarea:focus-visible { outline: none; border-color: var(--dsw-alias-state-business-primary); }
.cs-textarea[aria-invalid="true"] { border-color: var(--dsw-alias-state-error-primary); }
.cs-textarea:disabled { color: var(--dsw-alias-label-tertiary); }
.cs-hint { margin: 0; font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-tertiary); }
.cs-invalid { margin: 0; font-size: 12px; line-height: 1.5; color: var(--dsw-alias-state-error-primary); }
.cs-switch-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.cs-switch { box-sizing: border-box; position: relative; flex: 0 0 auto; width: 36px; height: 20px; padding: 2px; border: 0; border-radius: 999px; background: var(--dsw-alias-border-l3); cursor: pointer; }
.cs-switch[aria-checked="true"] { background: var(--dsw-alias-brand-primary); }
.cs-switch:disabled { cursor: default; opacity: .5; }
.cs-switch:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-business-primary); outline-offset: 2px; }
.cs-switch-thumb { display: block; width: 16px; height: 16px; border-radius: 50%; background: var(--dsw-alias-switch-thumb, #fff); transition: transform .12s ease; }
.cs-switch[aria-checked="true"] .cs-switch-thumb { transform: translateX(16px); }
.cs-footer { display: flex; align-items: center; gap: 8px; padding: 16px 0 4px; border-top: .5px solid var(--dsw-alias-border-l2); margin-top: 8px; flex-wrap: wrap; }
.cs-footer-status { flex: 1; min-width: 0; margin: 0; font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-tertiary); }
.cs-footer-status[data-tone="error"] { color: var(--dsw-alias-state-error-primary); }
.cs-select { box-sizing: border-box; width: 100%; height: 34px; padding: 0 10px; border: .5px solid var(--dsw-alias-border-l4); border-radius: var(--dsw-radius-md); background: var(--dsw-alias-bg-layer-3); font: inherit; font-size: 13px; color: var(--dsw-alias-label-primary); }
.cs-modal-root { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; }
.cs-modal-mask { position: absolute; inset: 0; background: var(--dsw-alias-bg-mask-1, rgba(0,0,0,.35)); }
.cs-modal { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 14px; width: min(660px, 100%); max-height: min(560px, 100%); padding: 18px 20px 16px; overflow: hidden; border-radius: var(--dsw-radius-panel, 12px); background: var(--dsw-alias-bg-layer-2); box-shadow: var(--dsw-elevation-prominent); }
.cs-modal-title { margin: 0; font-size: 14px; font-weight: 600; }
.cs-modal-note { margin: 0; font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-tertiary); }
.cs-modal-body { flex: 1; min-height: 0; margin: 0; padding: 10px 12px; overflow: auto; border-radius: var(--dsw-radius-md); background: var(--dsw-alias-bg-layer-3); font-family: var(--dsw-font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace); font-size: 12px; line-height: 1.55; white-space: pre-wrap; word-break: break-word; }
.cs-modal-footer { display: flex; justify-content: flex-end; gap: 8px; }
`

    /* ---------------------------------------------------------------- */
    /* transport                                                         */
    /* ---------------------------------------------------------------- */

    /**
     * Resolve an endpoint for the page's own origin.
     *
     * The browser page is same-origin with the Host, and the desktop page runs
     * on `dsh-app://app/`, whose protocol handler proxies every non-frontend
     * path to the Host with its cookie. Both want the relative path. Only a
     * `file:` page, which has no such proxy, needs the Host origin reported by
     * the desktop boot; pointing an `dsh-app:` page at that origin instead
     * would make the request cross-origin and be blocked.
     */
    function apiUrl(path) {
      if (typeof location === 'undefined' || location.protocol !== 'file:') return path
      const base = globalThis.__DSH_TRANSPORT__?.streamBaseUrl
      if (typeof base !== 'string') return path
      try {
        return new URL(path, base).toString()
      } catch {
        return path
      }
    }

    /** Call one configuration endpoint and unwrap its envelope. */
    async function call(endpoint, body) {
      let response
      try {
        response = await fetch(apiUrl(`/api/config-studio/${endpoint}`), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(body ?? {}),
        })
      } catch (cause) {
        const error = new Error('network')
        error.code = 'network'
        error.detail = cause instanceof Error ? cause.message : String(cause)
        throw error
      }
      if (response.status === 401 || response.status === 403) {
        const error = new Error('unauthorized')
        error.code = 'unauthorized'
        throw error
      }
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`)
        error.code = 'http'
        error.detail = `HTTP ${response.status}`
        throw error
      }
      let payload
      try {
        payload = await response.json()
      } catch {
        const error = new Error('protocol')
        error.code = 'protocol'
        throw error
      }
      if (payload && payload.ok === false) {
        const error = new Error(payload.error?.message ?? 'request failed')
        error.code = payload.error?.code ?? 'failed'
        error.path = payload.error?.path
        error.issues = payload.error?.issues
        throw error
      }
      return payload
    }

    /* ---------------------------------------------------------------- */
    /* formatting                                                        */
    /* ---------------------------------------------------------------- */

    /** Render a value the way it would appear in YAML, for the review dialog. */
    function yamlValue(value, indent) {
      const pad = ' '.repeat(indent)
      if (value === undefined) return 'null'
      if (value === null) return 'null'
      if (typeof value === 'string') return JSON.stringify(value)
      if (typeof value === 'number' || typeof value === 'boolean') return String(value)
      const text = JSON.stringify(value, null, 2)
      if (text === undefined) return 'null'
      return text.split('\n').join(`\n${pad}`)
    }

    /** Describe one change for the review dialog. */
    function changeLines(changes) {
      const lines = []
      for (const change of changes) {
        if (change.reset === true) {
          lines.push({ kind: 'del', text: `  ${change.key}: ${yamlValue(change.before, 2)}` })
          lines.push({ kind: 'add', text: `  ${change.key}: ${yamlValue(change.after, 2)}  # inherited` })
        } else {
          lines.push({ kind: 'del', text: `  ${change.key}: ${yamlValue(change.before, 2)}` })
          lines.push({ kind: 'add', text: `  ${change.key}: ${yamlValue(change.after, 2)}` })
        }
      }
      return lines
    }

    /* ---------------------------------------------------------------- */
    /* validation (experience only; the Host is authoritative)            */
    /* ---------------------------------------------------------------- */

    /** Format a field value for its text control. */
    function formatText(field, value) {
      if (value === undefined) return ''
      if (field.kind === 'json' || field.kind === 'object' || field.kind === 'array') {
        return JSON.stringify(value, null, 2)
      }
      return String(value)
    }

    /** Explain a refused write, keeping schema text as detail only. */
    function saveErrorText(t, error) {
      switch (error?.code) {
        case 'validation':
          return `${t('invalidValue')} ${error.message ?? ''}`.trim()
        case 'readonly':
          return t('readonlyChange')
        case 'stale':
          return t('staleEntry')
        case 'overridden':
          return t('overriddenByLayer')
        case 'network':
          return t('hintNetwork')
        case 'unauthorized':
          return t('hintUnauthorized')
        case 'conflict':
          return t('conflictBody')
        default:
          return `${t('errorGeneric')} ${error?.message ?? ''}`.trim()
      }
    }

    /** Explain a failed request without leaking transport internals into the UI. */
    function errorText(t, error) {
      if (error === undefined || error === null) return ''
      if (error.code === 'network') return t('hintNetwork')
      if (error.code === 'unauthorized') return t('hintUnauthorized')
      if (error.code === 'http') return error.detail ?? String(error.message ?? '')
      return String(error.message ?? '')
    }

    /** Pick the description for the active locale. */
    function describe(field, locale) {
      const map = field.descriptions
      if (map !== undefined && map !== null && typeof map === 'object') {
        const primary = String(locale ?? 'en').toLowerCase()
        const short = primary.split('-')[0]
        for (const key of [primary, short, 'en', '']) {
          if (typeof map[key] === 'string') return map[key]
        }
        const first = Object.values(map).find((value) => typeof value === 'string')
        if (first !== undefined) return first
      }
      return field.description
    }

    /** Parse a draft scalar against the field's projected shape. */
    function parseField(field, text) {
      if (field.kind === 'enum') {
        const match = (field.options ?? []).find((option) => String(option.value) === text)
        return match === undefined ? { kind: 'clear' } : { kind: 'set', value: match.value }
      }
      if (field.kind === 'number') {
        const trimmed = text.trim()
        if (trimmed === '') return { kind: 'clear' }
        const value = Number(trimmed)
        if (!Number.isFinite(value)) return { error: 'invalidNumber' }
        if (field.integer === true && !Number.isInteger(value)) return { error: 'invalidInteger' }
        if (typeof field.minimum === 'number' && value < field.minimum) return { error: 'outOfRange' }
        if (typeof field.maximum === 'number' && value > field.maximum) return { error: 'outOfRange' }
        return { kind: 'set', value }
      }
      if (field.kind === 'string') {
        if (typeof field.pattern === 'string') {
          try {
            if (!new RegExp(field.pattern).test(text)) return { error: 'invalidPattern' }
          } catch {
            /* an unusable pattern is left to the Host */
          }
        }
        return { kind: 'set', value: text }
      }
      if (field.kind === 'json' || field.kind === 'object' || field.kind === 'array') {
        const trimmed = text.trim()
        if (trimmed === '') return { kind: 'clear' }
        try {
          return { kind: 'set', value: JSON.parse(trimmed) }
        } catch {
          return { error: 'invalidJson' }
        }
      }
      return { kind: 'clear' }
    }

    /* ---------------------------------------------------------------- */
    /* field editor                                                      */
    /* ---------------------------------------------------------------- */

    /**
     * One schema-derived field row.
     * @param props - the field descriptor, its draft, and change callbacks.
     */
    function FieldRow(props) {
      const { t, field, draft, onChange, locale } = props
      const reset = draft?.reset === true
      const disabled = field.readonly || reset || props.disabled
      const inheritedText = formatText(field, field.inherited)
      const initialText = formatText(field, field.value)
      const text = reset ? inheritedText : draft?.text ?? initialText
      const booleanValue = draft?.boolean ?? field.value === true
      const dirty = draft !== undefined && !reset
      let message
      if (!field.readonly && field.kind !== 'boolean') {
        const parsed = parseField(field, text)
        if (parsed.error !== undefined) message = t(parsed.error)
      }
      const reasonText = field.readonly && field.reason !== undefined
        ? t(`reason.${field.reason}`)
        : undefined
      const description = describe(field, locale)
      const hint = field.readonly
        ? reasonText
        : field.kind === 'json' || field.kind === 'object' || field.kind === 'array'
          ? t('complexHint')
          : description

      const head = h('div', {
        className: 'cs-field-head',
        children: [
          h('label', {
            className: 'cs-field-label',
            htmlFor: `cs-field-${field.key}`,
            children: field.label,
          }),
          h('span', { className: 'cs-field-key', children: field.key }),
          h('span', {
            className: 'cs-field-badges',
            children: [
              field.overridden ? h('span', { className: 'cs-tag cs-tag-accent', children: t('overridden') }) : null,
              field.readonly ? h('span', { className: 'cs-tag', children: t('readonlyBadge') }) : null,
              field.volatile ? h('span', { className: 'cs-tag', children: t('volatile') }) : null,
              field.readonly
                ? null
                : field.overridden || field.value !== undefined || field.hasInherited === true
                  ? h('button', {
                      type: 'button',
                      className: 'cs-reset',
                      disabled: props.disabled,
                      onClick: () => onChange({ reset: true }),
                      children: t('reset'),
                    })
                  : null,
              reset
                ? h('button', {
                    type: 'button',
                    className: 'cs-reset',
                    onClick: () => onChange(undefined),
                    children: t('undoReset'),
                  })
                : null,
            ],
          }),
        ],
      })

      let control
      if (field.readonly) {
        const shown = field.reason === 'secret' || field.reason === 'contains-secret'
          ? (field.configured === true ? '••••••' : '')
          : field.reason === 'expression'
            ? '!!js'
            : (field.value === undefined ? '' : formatText(field, field.value))
        control = h('input', {
          id: `cs-field-${field.key}`,
          className: 'cs-input',
          type: 'text',
          value: shown,
          readOnly: true,
          disabled: true,
        })
      } else if (field.kind === 'boolean') {
        control = h('div', {
          className: 'cs-switch-row',
          children: [
            h('span', { className: 'cs-hint', children: description }),
            h('button', {
              id: `cs-field-${field.key}`,
              type: 'button',
              role: 'switch',
              'aria-checked': booleanValue ? 'true' : 'false',
              'aria-label': field.label,
              className: 'cs-switch',
              disabled,
              onClick: () => onChange({ boolean: !booleanValue }),
              children: h('span', { className: 'cs-switch-thumb' }),
            }),
          ],
        })
        message = undefined
      } else if (field.kind === 'enum') {
        control = h('select', {
          id: `cs-field-${field.key}`,
          className: 'cs-select',
          value: reset ? '' : text,
          disabled,
          onChange: (event) => onChange({ text: event.currentTarget.value }),
          children: [
            h('option', { value: '', children: '—' }),
            ...(field.options ?? []).map((option) => h('option', {
              value: String(option.value),
              children: option.label,
            }, String(option.value))),
          ],
        })
      } else if (field.kind === 'json' || field.kind === 'object' || field.kind === 'array') {
        control = h('textarea', {
          id: `cs-field-${field.key}`,
          className: 'cs-textarea',
          spellCheck: false,
          value: reset ? inheritedText : text,
          disabled,
          'aria-invalid': message !== undefined ? 'true' : undefined,
          onChange: (event) => onChange({ text: event.currentTarget.value }),
        })
      } else {
        control = h('input', {
          id: `cs-field-${field.key}`,
          className: 'cs-input',
          type: 'text',
          inputMode: field.kind === 'number' ? 'decimal' : undefined,
          value: reset ? inheritedText : text,
          placeholder: field.default === undefined ? '' : String(field.default),
          disabled,
          'aria-invalid': message !== undefined ? 'true' : undefined,
          onChange: (event) => onChange({ text: event.currentTarget.value }),
        })
      }

      return h('div', {
        className: 'cs-field',
        'data-dirty': dirty ? 'true' : 'false',
        children: [
          head,
          control,
          reset ? h('p', { className: 'cs-hint', children: t('resetHint') }) : null,
          message !== undefined
            ? h('p', { className: 'cs-invalid', children: message })
            : hint !== undefined
              ? h('p', { className: 'cs-hint', children: hint })
              : null,
        ],
      })
    }

    /* ---------------------------------------------------------------- */
    /* review dialog                                                     */
    /* ---------------------------------------------------------------- */

    /** Modal that lists the pending changes as a patch-shaped diff. */
    function DiffModal(props) {
      const { t, entryId, lines, onCancel, onConfirm, busy } = props
      const ref = React.useRef(null)
      React.useEffect(() => {
        const onKey = (event) => {
          if (event.key === 'Escape') onCancel()
        }
        document.addEventListener('keydown', onKey, true)
        ref.current?.focus()
        return () => document.removeEventListener('keydown', onKey, true)
      }, [onCancel])
      const body = lines.length === 0
        ? t('diffEmpty')
        : lines.map((line) => `${line.kind === 'add' ? '+' : '-'}${line.text}`).join('\n')
      return h('div', {
        className: 'cs-modal-root',
        children: [
          h('div', { className: 'cs-modal-mask', onClick: onCancel, 'aria-hidden': 'true' }),
          h('div', {
            className: 'cs-modal',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': t('diffTitle'),
            tabIndex: -1,
            ref,
            children: [
              h('div', {
                children: [
                  h('h2', { className: 'cs-modal-title', children: t('diffTitle') }),
                  h('p', { className: 'cs-modal-note', children: entryId }),
                  h('p', { className: 'cs-modal-note', children: t('diffNote') }),
                ],
              }),
              h('pre', { className: 'cs-modal-body', children: body }),
              h('div', {
                className: 'cs-modal-footer',
                children: [
                  h('button', { type: 'button', className: 'cs-button', onClick: onCancel, children: t('diffCancel') }),
                  h('button', {
                    type: 'button',
                    className: 'cs-button cs-button-primary',
                    disabled: busy === true || lines.length === 0,
                    onClick: onConfirm,
                    children: busy === true ? t('saving') : t('diffApply'),
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    }

    /* ---------------------------------------------------------------- */
    /* detail view                                                       */
    /* ---------------------------------------------------------------- */

      /**
       * One entry's generated form.
       * @param props - entry id, locale reader, and refresh callbacks.
       */
    function DetailView(props) {
      const { t, entryId, onBack, onApplied, locale } = props
      const [snapshot, setSnapshot] = React.useState(null)
      const [status, setStatus] = React.useState('loading')
      const [failure, setFailure] = React.useState(null)
      const [drafts, setDrafts] = React.useState({})
      const [saving, setSaving] = React.useState(false)
      const [notice, setNotice] = React.useState(null)
      const [conflict, setConflict] = React.useState(false)
      const [reviewing, setReviewing] = React.useState(false)
      const [reloadToken, setReloadToken] = React.useState(0)

      React.useEffect(() => {
        let cancelled = false
        setStatus('loading')
        setFailure(null)
        setDrafts({})
        setConflict(false)
        call('read', { id: entryId })
          .then((data) => {
            if (cancelled) return
            setSnapshot(data)
            setStatus('ready')
          })
          .catch((error) => {
            if (cancelled) return
            setFailure(error)
            setStatus('error')
          })
        return () => { cancelled = true }
      }, [entryId, reloadToken])

      const fields = snapshot?.fields ?? []
      const changes = React.useMemo(() => {
        const result = []
        for (const field of fields) {
          const draft = drafts[field.key]
          if (draft === undefined) continue
          const before = field.value
          if (draft.reset === true) {
            result.push({ key: field.key, reset: true, before, after: field.hasInherited === true ? field.inherited : undefined })
            continue
          }
          if (field.kind === 'boolean') {
            const value = draft.boolean === true
            if (value !== (field.value === true)) result.push({ key: field.key, value, before, after: value })
            continue
          }
          const parsed = parseField(field, draft.text ?? '')
          if (parsed.error !== undefined) continue
          if (parsed.kind === 'clear') {
            result.push({ key: field.key, reset: true, before, after: field.hasInherited === true ? field.inherited : undefined })
            continue
          }
          if (JSON.stringify(parsed.value) !== JSON.stringify(field.value)) {
            result.push({ key: field.key, value: parsed.value, before, after: parsed.value })
          }
        }
        return result
      }, [drafts, fields])

      const invalidCount = React.useMemo(() => {
        let count = 0
        for (const field of fields) {
          const draft = drafts[field.key]
          if (draft === undefined || draft.reset === true || field.kind === 'boolean') continue
          if (parseField(field, draft.text ?? '').error !== undefined) count += 1
        }
        return count
      }, [drafts, fields])

      const dirty = changes.length > 0
      const canSave = dirty && invalidCount === 0 && !saving && snapshot?.readonly === undefined

      const setDraft = (key, draft) => {
        setDrafts((current) => {
          const next = { ...current }
          if (draft === undefined) delete next[key]
          else next[key] = draft
          return next
        })
        setNotice(null)
      }

      const submit = async () => {
        if (!canSave) return
        setSaving(true)
        setNotice(null)
        try {
          const payload = changes.map((change) => change.reset === true
            ? { key: change.key, reset: true }
            : { key: change.key, value: change.value })
          const result = await call('write', { id: entryId, expectedRevision: snapshot.revision, changes: payload })
          setDrafts({})
          setNotice({ tone: 'ok', text: result.restoredDefault === true ? t('appliedRestore') : t('applied') })
          setReloadToken((value) => value + 1)
          onApplied?.()
        } catch (error) {
          if (error.code === 'conflict') {
            setConflict(true)
          } else {
            setNotice({ tone: 'error', text: saveErrorText(t, error) })
          }
        } finally {
          setSaving(false)
          setReviewing(false)
        }
      }

      if (status === 'loading') {
        return h('div', { className: 'cs-root', children: h('p', { className: 'cs-hint', children: t('loading') }) })
      }
      if (status === 'error') {
        return h('div', {
          className: 'cs-root',
          children: [
            h('button', { type: 'button', className: 'cs-button cs-button-quiet', onClick: onBack, children: `← ${t('back')}` }),
            h('div', { className: 'cs-empty', children: [
              h('p', { className: 'cs-empty-title', children: t('loadFailed') }),
              h('p', { className: 'cs-empty-body', children: errorText(t, failure) }),
              h('button', {
                type: 'button',
                className: 'cs-button',
                onClick: () => setReloadToken((value) => value + 1),
                children: t('retry'),
              }),
            ] }),
          ],
        })
      }

      const readonly = snapshot.readonly
      const reasonText = readonly !== undefined ? t(`reason.${readonly.code}`) : undefined

      return h('div', {
        className: 'cs-root',
        children: [
          h('div', {
            className: 'cs-detail-head',
            children: [
              h('button', {
                type: 'button',
                className: 'cs-button cs-button-quiet',
                style: { alignSelf: 'flex-start', padding: 0 },
                onClick: onBack,
                children: `← ${t('back')}`,
              }),
              h('div', {
                className: 'cs-detail-title',
                children: [
                  h('span', { className: 'cs-detail-id', children: snapshot.id }),
                  snapshot.overridden ? h('span', { className: 'cs-tag cs-tag-accent', children: t('overridden') }) : null,
                  snapshot.status !== 'active' ? h('span', { className: 'cs-tag', children: t(`reason.${snapshot.status === 'disabled' ? 'disabledEntry' : snapshot.status}`) }) : null,
                  readonly !== undefined ? h('span', { className: 'cs-tag cs-tag-warn', children: t('readonlyBadge') }) : null,
                ],
              }),
              h('span', { className: 'cs-detail-name', children: snapshot.name ?? '' }),
              h('div', {
                className: 'cs-detail-actions',
                children: [
                  h('span', { className: 'cs-stats', children: t('fieldCount', { fields: String(fields.length) }) }),
                  h('button', {
                    type: 'button',
                    className: 'cs-button cs-button-quiet',
                    onClick: () => setReloadToken((value) => value + 1),
                    children: t('reload'),
                  }),
                ],
              }),
            ],
          }),
          readonly !== undefined
            ? h('div', { className: 'cs-notice', children: reasonText ?? snapshot.readonly?.message ?? '' })
            : null,
          conflict
            ? h('div', {
                className: 'cs-notice',
                'data-tone': 'error',
                children: [
                  h('div', {
                    children: [
                      h('strong', { children: t('conflictTitle') }),
                      h('div', { children: t('conflictBody') }),
                    ],
                  }),
                  h('button', {
                    type: 'button',
                    className: 'cs-button',
                    onClick: () => setReloadToken((value) => value + 1),
                    children: t('conflictReload'),
                  }),
                ],
              })
            : null,
          fields.length === 0 && readonly === undefined
            ? h('div', { className: 'cs-empty', children: h('p', { className: 'cs-empty-body', children: t('noFields') }) })
            : null,
          fields.length === 0
            ? null
            : h('div', {
                className: 'cs-fields',
                children: fields.map((field) => h(FieldRow, {
                  t,
                  locale,
                  field,
                  draft: drafts[field.key],
                  disabled: saving,
                  onChange: (draft) => setDraft(field.key, draft),
                }, field.key)),
              }),
          fields.length === 0
            ? null
            : h('div', {
                className: 'cs-footer',
                children: [
                  h('p', {
                    className: 'cs-footer-status',
                    'data-tone': notice?.tone === 'error' ? 'error' : undefined,
                    children: notice?.text
                      ?? (invalidCount > 0 ? t('fixInvalid') : dirty ? t('unsaved') : t('unchanged')),
                  }),
                  h('button', {
                    type: 'button',
                    className: 'cs-button',
                    disabled: !dirty || saving,
                    onClick: () => setDrafts({}),
                    children: t('discard'),
                  }),
                  h('button', {
                    type: 'button',
                    className: 'cs-button',
                    disabled: !canSave,
                    onClick: () => setReviewing(true),
                    children: t('save'),
                  }),
                ],
              }),
          reviewing
            ? h(DiffModal, {
                t,
                entryId: `${entryId} · ${snapshot.name ?? ''}`,
                lines: changeLines(changes),
                busy: saving,
                onCancel: () => setReviewing(false),
                onConfirm: submit,
              })
            : null,
        ],
      })
    }

    /* ---------------------------------------------------------------- */
    /* list view                                                         */
    /* ---------------------------------------------------------------- */

    /** Render order of the function buckets the Host assigns. */
    const CATEGORY_ORDER = ['models', 'agents', 'tools', 'web', 'account', 'runtime', 'session', 'ui', 'platform', 'other']

    /** Render order of the origin buckets. */
    const ORIGIN_ORDER = ['official', 'third-party']

    /** Entry picker with search, stats, and read-only markers. */
    function ListView(props) {
      const { t, onOpen, query, setQuery, onlyEditable, setOnlyEditable, groupBy, setGroupBy, collapsed, setCollapsed } = props
      const [state, setState] = React.useState({ status: 'loading', entries: [], stats: null })
      const [token, setToken] = React.useState(0)

      React.useEffect(() => {
        let cancelled = false
        setState((current) => ({ ...current, status: 'loading' }))
        call('list', {})
          .then((data) => {
            if (cancelled) return
            setState({ status: 'ready', entries: data.entries, stats: data.stats })
          })
          .catch((error) => {
            if (cancelled) return
            setState({ status: 'error', entries: [], stats: null, error })
          })
        return () => { cancelled = true }
      }, [token])

      const stats = state.stats
      const needle = query.trim().toLowerCase()
      const scoped = onlyEditable ? state.entries.filter((entry) => entry.editable) : state.entries
      const entries = needle === ''
        ? scoped
        : scoped.filter((entry) => `${entry.id} ${entry.name ?? ''}`.toLowerCase().includes(needle))

      const toolbar = h('div', {
        className: 'cs-toolbar',
        children: [
          h('input', {
            className: 'cs-search',
            type: 'search',
            value: query,
            placeholder: t('search'),
            'aria-label': t('search'),
            onChange: (event) => setQuery(event.currentTarget.value),
          }),
          h('button', {
            type: 'button',
            className: 'cs-button',
            onClick: () => setToken((value) => value + 1),
            disabled: state.status === 'loading',
            children: t('refresh'),
          }),
        ],
      })

      const filters = h('div', {
        className: 'cs-filters',
        children: [
          h('div', {
            className: 'cs-segmented',
            role: 'group',
            'aria-label': t('filterLabel'),
            children: [[true, t('onlyEditable')], [false, t('allEntries')]].map(([value, label]) => h('button', {
              type: 'button',
              className: 'cs-seg',
              'aria-pressed': onlyEditable === value ? 'true' : 'false',
              onClick: () => setOnlyEditable(value),
              children: label,
            }, String(value))),
          }),
          h('div', {
            className: 'cs-segmented',
            role: 'group',
            'aria-label': t('groupLabel'),
            children: [['function', t('groupByFunction')], ['origin', t('groupByOrigin')]].map(([value, label]) => h('button', {
              type: 'button',
              className: 'cs-seg',
              'aria-pressed': groupBy === value ? 'true' : 'false',
              onClick: () => setGroupBy(value),
              children: label,
            }, value)),
          }),
        ],
      })

      const groups = groupBy === 'origin'
        ? ORIGIN_ORDER.map((key) => ({ key, label: t(`origin.${key}`), entries: entries.filter((entry) => entry.origin === key) }))
        : CATEGORY_ORDER.map((key) => ({ key, label: t(`category.${key}`), entries: entries.filter((entry) => (entry.category ?? 'other') === key) }))
      const visibleGroups = groups.filter((group) => group.entries.length > 0)
      const allCollapsed = visibleGroups.length > 0 && visibleGroups.every((group) => collapsed.has(group.key))
      const toggleGroup = (key) => setCollapsed((current) => {
        const next = new Set(current)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
      })

      let body
      if (state.status === 'loading') {
        body = h('p', { className: 'cs-hint', children: t('loading') })
      } else if (state.status === 'error') {
        body = h('div', {
          className: 'cs-empty',
          children: [
            h('p', { className: 'cs-empty-title', children: t('loadFailed') }),
            h('p', { className: 'cs-empty-body', children: errorText(t, state.error) }),
            h('button', {
              type: 'button',
              className: 'cs-button',
              onClick: () => setToken((value) => value + 1),
              children: t('retry'),
            }),
          ],
        })
      } else if (state.entries.length === 0) {
        body = h('div', {
          className: 'cs-empty',
          children: [
            h('p', { className: 'cs-empty-title', children: t('emptyTitle') }),
            h('p', { className: 'cs-empty-body', children: t('emptyBody') }),
          ],
        })
      } else if (entries.length === 0) {
        const text = onlyEditable && needle === '' ? t('emptyEditable') : t('emptyFilter')
        body = h('div', { className: 'cs-empty', children: h('p', { className: 'cs-empty-body', children: text }) })
      } else {
        const renderEntry = (entry) => h('li', {
          children: h('button', {
            type: 'button',
            className: 'cs-item',
            'data-readonly': entry.editable ? 'false' : 'true',
            onClick: () => onOpen(entry.id),
            children: [
              h('span', {
                className: 'cs-item-top',
                children: [
                  h('span', { className: 'cs-item-id', children: entry.id }),
                  entry.overridden ? h('span', { className: 'cs-tag cs-tag-accent', children: t('overridden') }) : null,
                  entry.origin === 'third-party' ? h('span', { className: 'cs-tag', children: t('origin.third-party') }) : null,
                  entry.editable ? null : h('span', { className: 'cs-tag', children: t('readonlyBadge') }),
                ],
              }),
              h('span', { className: 'cs-item-name', children: entry.name ?? '' }),
              h('span', {
                className: 'cs-item-meta',
                children: [
                  entry.fields > 0 ? t('fieldCount', { fields: String(entry.fields) }) : null,
                  entry.reason !== undefined ? ` · ${t(`reason.${entry.reason === 'disabled' ? 'disabledEntry' : entry.reason}`)}` : null,
                ].filter(Boolean).join(''),
              }),
            ],
          }),
        }, entry.id)
        body = h('div', {
          className: 'cs-groups',
          children: visibleGroups.map((group) => {
            const isCollapsed = collapsed.has(group.key)
            return h('section', {
              className: 'cs-group',
              children: [
                h('button', {
                  type: 'button',
                  className: 'cs-group-head',
                  'aria-expanded': isCollapsed ? 'false' : 'true',
                  onClick: () => toggleGroup(group.key),
                  children: [
                    h('svg', {
                      className: 'cs-chevron',
                      width: 10,
                      height: 10,
                      viewBox: '0 0 10 10',
                      'aria-hidden': 'true',
                      children: h('path', {
                        d: 'M3 1.5 L7 5 L3 8.5',
                        fill: 'none',
                        stroke: 'currentColor',
                        strokeWidth: '1.5',
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                      }),
                    }),
                    h('span', { className: 'cs-group-label', children: group.label }),
                    h('span', { className: 'cs-group-count', children: String(group.entries.length) }),
                  ],
                }),
                isCollapsed ? null : h('ul', { className: 'cs-list', children: group.entries.map(renderEntry) }),
              ],
            }, group.key)
          }),
        })
      }

      return h('div', {
        className: 'cs-root',
        children: [
          h('div', {
            className: 'cs-head',
            children: [
              h('h1', { className: 'cs-title', children: t('title') }),
              h('p', { className: 'cs-sub', children: t('subtitle') }),
              toolbar,
              filters,
              h('div', {
                className: 'cs-stats-row',
                children: [
                  h('p', {
                    className: 'cs-stats',
                    children: stats === null
                      ? ''
                      : t('statsAll', { total: String(stats.total), editable: String(stats.editable), readonly: String(stats.readonly) }),
                  }),
                  visibleGroups.length > 1
                    ? h('button', {
                        type: 'button',
                        className: 'cs-link',
                        onClick: () => setCollapsed(allCollapsed ? new Set() : new Set(visibleGroups.map((group) => group.key))),
                        children: allCollapsed ? t('expandAll') : t('collapseAll'),
                      })
                    : null,
                ],
              }),
            ],
          }),
          body,
        ],
      })
    }

    /* ---------------------------------------------------------------- */
    /* section                                                           */
    /* ---------------------------------------------------------------- */

    /** The Settings section: list, then one entry's form. */
    function StudioSection(props) {
      const t = props.t ?? props.tr
      const locale = props.locale
      const [selected, setSelected] = React.useState(null)
      const [version, setVersion] = React.useState(0)
      const [query, setQuery] = React.useState('')
      const [onlyEditable, setOnlyEditable] = React.useState(true)
      const [groupBy, setGroupBy] = React.useState('function')
      const [collapsed, setCollapsed] = React.useState(() => new Set())
      const onApplied = React.useCallback(() => setVersion((value) => value + 1), [])
      if (selected === null) {
        return h(ListView, {
          t,
          locale,
          onOpen: setSelected,
          query,
          setQuery,
          onlyEditable,
          setOnlyEditable,
          groupBy,
          setGroupBy,
          collapsed,
          setCollapsed,
        }, `list-${version}`)
      }
      return h(DetailView, {
        t,
        locale,
        entryId: selected,
        onBack: () => {
          setSelected(null)
          setVersion((value) => value + 1)
        },
        onApplied,
      })
    }

    /* ---------------------------------------------------------------- */
    /* plugin                                                            */
    /* ---------------------------------------------------------------- */

    /** Services the browser half needs. */
    const inject = ['slots', 'locale']

    /**
     * Register the settings section and its dictionaries.
     * @param ctx - the browser plugin context.
     */
    function apply(ctx) {
      const t = ctx.locale.bind(NS)
      ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'config-studio: dictionaries')
      ctx.effect(() => {
        const tag = document.createElement('style')
        tag.dataset.plugin = 'dsh-config-studio'
        tag.textContent = CSS
        document.head.appendChild(tag)
        return () => tag.remove()
      }, 'config-studio: styles')
      ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'config-studio',
        order: 30,
        label: () => t('nav'),
        locale: NS,
        inject: () => ({ tr: t, locale: ctx.locale.getSnapshot().active }),
      }, StudioSection))
    }

    return { inject, apply }
  },
})
