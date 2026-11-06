window.__ModuleLoader__.load({
  id: 'dsh-config-studio',
  factory(require) {
    const React = require('react')

    /** Element helper: `h(type, props, key)`. */
    const h = (type, props, key) => {
      const { children, ...rest } = props ?? {}
      return React.createElement(
        type,
        key === undefined ? rest : { ...rest, key },
        ...(Array.isArray(children) ? children : [children]),
      )
    }

    /** Dictionary namespace owned by this plugin. */
    const NS = 'settings.config-studio'

    /* ---------------------------------------------------------------- */
    /* copy                                                              */
    /* ---------------------------------------------------------------- */

    const en = {
      nav: 'Plugin configuration',
      title: 'Plugin configuration',
      subtitle:
        'Edit any configurable plugin in the active profile. Saves go to the profile patch and reload through the Loader; a few plugins only pick the change up after a restart.',
      search: 'Search by entry id or package',
      refresh: 'Reload',
      reload: 'Reload entry',
      back: 'Back to the list',
      loading: 'Loading configuration…',
      loadFailed: 'The configuration service did not answer.',
      hintNetwork:
        'The page could not reach the Host. Reload the page, and check that the Host is still running.',
      hintUnauthorized:
        'This page is not authenticated for the Host. Reopen it from the URL the Host printed.',
      retry: 'Retry',
      emptyTitle: 'No addressable configuration',
      emptyBody:
        'This profile exposes no editable Loader entry. A profile managed exclusively by the desktop application still composes entries here; nested includes stay read-only.',
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
      conflictBody:
        'Another edit was applied after this page read the entry. Reload it and apply your changes again.',
      conflictReload: 'Reload entry',
      errorGeneric: 'The change was not applied.',
      invalidValue: 'The Host rejected this value:',
      readonlyChange: 'That field is read-only in this entry.',
      staleEntry: 'This entry was replaced while the form was open. Reload it and try again.',
      overriddenByLayer:
        'A home patch or command-line overlay takes precedence, so this profile write would have no effect.',
      invalidNumber: 'Enter a number.',
      invalidInteger: 'Enter a whole number.',
      invalidJson: 'This value is not valid JSON.',
      invalidPattern: 'The value does not match the required pattern.',
      outOfRange: 'The value is outside the allowed range.',
      required: 'Required',
      volatile: 'Live',
      partial: 'Partly projected',
      secretNotice:
        'This field holds a credential. Its value never leaves the Host and cannot be edited here.',
      expressionNotice: 'This field is a !!js expression and can only be edited in YAML.',
      complexHint: 'Edit as JSON. The Host validates the saved value against the plugin schema.',
      unchanged: 'No changes yet.',
      fixInvalid: 'Fix the highlighted fields before saving.',
      diffTitle: 'Review changes',
      diffNote:
        'Only the fields changed here are written; the whole config object is replaced in the profile patch and the plugin reloads through the Loader.',
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
      subtitle:
        '编辑当前 profile 中任意可配置插件；保存会写入 profile 补丁并由 Loader 重载，个别插件需要重启应用后才完全生效。',
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
      emptyBody:
        '当前 profile 没有暴露可编辑的 Loader 条目。由桌面应用独占管理的 profile 也会在这里列出条目；嵌套 include 中的条目保持只读。',
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
/* Match the host settings rows, plugin cards and shared theme tokens. */
.cs-root {
  --cs-surface: var(--dsw-alias-bg-layer-2, #f5f6f8);
  --cs-control: var(--dsw-alias-bg-module-platform, var(--dsw-alias-bg-layer-3, #eef0f3));
  --cs-card: var(--dsw-alias-settings-card-fill, transparent);
  --cs-stroke: var(--dsw-alias-settings-card-stroke, var(--dsw-alias-border-l2, #d9dce3));
  --cs-hover: var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-3, #eceef2));
  --cs-focus: var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary, #5265bb));
  --cs-mono: var(--dsw-font-mono, var(--dsw-font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace));
  display: flex; flex-direction: column; gap: 20px; width: 100%; min-width: 0;
  color: var(--dsw-alias-label-primary); font-family: inherit; font-size: 14px; line-height: 22px;
}
.cs-root, .cs-root * { box-sizing: border-box; }
.cs-root button, .cs-root input, .cs-root select, .cs-root textarea { font-family: inherit; }
.cs-root button { -webkit-tap-highlight-color: transparent; }
.cs-icon { display: inline-block; flex: none; vertical-align: middle; pointer-events: none; }
.cs-head { display: flex; flex-direction: column; gap: 14px; }
.cs-heading-line { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-width: 0; }
.cs-title { margin: 0; font-size: 18px; font-weight: 500; line-height: 26px; overflow-wrap: anywhere; }
.cs-sub { margin: -6px 0 0; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-secondary); }
.cs-profile { display: inline-flex; align-items: center; gap: 5px; flex: none; padding: 2px 7px; border: .5px solid var(--dsw-alias-border-l2); border-radius: 6px; color: var(--dsw-alias-label-secondary); font-size: 11px; line-height: 18px; }
.cs-filters { display: flex; align-items: center; gap: 20px; min-width: 0; padding: 0; border-bottom: .5px solid var(--dsw-alias-border-l2); overflow-x: auto; scrollbar-width: thin; }
.cs-seg { appearance: none; position: relative; flex: none; height: 40px; padding: 0 1px 9px; border: 0; border-radius: 0; background: transparent; color: var(--dsw-alias-label-secondary); font-size: 13px; font-weight: 400; line-height: 20px; cursor: pointer; white-space: nowrap; }
.cs-seg[aria-pressed="true"] { color: var(--dsw-alias-label-primary); font-weight: 500; }
.cs-seg[aria-pressed="true"]::after { content: ''; position: absolute; inset: auto 0 0; height: 2px; border-radius: 2px; background: currentColor; }
.cs-toolbar { display: flex; align-items: center; gap: 8px; min-width: 0; }
.cs-search-box { display: flex; align-items: center; flex: 1; gap: 8px; min-width: 0; height: 36px; padding: 0 10px; border: .5px solid var(--dsw-alias-border-l3, var(--cs-stroke)); border-radius: var(--dsw-radius-md, 10px); background: var(--dsw-alias-bg-layer-1, transparent); color: var(--dsw-alias-label-tertiary); }
.cs-search-box:focus-within { border-color: var(--cs-focus); }
.cs-search { appearance: none; flex: 1; width: 100%; min-width: 0; height: 34px; margin: 0; padding: 0; border: 0; background: transparent; color: var(--dsw-alias-label-primary); font-size: 13px; line-height: 20px; outline: none; }
.cs-search::-webkit-search-cancel-button { appearance: none; }
.cs-search::placeholder { color: var(--dsw-alias-label-tertiary); opacity: 1; }
.cs-search-clear { appearance: none; display: inline-flex; align-items: center; justify-content: center; flex: none; width: 22px; height: 22px; padding: 0; border: 0; border-radius: 5px; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; }
.cs-button { appearance: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; flex: none; min-height: 32px; padding: 5px 12px; border: .5px solid var(--dsw-alias-border-l3, var(--cs-stroke)); border-radius: var(--dsw-radius-md, 10px); background: transparent; color: var(--dsw-alias-label-primary); font-size: 13px; font-weight: 400; line-height: 20px; cursor: pointer; white-space: nowrap; }
.cs-button-icon { width: 36px; height: 36px; padding: 0; }
.cs-button-primary { border-color: transparent; background: var(--dsw-alias-label-primary); color: var(--dsw-alias-bg-layer-1); font-weight: 500; }
.cs-button-quiet { border-color: transparent; color: var(--dsw-alias-label-secondary); padding-inline: 6px; }
.cs-button:disabled, .cs-reset:disabled { opacity: .4; cursor: default; }
.cs-stats-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 14px; }
.cs-stats { margin: 0; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; font-variant-numeric: tabular-nums; }
.cs-list-options { display: flex; align-items: center; gap: 12px; }
.cs-group-select { appearance: auto; max-width: 130px; padding: 2px 4px; border: 0; background: transparent; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 20px; cursor: pointer; }
.cs-link { appearance: none; padding: 0; border: 0; background: transparent; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 20px; cursor: pointer; white-space: nowrap; }
.cs-groups { container: cs-groups / inline-size; display: flex; flex-direction: column; gap: 24px; }
.cs-group { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.cs-group-head { display: flex; align-items: center; gap: 7px; width: 100%; min-height: 26px; padding: 0; border: 0; border-radius: 5px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; text-align: left; cursor: pointer; }
.cs-group-head .cs-icon { transition: transform .12s ease; }
.cs-group-head[aria-expanded="true"] .cs-icon { transform: rotate(90deg); }
.cs-group-label { color: var(--dsw-alias-label-primary); font-size: 14px; font-weight: 500; line-height: 22px; }
.cs-group-count { margin-left: 2px; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; font-variant-numeric: tabular-nums; }
.cs-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 0; padding: 0; list-style: none; }
.cs-list > li { min-width: 0; }
.cs-list > li:only-child { grid-column: 1 / -1; }
.cs-item { display: flex; flex-direction: column; gap: 7px; width: 100%; height: 100%; min-width: 0; padding: 13px 14px; border: .5px solid var(--cs-stroke); border-radius: var(--dsw-radius-xl, 16px); background: var(--cs-card); color: inherit; font: inherit; text-align: left; cursor: pointer; transition: background-color .12s, border-color .12s; }
.cs-item-top { display: flex; align-items: center; gap: 8px; min-width: 0; }
.cs-item-title { flex: 1; min-width: 0; font-size: 14px; font-weight: 500; line-height: 20px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cs-item-arrow { color: var(--dsw-alias-label-tertiary); }
.cs-item-id { width: fit-content; max-width: 100%; padding: 1px 5px; border-radius: 4px; background: var(--cs-control); color: var(--dsw-alias-label-secondary); font-family: var(--cs-mono); font-size: 11px; line-height: 18px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cs-item-meta { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; min-width: 0; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
.cs-item-meta > span:first-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cs-item-tags { display: inline-flex; align-items: center; flex-wrap: wrap; justify-content: flex-end; gap: 5px; flex: 0 1 auto; }
.cs-item[data-readonly="true"] .cs-item-title { color: var(--dsw-alias-label-secondary); }
.cs-tag { display: inline-flex; align-items: center; gap: 4px; padding: 1px 6px; border-radius: 999px; background: var(--cs-control); color: var(--dsw-alias-label-secondary); font-size: 11px; font-weight: 400; line-height: 16px; white-space: nowrap; }
.cs-tag-accent { color: var(--dsw-alias-label-primary); }
.cs-tag-accent::before { content: ''; width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
.cs-tag-warn { color: var(--dsw-alias-state-warn-primary); }
.cs-tag-error { color: var(--dsw-alias-state-error-primary); }
.cs-detail-head { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 12px; padding-bottom: 4px; }
.cs-detail-head > .cs-heading-line, .cs-detail-head > .cs-back { grid-column: 1 / -1; }
.cs-detail-head > .cs-back { justify-self: start; }
.cs-detail-head > .cs-technical { max-width: 100%; }
.cs-back { align-self: flex-start; min-height: 26px; margin-left: -6px; padding: 2px 6px; font-size: 12px; }
.cs-detail-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.cs-technical { min-width: 0; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 20px; }
.cs-technical summary { width: fit-content; cursor: pointer; }
.cs-technical[open] { padding: 10px 12px; border: .5px solid var(--cs-stroke); border-radius: 8px; }
.cs-technical[open] summary { margin-bottom: 6px; }
.cs-technical > div { overflow-wrap: anywhere; font-family: var(--cs-mono); font-size: 11px; }
.cs-fields { container: cs-fields / inline-size; display: flex; flex-direction: column; }
.cs-field { display: grid; grid-template-columns: minmax(0, 1fr) minmax(140px, 220px); align-items: center; gap: 8px 24px; min-width: 0; padding: 16px 0; border-bottom: .5px solid var(--dsw-alias-border-l2); position: relative; }
.cs-field:first-child { padding-top: 4px; }
.cs-field:last-child { border-bottom: 0; }
.cs-field-copy > .cs-hint:empty { display: none; }
.cs-field-actions { display: flex; align-items: center; gap: 8px; }
.cs-field-copy { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.cs-field-head { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px; min-width: 0; }
.cs-field-label { color: var(--dsw-alias-label-primary); font-size: 14px; font-weight: 400; line-height: 22px; overflow-wrap: anywhere; }
.cs-field-required { color: var(--dsw-alias-label-tertiary); font-size: 11px; line-height: 16px; }
.cs-field-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 5px 8px; min-width: 0; }
.cs-field-key { max-width: 100%; color: var(--dsw-alias-label-tertiary); font-family: var(--cs-mono); font-size: 11px; line-height: 18px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cs-field-source { color: var(--dsw-alias-label-tertiary); font-size: 11px; line-height: 18px; white-space: nowrap; }
.cs-field-source::before { content: '·'; margin-right: 7px; }
.cs-field-live { color: var(--dsw-alias-label-tertiary); font-size: 11px; line-height: 18px; }
.cs-field-live::before { content: '·'; margin-right: 7px; }
.cs-reset { appearance: none; padding: 0; border: 0; background: transparent; color: var(--dsw-alias-label-secondary); font-size: 11px; line-height: 18px; cursor: pointer; }
.cs-field-control { min-width: 0; width: 100%; justify-self: end; }
.cs-field[data-layout="complex"] { grid-template-columns: minmax(0, 1fr); align-items: start; gap: 10px; }
.cs-field[data-dirty="true"]::before { content: ''; position: absolute; left: -10px; top: 18px; bottom: 18px; width: 2px; border-radius: 2px; background: var(--dsw-alias-label-secondary); }
.cs-input, .cs-select { width: 100%; height: 36px; padding: 0 12px; border: .5px solid transparent; border-radius: var(--dsw-radius-md, 10px); background: var(--cs-control); color: var(--dsw-alias-label-primary); font-size: 14px; line-height: 22px; }
.cs-input:disabled, .cs-select:disabled, .cs-textarea:disabled { color: var(--dsw-alias-label-tertiary); cursor: default; }
.cs-field[data-kind="number"] > .cs-field-control { max-width: 104px; }
.cs-field[data-kind="number"] .cs-input { text-align: right; font-variant-numeric: tabular-nums; }
.cs-select-wrap { position: relative; width: 100%; }
.cs-select-wrap .cs-select { appearance: none; padding-right: 34px; }
.cs-select-wrap > .cs-icon { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); color: var(--dsw-alias-label-secondary); }
.cs-textarea { width: 100%; min-height: 120px; padding: 10px 12px; resize: vertical; border: .5px solid var(--dsw-alias-border-l3, var(--cs-stroke)); border-radius: var(--dsw-radius-md, 10px); background: var(--cs-control); color: var(--dsw-alias-label-primary); font-family: var(--cs-mono) !important; font-size: 12px; line-height: 20px; tab-size: 2; }
.cs-input[aria-invalid="true"], .cs-select[aria-invalid="true"], .cs-textarea[aria-invalid="true"], .cs-structured[aria-invalid="true"] { border-color: var(--dsw-alias-state-error-primary); }
.cs-hint { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 18px; overflow-wrap: anywhere; }
.cs-constraints, .cs-complex-hint { margin-top: 3px; color: var(--dsw-alias-label-tertiary); font-size: 11px; line-height: 18px; }
.cs-invalid { grid-column: 1 / -1; margin: 0; color: var(--dsw-alias-state-error-primary); font-size: 12px; line-height: 18px; }
.cs-switch-row { display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
.cs-switch-state { color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.cs-switch { position: relative; flex: none; width: 36px; height: 20px; padding: 2px; border: 0; border-radius: 999px; background: var(--dsw-alias-border-l3); cursor: pointer; }
.cs-switch[aria-checked="true"] { background: var(--dsw-alias-label-primary); }
.cs-switch-thumb { display: block; width: 16px; height: 16px; border-radius: 50%; background: var(--dsw-alias-label-primary); transition: transform .12s ease; }
.cs-switch[aria-checked="true"] .cs-switch-thumb { transform: translateX(16px); background: var(--dsw-alias-bg-layer-1); }
.cs-switch:disabled { opacity: .4; cursor: default; }
.cs-field-tools { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.cs-field-tools .cs-button { min-height: 26px; padding: 2px 8px; font-size: 12px; border-color: transparent; background: var(--cs-control); }
.cs-structured { display: flex; flex-direction: column; gap: 12px; min-width: 0; padding: 14px; border: .5px solid var(--cs-stroke); border-radius: var(--dsw-radius-lg, 12px); }
.cs-child { display: grid; grid-template-columns: minmax(0, 1fr) minmax(120px, 220px); align-items: center; gap: 6px 16px; font-size: 13px; }
.cs-child > .cs-switch { justify-self: end; }
.cs-child > .cs-hint { grid-column: 1 / -1; }
.cs-array-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
.cs-array-row .cs-input { flex: 1; min-width: 0; }
.cs-array-row .cs-button { min-height: 30px; padding: 3px 8px; font-size: 12px; border-color: transparent; }
.cs-history { color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 20px; border-top: .5px solid var(--dsw-alias-border-l2); padding-top: 14px; }
.cs-history summary { width: fit-content; cursor: pointer; }
.cs-history ul { list-style: none; padding: 0; margin: 10px 0 0; }
.cs-history li { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 8px 0; border-bottom: .5px solid var(--dsw-alias-border-l2); }
.cs-history li:last-child { border: 0; }
.cs-history time { font-variant-numeric: tabular-nums; color: var(--dsw-alias-label-tertiary); }
.cs-history .cs-button { margin-left: auto; min-height: 28px; padding: 3px 8px; font-size: 12px; }
.cs-footer { position: relative; z-index: 5; display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 4px; padding: 14px 0 4px; border-top: .5px solid var(--dsw-alias-border-l2); background: var(--cs-surface); }
.cs-footer[data-active="true"] { position: sticky; bottom: -1px; }
.cs-footer-status { flex: 1; min-width: 120px; margin: 0; color: var(--dsw-alias-label-tertiary); font-size: 12px; line-height: 18px; }
.cs-notice { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 10px 12px; border: .5px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-md, 10px); background: var(--cs-control); color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 20px; }
.cs-notice > span { flex: 1; min-width: 140px; }
.cs-notice[data-tone="error"], .cs-error-link { color: var(--dsw-alias-state-error-primary); }
.cs-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 42px 16px; border: .5px dashed var(--cs-stroke); border-radius: var(--dsw-radius-xl, 16px); text-align: center; color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 20px; }
.cs-empty .cs-icon { color: var(--dsw-alias-label-tertiary); }
.cs-modal-root { position: fixed; inset: 0; z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 24px; }
.cs-modal-mask { position: absolute; inset: 0; background: var(--dsw-alias-bg-mask-1, #0006); backdrop-filter: var(--dsw-mask-blur, none); }
.cs-modal { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 16px; width: min(640px, 100%); max-height: min(680px, calc(100dvh - 48px)); padding: 22px; border: .5px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-panel, 20px); background: var(--cs-surface); box-shadow: var(--dsw-elevation-prominent); overflow: hidden; }
.cs-modal-close { position: absolute; top: 17px; right: 17px; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; padding: 0; border: 0; border-radius: var(--dsw-radius-sm, 6px); background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; }
.cs-modal-title { margin: 0; padding-right: 30px; font-size: 16px; font-weight: 500; line-height: 24px; }
.cs-modal-note { margin: -8px 0 0; padding-right: 22px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 20px; }
.cs-modal-scroll { min-height: 0; overflow: auto; border: .5px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-md, 10px); }
.cs-modal-scroll:empty { display: none; }
.cs-modal-footer { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; }
.cs-diff { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 12px; line-height: 18px; }
.cs-diff th, .cs-diff td { text-align: left; vertical-align: top; padding: 12px; border-bottom: .5px solid var(--dsw-alias-border-l2); overflow-wrap: anywhere; }
.cs-diff th { font-weight: 500; }
.cs-diff thead th { background: var(--cs-control); color: var(--dsw-alias-label-secondary); font-size: 11px; }
.cs-diff tr:last-child > td, .cs-diff tbody tr:last-child > th { border-bottom: 0; }
.cs-diff pre { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; font-family: var(--cs-mono); font-size: 12px; line-height: 18px; }
.cs-diff small { display: block; margin-top: 6px; color: var(--dsw-alias-label-tertiary); font-size: 11px; line-height: 16px; }
.cs-diff td:last-child { background: color-mix(in srgb, var(--cs-control) 55%, transparent); }
.cs-button:focus-visible, .cs-seg:focus-visible, .cs-link:focus-visible, .cs-item:focus-visible, .cs-group-head:focus-visible, .cs-reset:focus-visible, .cs-switch:focus-visible, .cs-group-select:focus-visible, .cs-modal-close:focus-visible, .cs-search-clear:focus-visible, .cs-technical summary:focus-visible, .cs-history summary:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--cs-focus); outline-offset: 2px; }
.cs-input:focus-visible, .cs-select:focus-visible, .cs-textarea:focus-visible { outline: none; border-color: var(--cs-focus); box-shadow: 0 0 0 1px var(--cs-focus); }
@media (hover: hover) {
  .cs-button:not(:disabled):hover, .cs-search-clear:hover, .cs-modal-close:hover { background: var(--cs-hover); }
  .cs-button-primary:not(:disabled):hover { background: var(--dsw-alias-label-primary); opacity: .88; }
  .cs-item:hover { background: var(--cs-hover); border-color: var(--dsw-alias-border-l3, var(--cs-stroke)); }
  .cs-seg:hover, .cs-link:hover, .cs-reset:not(:disabled):hover { color: var(--dsw-alias-label-primary); }
  .cs-group-head:hover .cs-group-label { color: var(--dsw-alias-label-secondary); }
}
@container cs-groups (width < 480px) { .cs-list { grid-template-columns: minmax(0, 1fr); } }
@container cs-fields (width < 480px) {
  .cs-field { grid-template-columns: minmax(0, 1fr); align-items: start; gap: 10px; }
  .cs-field-control, .cs-field[data-kind="number"] > .cs-field-control { max-width: none; justify-self: stretch; }
  .cs-field[data-kind="number"] .cs-input { text-align: left; }
  .cs-switch-row { justify-content: space-between; }
  .cs-child { grid-template-columns: minmax(0, 1fr) minmax(100px, 45%); gap: 6px 12px; }
}
@media (max-width: 600px) {
  .cs-heading-line { flex-wrap: wrap; gap: 6px; }
  .cs-filters { gap: 16px; }
  .cs-modal-root { padding: 12px; }
  .cs-modal { padding: 18px; max-height: calc(100dvh - 24px); }
  .cs-modal-close { top: 13px; right: 13px; }
  .cs-footer-status { flex-basis: 100%; }
  .cs-footer .cs-button { flex: 1; }
  .cs-diff th, .cs-diff td { padding: 8px; }
}
@media (prefers-reduced-motion: reduce) { .cs-root *, .cs-root *::before, .cs-root *::after { transition: none !important; } }
`

    Object.assign(en, {
      subtitle: 'Find a setting, review its source, and preview changes before saving.',
      clearSearch: 'Clear search',
      resultCount: '{count} of {total} entries',
      on: 'On',
      off: 'Off',
      complexHint: 'Use the form or JSON. Values are validated before saving.',
      search: 'Search names, descriptions or fields',
      save: 'Review changes',
      reset: 'Use inherited value',
      diffNote:
        'Saving replaces the complete configuration for this plugin. Other existing inherited values are also pinned to their current values.',
      onlyModified: 'Modified',
      onlyErrors: 'Unavailable',
      recent: 'Recent',
      matches: '{count} matches',
      profile: 'Configuration: {name}',
      technical: 'Technical details',
      fieldSearch: 'Find a field in this plugin',
      'source.default': 'Default',
      'source.inherited': 'Inherited',
      'source.override': 'Custom',
      'source.overlay': 'Higher-priority setting',
      'source.unset': 'Not set',
      pending: '{count} pending changes',
      restoredDraft: 'Your unsaved draft was restored.',
      draftHint: 'Drafts stay in this window until saved or discarded.',
      leaveTitle: 'Keep this draft?',
      leaveNote: 'There are unsaved changes. You can keep them while browsing other settings.',
      keepLeave: 'Keep draft and return',
      discardLeave: 'Discard and return',
      continue: 'Keep editing',
      reloadTitle: 'Reload this configuration?',
      reloadNote: 'Your draft will be kept and compared with the latest configuration.',
      reloadKeep: 'Reload and keep draft',
      conflictTitle: 'The saved configuration changed',
      conflictBody: 'Your draft is preserved. Compare it with the latest values before saving again.',
      compare: 'Compare with latest',
      rebase: 'Keep my changes on this version',
      current: 'Latest saved value',
      proposed: 'My draft',
      before: 'Before',
      after: 'After',
      field: 'Setting',
      unset: 'Not set',
      resetOperation: 'Restore inheritance',
      setOperation: 'Custom value',
      timeout: 'The request timed out. Check the saved value before retrying a write.',
      cancelled: 'Request cancelled.',
      refreshFailed: 'The save completed, but the view could not refresh. Reload to check the saved value.',
      oversized: 'The result must fit within 64 KB. Shorten the value or restore an inherited value.',
      oversizedExisting:
        'This configuration exceeds 64 KB. You can shorten fields or restore them before saving.',
      expressionBlocked: 'Executable expressions are not accepted in this editor.',
      validation: 'The plugin rejected a field value. Check its type, range and required fields.',
      format: 'Format JSON',
      jsonMode: 'JSON',
      formMode: 'Form',
      addItem: 'Add item',
      removeItem: 'Remove item',
      history: 'Changes in this host session',
      undoSave: 'Undo last save',
      undoTitle: 'Undo the last save?',
      undoNote: 'Restore the fields changed by the last save. A concurrent edit will cancel this operation.',
      historyEmpty: 'No changes in this host session.',
      undone: 'Previous values restored.',
      firstError: 'Go to first error',
      requiredValue: 'This field is required.',
      itemType: 'The value has the wrong type.',
      pattern: 'Required format',
      range: 'Allowed range',
      length: 'Length',
      multiple: 'Step',
      busy: 'A save is in progress. Wait for the result.',
      resetTo: 'Will use: {value}',
      emptyFilter: 'No matches. Try another name or include all entries.',
      reload: 'Reload values',
    })
    Object.assign(zh, {
      subtitle: '查找设置、查看值的来源，并在保存前确认变更。',
      clearSearch: '清空搜索',
      resultCount: '{count} / {total} 项',
      on: '已开启',
      off: '已关闭',
      complexHint: '可使用表单或 JSON 编辑，保存前会校验字段值。',
      volatile: '即时更新',
      search: '搜索名称、说明或配置字段',
      save: '预览并保存',
      reset: '恢复继承值',
      diffNote: '保存会替换该插件的完整配置，其他已继承的设置也会固定为当前值。',
      onlyModified: '已修改',
      onlyErrors: '不可用',
      recent: '最近使用',
      matches: '匹配 {count} 项',
      profile: '当前配置：{name}',
      technical: '技术详情',
      fieldSearch: '在此插件中查找字段',
      'source.default': '默认值',
      'source.inherited': '继承值',
      'source.override': '自定义',
      'source.overlay': '上层配置',
      'source.unset': '未设置',
      pending: '{count} 项待保存',
      restoredDraft: '已恢复未保存的草稿。',
      draftHint: '草稿会保留在当前窗口，直到保存或放弃。',
      leaveTitle: '是否保留草稿？',
      leaveNote: '还有未保存的更改。返回列表时可以保留草稿，稍后继续编辑。',
      keepLeave: '保留草稿并返回',
      discardLeave: '放弃并返回',
      continue: '继续编辑',
      reloadTitle: '重新读取配置？',
      reloadNote: '将保留草稿，并与最新配置检查冲突。',
      reloadKeep: '保留草稿并读取',
      conflictTitle: '已保存的配置发生变化',
      conflictBody: '草稿已保留。请与最新值对比后再保存。',
      compare: '对比最新配置',
      rebase: '在此版本上保留我的修改',
      current: '最新保存值',
      proposed: '我的草稿',
      before: '修改前',
      after: '修改后',
      field: '设置项',
      unset: '未设置',
      resetOperation: '恢复继承',
      setOperation: '自定义值',
      timeout: '请求超时。再次提交前，请先重新读取以确认是否已经保存。',
      cancelled: '请求已取消。',
      refreshFailed: '保存已完成，但页面刷新失败。请重新读取确认已保存的值。',
      oversized: '保存后的配置不能超过 64 KB，请缩减内容或恢复继承值。',
      oversizedExisting: '当前配置超过 64 KB，可以缩减字段内容或恢复继承值后保存。',
      expressionBlocked: '此编辑器不接受可执行表达式。',
      validation: '插件拒绝了字段值，请检查类型、范围与必填项。',
      format: '格式化 JSON',
      jsonMode: 'JSON',
      formMode: '表单',
      addItem: '添加一项',
      removeItem: '移除该项',
      history: '本次运行的变更记录',
      undoSave: '撤销上次保存',
      undoTitle: '撤销上次保存？',
      undoNote: '恢复上次保存所修改的字段。如配置已被其他操作修改，此次撤销会被取消。',
      historyEmpty: '本次运行还没有变更记录。',
      undone: '已恢复之前的值。',
      firstError: '定位首个错误',
      requiredValue: '此字段为必填项。',
      itemType: '值的类型不正确。',
      pattern: '格式要求',
      range: '允许范围',
      length: '长度',
      multiple: '步长',
      busy: '正在保存，请等待结果。',
      resetTo: '将使用：{value}',
      emptyFilter: '没有匹配项，可更换搜索词或切换到全部条目。',
      reload: '重新读取',
    })

    const entryNames = {
      'subagent-model-selection-settings': ['Subagent model selection', '子智能体模型选择'],
      'agent-loop': ['Agent loop', 'Agent 循环'],
      'agent-preset-registry': ['Agent preset registry', 'Agent 预设注册表'],
      goal: ['Goals', '目标管理'],
      'ui-theme': ['Theme & typography', '主题与字体'],
      'agent-default-model': ['Default model', '默认模型'],
      'ui-settings-models': ['Model settings', '模型设置'],
      'ui-settings-general': ['General settings', '通用设置'],
      'ui-settings': ['Settings interface', '设置界面'],
      'ui-chat': ['Chat interface', '聊天界面'],
      'llm-deepseek': ['DeepSeek API models', 'DeepSeek API 模型'],
      'llm-deepseek-account': ['DeepSeek account models', 'DeepSeek 账号模型'],
      'llm-pi-ai': ['Additional model providers', '其他模型服务'],
      'dsh-context': ['Context insights', '上下文洞察'],
      'config-studio': ['Plugin configuration', '插件配置'],
      'system-prompt': ['System prompt', '系统提示词'],
      'web-fetch-http': ['Web fetch', '网页读取'],
      'web-search-deepseek': ['Web search', '联网搜索'],
      credentials: ['Credentials', '凭据管理'],
      'session-title': ['Session titles', '会话标题'],
      'ui-plugin-manager': ['Plugin manager interface', '插件管理界面'],
      'plugin-manager': ['Plugin management', '插件管理'],
      'review-tools': ['Tools & structured settings', '工具与结构化设置'],
      'credentials-demo': ['Credential protection', '凭据保护'],
    }
    const fieldNames = {
      enabled: '启用',
      preference: '主题模式',
      fontSize: '正文字号',
      codeFontSize: '代码字号',
      terminalFontSize: '终端字号',
      textFontFamily: '正文字体',
      codeFontFamily: '代码字体',
      terminalFontFamily: '终端字体',
      provider: '模型服务',
      model: '模型',
      reasoningEffort: '推理强度',
      credentialOnboarding: '凭据配置引导',
      timeout: '超时时间',
      maxTokens: '最大令牌数',
      maxOutputTokens: '最大输出令牌数',
      baseURL: '服务地址',
      baseUrl: '服务地址',
      apiKey: 'API 密钥',
      token: '令牌',
      retries: '重试次数',
      rules: '规则',
      paths: '目录列表',
      options: '高级选项',
      note: '备注',
      label: '名称',
      accounts: '账号列表',
      tuple: '凭据组合',
      registryProbeEnabled: '检测插件源',
      maxRequestSteps: '最大请求步骤',
      maxKeptTurns: '保留对话轮数',
      maxEvents: '最大事件数',
      maxNodes: '最大节点数',
      maxArchiveNodes: '最大归档节点数',
      maxFileOps: '最大文件操作数',
      maxCommands: '最大命令数',
      maxCommandChars: '命令长度上限',
      defaultPlacement: '默认显示位置',
      defaultGranularity: '默认统计粒度',
      defaultTrendMode: '默认趋势模式',
      defaultDeltaBase: '默认对比基准',
      defaultToolSort: '工具排序',
      defaultFileSort: '文件排序',
      insightsEntry: '洞察入口',
      defaultDurationCurve: '默认时长曲线',
      overviewAutoSteps: '概览自动步数',
      defaultOverviewRange: '默认概览范围',
      fleetTab: '编队标签页',
      promptPrefix: '提示词前缀',
      promptSuffix: '提示词后缀',
    }
    const isZh = (locale) =>
      String(locale ?? '')
        .toLowerCase()
        .startsWith('zh')
    const humanize = (key) => key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ')
    const fieldLabel = (field, locale) =>
      isZh(locale) && fieldNames[field.key] ? fieldNames[field.key] : (field.label ?? humanize(field.key))
    const entryLabel = (entry, locale) => entryNames[entry.id]?.[isZh(locale) ? 1 : 0] ?? entry.id
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
    const draftCache = new Map()
    const recentEntries = new Set()
    const browse = { query: '', scope: 'editable', groupBy: 'function', collapsed: new Set() }

    function describe(field, locale) {
      const map = field.descriptions
      if (map && typeof map === 'object') {
        const language = String(locale ?? 'en').toLowerCase()
        for (const key of [language, language.split('-')[0], 'en', ''])
          if (typeof map[key] === 'string') return map[key]
        return Object.values(map).find((value) => typeof value === 'string')
      }
      return field.description
    }
    function apiUrl(path) {
      if (typeof location === 'undefined' || location.protocol !== 'file:') return path
      try {
        return new URL(path, globalThis.__DSH_TRANSPORT__?.streamBaseUrl).toString()
      } catch {
        return path
      }
    }
    async function call(endpoint, body, signal) {
      const controller = new AbortController()
      const abort = () => controller.abort()
      signal?.addEventListener('abort', abort, { once: true })
      if (signal?.aborted) controller.abort()
      let timedOut = false
      const timer = setTimeout(
        () => {
          timedOut = true
          controller.abort()
        },
        endpoint === 'write' ? 45000 : 15000,
      )
      try {
        const response = await fetch(apiUrl(`/api/config-studio/${endpoint}`), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(body ?? {}),
          signal: controller.signal,
        })
        if ([401, 403].includes(response.status)) throw Object.assign(new Error(), { code: 'unauthorized' })
        if (!response.ok) throw Object.assign(new Error(), { code: 'network' })
        const payload = await response.json()
        if (!payload || payload.ok !== true)
          throw Object.assign(new Error(payload?.error?.message), payload?.error ?? { code: 'protocol' })
        return payload
      } catch (error) {
        if (error.name === 'AbortError')
          throw Object.assign(new Error(), { code: timedOut ? 'timeout' : 'cancelled' })
        if (!error.code) error.code = 'network'
        throw error
      } finally {
        clearTimeout(timer)
        signal?.removeEventListener('abort', abort)
      }
    }
    function errorText(t, error) {
      const keys = {
        network: 'hintNetwork',
        unauthorized: 'hintUnauthorized',
        timeout: 'timeout',
        cancelled: 'cancelled',
        conflict: 'conflictBody',
        validation: 'validation',
        expression: 'expressionBlocked',
        oversized: 'oversized',
        readonly: 'readonlyChange',
        stale: 'staleEntry',
        overridden: 'overriddenByLayer',
      }
      return t(keys[error?.code] ?? 'errorGeneric')
    }
    function containsExpression(value) {
      if (!value || typeof value !== 'object') return false
      if (!Array.isArray(value) && Object.keys(value).length === 1 && typeof value.__jsExpr === 'string')
        return true
      return Object.values(value).some(containsExpression)
    }
    function checkValue(shape, value) {
      if (value === undefined || value === null) return shape.required ? 'requiredValue' : undefined
      if (shape.alternatives?.length)
        return shape.alternatives.some((child) => !checkValue(child, value)) ? undefined : 'itemType'
      if (shape.kind === 'number') {
        if (typeof value !== 'number' || !Number.isFinite(value)) return 'invalidNumber'
        if (shape.integer && !Number.isInteger(value)) return 'invalidInteger'
        if (
          (typeof shape.minimum === 'number' && value < shape.minimum) ||
          (typeof shape.maximum === 'number' && value > shape.maximum)
        )
          return 'outOfRange'
        if (
          shape.multipleOf &&
          Math.abs(value / shape.multipleOf - Math.round(value / shape.multipleOf)) > 1e-8
        )
          return 'outOfRange'
      } else if (shape.kind === 'string') {
        if (typeof value !== 'string') return 'itemType'
        if (
          (shape.minLength !== undefined && value.length < shape.minLength) ||
          (shape.maxLength !== undefined && value.length > shape.maxLength)
        )
          return 'outOfRange'
        try {
          if (shape.pattern && !new RegExp(shape.pattern, shape.patternFlags).test(value))
            return 'invalidPattern'
        } catch {}
      } else if (shape.kind === 'boolean' && typeof value !== 'boolean') return 'itemType'
      else if (shape.kind === 'enum' && !shape.options?.some((option) => same(option.value, value)))
        return 'itemType'
      else if (shape.kind === 'array') {
        if (!Array.isArray(value)) return 'itemType'
        if (
          (shape.minItems !== undefined && value.length < shape.minItems) ||
          (shape.maxItems !== undefined && value.length > shape.maxItems)
        )
          return 'outOfRange'
        if (shape.items)
          for (const item of value) {
            const error = checkValue(shape.items, item)
            if (error) return error
          }
      } else if (shape.kind === 'object') {
        if (typeof value !== 'object' || Array.isArray(value)) return 'itemType'
        for (const [key, child] of Object.entries(shape.properties ?? {})) {
          const error = checkValue(child, value[key] ?? child.default)
          if (error) return error
        }
      }
    }
    function formatText(field, value) {
      if (value === undefined) return ''
      return ['json', 'object', 'array', 'enum'].includes(field.kind)
        ? JSON.stringify(value, null, field.kind === 'enum' ? 0 : 2)
        : String(value)
    }
    function optionLabel(field, option, locale) {
      if (field.key === 'preference') {
        const names = { system: ['System', '跟随系统'], light: ['Light', '浅色'], dark: ['Dark', '深色'] }
        return names[option.value]?.[isZh(locale) ? 1 : 0] ?? option.label
      }
      return option.label
    }
    function parseField(field, text) {
      let value
      if (field.kind === 'enum') {
        if (text === '') return { kind: 'clear' }
        const option = field.options?.find((option) => JSON.stringify(option.value) === text)
        if (!option) return { error: 'itemType' }
        value = option.value
      } else if (field.kind === 'number') {
        if (!text.trim()) return { kind: 'clear' }
        value = Number(text)
      } else if (['json', 'object', 'array'].includes(field.kind)) {
        if (!text.trim()) return { kind: 'clear' }
        try {
          value = JSON.parse(text)
        } catch {
          return { error: 'invalidJson' }
        }
        if (containsExpression(value)) return { error: 'expressionBlocked' }
      } else value = text
      const error = checkValue(field, value)
      return error ? { error } : { kind: 'set', value }
    }
    function collectChanges(fields, drafts) {
      const changes = [],
        errors = {}
      for (const field of fields) {
        const draft = drafts[field.key]
        if (!draft || field.readonly) continue
        const before = field.value
        const base = { key: field.key, before, beforeSource: field.source, field }
        if (draft.reset) {
          changes.push({ ...base, reset: true, after: field.inherited, afterSource: field.resetSource })
          continue
        }
        if (field.kind === 'boolean') {
          if (draft.boolean !== field.value)
            changes.push({ ...base, value: draft.boolean, after: draft.boolean, afterSource: 'override' })
          continue
        }
        const parsed = parseField(field, draft.text ?? '')
        if (parsed.error) {
          errors[field.key] = parsed.error
          continue
        }
        if (parsed.kind === 'clear')
          changes.push({ ...base, reset: true, after: field.inherited, afterSource: field.resetSource })
        else if (!same(parsed.value, field.value))
          changes.push({ ...base, value: parsed.value, after: parsed.value, afterSource: 'override' })
      }
      return { changes, errors }
    }
    function displayValue(value, t) {
      return value === undefined ? t('unset') : JSON.stringify(value, null, 2)
    }
    function icon(name, size = 16, className = '') {
      const paths = {
        search: 'M17 17l4 4M17.5 10.5a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
        refresh: 'M21 12a9 9 0 1 1-3-6.7M21 3v6h-6',
        back: 'M19 12H5m6-6-6 6 6 6',
        close: 'm6 6 12 12M6 18 18 6',
        'chevron-right': 'm9 5 7 7-7 7',
        'chevron-down': 'm6 9 6 6 6-6',
      }
      return h('svg', {
        className: `cs-icon ${className}`,
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.65,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        focusable: false,
        children: h('path', { d: paths[name] ?? paths['chevron-right'] }),
      })
    }
    function button(tkey, t, onClick, extra = {}) {
      const { iconOnly = false, icon: chosenIcon, ...props } = extra
      const symbol = chosenIcon ?? { back: 'back', refresh: 'refresh', reload: 'refresh' }[tkey]
      return h('button', {
        type: 'button',
        className: 'cs-button',
        onClick,
        ...(iconOnly ? { 'aria-label': t(tkey), title: t(tkey) } : {}),
        ...props,
        children: [symbol ? icon(symbol) : null, iconOnly ? null : t(tkey)],
      })
    }
    function SearchBox({ t, label, value, onChange, disabled = false }) {
      return h('div', {
        className: 'cs-search-box',
        children: [
          icon('search', 17),
          h('input', {
            className: 'cs-search',
            type: 'search',
            'aria-label': label,
            placeholder: label,
            value,
            disabled,
            onChange: (event) => onChange(event.target.value),
          }),
          value
            ? h('button', {
                type: 'button',
                className: 'cs-search-clear',
                'aria-label': t('clearSearch'),
                title: t('clearSearch'),
                disabled,
                onClick: () => onChange(''),
                children: icon('close', 14),
              })
            : null,
        ],
      })
    }
    function ProfileBadge({ t, profile }) {
      return profile
        ? h('span', {
            className: 'cs-profile',
            'aria-label': t('profile', { name: profile.name }),
            title: t('profile', { name: profile.name }),
            children: profile.name,
          })
        : null
    }
    function Notice({ t, text, tone = 'info', children }) {
      return h('div', {
        className: 'cs-notice',
        'data-tone': tone,
        role: tone === 'error' ? 'alert' : 'status',
        children: [h('span', { children: text }), children],
      })
    }

    /** Trap keyboard and pointer focus without depending on a host dialog implementation. */
    function Modal(props) {
      const ref = React.useRef(null),
        latest = React.useRef(props)
      latest.current = props
      React.useEffect(() => {
        const dialog = ref.current
        const previous = document.activeElement
        const inert = []
        let branch = dialog.parentElement
        while (branch?.parentElement && branch !== document.body) {
          for (const sibling of branch.parentElement.children)
            if (sibling !== branch && sibling instanceof HTMLElement) {
              inert.push([sibling, sibling.inert])
              sibling.inert = true
            }
          branch = branch.parentElement
        }
        const focusable = () =>
          [
            ...dialog.querySelectorAll(
              'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
            ),
          ].filter((el) => !el.hidden)
        const focus = () => (focusable()[0] ?? dialog).focus()
        const onKey = (event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            event.stopImmediatePropagation()
            if (!latest.current.busy) latest.current.onCancel?.()
            return
          }
          if (event.key !== 'Tab') return
          event.stopImmediatePropagation()
          const all = focusable(),
            index = all.indexOf(document.activeElement)
          if (!all.length) {
            event.preventDefault()
            dialog.focus()
          } else if (event.shiftKey && index <= 0) {
            event.preventDefault()
            all.at(-1).focus()
          } else if (!event.shiftKey && (index === all.length - 1 || index < 0)) {
            event.preventDefault()
            all[0].focus()
          }
        }
        const onFocus = (event) => {
          if (!dialog.contains(event.target)) focus()
        }
        document.addEventListener('keydown', onKey, true)
        document.addEventListener('focusin', onFocus, true)
        focus()
        return () => {
          document.removeEventListener('keydown', onKey, true)
          document.removeEventListener('focusin', onFocus, true)
          inert.forEach(([el, old]) => {
            el.inert = old
          })
          if (previous?.isConnected) previous.focus()
        }
      }, [])
      return h('div', {
        className: 'cs-modal-root',
        children: [
          h('div', {
            className: 'cs-modal-mask',
            'aria-hidden': true,
            onClick: () => {
              if (!props.busy) props.onCancel?.()
            },
          }),
          h('div', {
            className: 'cs-modal',
            role: 'dialog',
            'aria-modal': true,
            'aria-label': props.title,
            tabIndex: -1,
            ref,
            children: [
              h('button', {
                type: 'button',
                className: 'cs-modal-close',
                'aria-label': props.t?.('close') ?? props.closeLabel ?? 'Close',
                disabled: props.busy,
                onClick: props.onCancel,
                children: icon('close', 18),
              }),
              h('h2', { className: 'cs-modal-title', children: props.title }),
              props.note ? h('p', { className: 'cs-modal-note', children: props.note }) : null,
              h('div', { className: 'cs-modal-scroll', children: props.children }),
              h('div', { className: 'cs-modal-footer', children: props.actions }),
            ],
          }),
        ],
      })
    }
    function DiffTable({ changes, t, locale, comparing = false }) {
      return h('table', {
        className: 'cs-diff',
        children: [
          h('thead', {
            children: h('tr', {
              children: ['field', comparing ? 'current' : 'before', comparing ? 'proposed' : 'after'].map(
                (key) => h('th', { scope: 'col', children: t(key) }, key),
              ),
            }),
          }),
          h('tbody', {
            children: changes.map((change) =>
              h(
                'tr',
                {
                  children: [
                    h('th', {
                      scope: 'row',
                      children: [fieldLabel(change.field, locale), h('small', { children: change.key })],
                    }),
                    h('td', {
                      children: [
                        h('pre', { children: displayValue(change.before, t) }),
                        h('small', { children: t(`source.${change.beforeSource ?? 'unset'}`) }),
                      ],
                    }),
                    h('td', {
                      children: [
                        h('pre', { children: displayValue(change.after, t) }),
                        h('small', {
                          children:
                            t(change.reset ? 'resetOperation' : 'setOperation') +
                            ' · ' +
                            t(`source.${change.afterSource ?? 'override'}`),
                        }),
                      ],
                    }),
                  ],
                },
                change.key,
              ),
            ),
          }),
        ],
      })
    }
    function DiffModal({ t, changes, locale, onCancel, onConfirm, busy }) {
      return h(Modal, {
        closeLabel: t('close'),
        title: t('diffTitle'),
        note: t('diffNote'),
        onCancel,
        busy,
        actions: [
          button('diffCancel', t, onCancel, { disabled: busy }),
          button(busy ? 'saving' : 'diffApply', t, onConfirm, {
            className: 'cs-button cs-button-primary',
            disabled: busy || !changes.length,
          }),
        ],
        children: h(DiffTable, { changes, t, locale }),
      })
    }

    function ComplexEditor({ field, text, onChange, disabled, t, locale, id, invalid, describedBy }) {
      let value
      try {
        value = JSON.parse(text)
      } catch {}
      const scalar = (shape) =>
        ['string', 'number', 'boolean', 'enum'].includes(shape?.kind) && !shape.alternatives
      const structured =
        (field.kind === 'object' && field.properties && Object.values(field.properties).every(scalar)) ||
        (field.kind === 'array' && scalar(field.items))
      const [mode, setMode] = React.useState(structured ? 'form' : 'json')
      const available =
        structured &&
        (field.kind === 'array'
          ? Array.isArray(value)
          : value && typeof value === 'object' && !Array.isArray(value))
      const update = (value) => onChange({ text: JSON.stringify(value, null, 2) })
      const input = (shape, current, key, set) => {
        const label = fieldLabel({ key, label: humanize(key) }, locale)
        if (shape.kind === 'boolean')
          return h('button', {
            type: 'button',
            className: 'cs-switch',
            role: 'switch',
            'aria-label': label,
            'aria-checked': (current ?? shape.default) === true,
            disabled,
            onClick: () => set(!((current ?? shape.default) === true)),
            children: h('span', { className: 'cs-switch-thumb' }),
          })
        if (shape.kind === 'enum')
          return h('select', {
            className: 'cs-select',
            'aria-label': label,
            disabled,
            value: JSON.stringify(current ?? shape.default) ?? '',
            onChange: (event) => set(JSON.parse(event.target.value)),
            children: (shape.options ?? []).map((option) =>
              h(
                'option',
                { value: JSON.stringify(option.value), children: option.label },
                JSON.stringify(option.value),
              ),
            ),
          })
        return h('input', {
          className: 'cs-input',
          'aria-label': label,
          disabled,
          type: 'text',
          inputMode: shape.kind === 'number' ? 'decimal' : undefined,
          value: current ?? shape.default ?? '',
          onChange: (event) => {
            const raw = event.target.value
            set(
              shape.kind === 'number' && raw.trim() !== '' && Number.isFinite(Number(raw))
                ? Number(raw)
                : raw,
            )
          },
        })
      }
      return h('div', {
        children: [
          h('div', {
            className: 'cs-field-tools',
            children: [
              structured
                ? button(
                    mode === 'form' ? 'jsonMode' : 'formMode',
                    t,
                    () => setMode(mode === 'form' ? 'json' : 'form'),
                    { disabled },
                  )
                : null,
              button('format', t, () => update(value), { disabled: disabled || value === undefined }),
            ],
          }),
          mode === 'form' && available
            ? h('div', {
                id,
                className: 'cs-structured',
                'aria-describedby': describedBy,
                'aria-invalid': invalid,
                children:
                  field.kind === 'object'
                    ? Object.entries(field.properties).map(([key, shape]) =>
                        h(
                          'div',
                          {
                            className: 'cs-child',
                            children: [
                              h('span', {
                                children:
                                  fieldLabel({ key, label: humanize(key) }, locale) +
                                  (shape.required ? ' *' : ''),
                              }),
                              input(shape, value[key], key, (next) => update({ ...value, [key]: next })),
                              describe(shape, locale)
                                ? h('span', { className: 'cs-hint', children: describe(shape, locale) })
                                : null,
                            ],
                          },
                          key,
                        ),
                      )
                    : [
                        ...value.map((item, index) =>
                          h(
                            'div',
                            {
                              className: 'cs-array-row',
                              children: [
                                input(
                                  field.items,
                                  item,
                                  `${fieldLabel(field, locale)} ${index + 1}`,
                                  (next) => update(value.map((old, i) => (i === index ? next : old))),
                                ),
                                button('removeItem', t, () => update(value.filter((_, i) => i !== index)), {
                                  disabled,
                                  'aria-label': `${t('removeItem')} ${index + 1}`,
                                }),
                              ],
                            },
                            index,
                          ),
                        ),
                        button(
                          'addItem',
                          t,
                          () =>
                            update([
                              ...value,
                              field.items.default ??
                                (field.items.kind === 'number'
                                  ? 0
                                  : field.items.kind === 'boolean'
                                    ? false
                                    : (field.items.options?.[0]?.value ?? '')),
                            ]),
                          {
                            disabled:
                              disabled || (field.maxItems !== undefined && value.length >= field.maxItems),
                          },
                        ),
                      ],
              })
            : h('textarea', {
                id,
                className: 'cs-textarea',
                spellCheck: false,
                value: text,
                disabled,
                'aria-invalid': invalid,
                'aria-describedby': describedBy,
                'aria-label': fieldLabel(field, locale),
                onChange: (event) => onChange({ text: event.target.value }),
              }),
        ],
      })
    }

    function FieldRow({ t, field, draft, onChange, locale, disabled: busy, error: serverError }) {
      const reset = draft?.reset === true,
        disabled = field.readonly || reset || busy
      const value = reset ? field.inherited : field.value
      const text = reset ? formatText(field, value) : (draft?.text ?? formatText(field, value))
      const id = `cs-field-${encodeURIComponent(field.key)}`
      let error = serverError
      if (!error && !field.readonly && !reset && draft && field.kind !== 'boolean')
        error = parseField(field, text).error
      const errorId = id + '-error',
        hintId = id + '-hint'
      const description = describe(field, locale)
      const constraints = []
      if (field.minimum !== undefined || field.maximum !== undefined)
        constraints.push(`${t('range')}: ${field.minimum ?? '−∞'} – ${field.maximum ?? '∞'}`)
      if (field.minLength !== undefined || field.maxLength !== undefined)
        constraints.push(`${t('length')}: ${field.minLength ?? 0} – ${field.maxLength ?? '∞'}`)
      if (field.multipleOf) constraints.push(`${t('multiple')}: ${field.multipleOf}`)
      if (field.pattern) constraints.push(`${t('pattern')}: /${field.pattern}/${field.patternFlags ?? ''}`)
      const common = {
        id,
        disabled,
        'aria-label': fieldLabel(field, locale),
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': [hintId, error ? errorId : null].filter(Boolean).join(' '),
      }
      let control
      if (field.readonly)
        control = h('input', {
          ...common,
          className: 'cs-input',
          type: 'text',
          readOnly: true,
          value: field.expression
            ? '!!js'
            : field.configured
              ? '••••••'
              : field.value === undefined
                ? ''
                : formatText(field, field.value),
        })
      else if (field.kind === 'boolean') {
        const checked = reset ? field.inherited === true : (draft?.boolean ?? field.value === true)
        control = h('div', {
          className: 'cs-switch-row',
          children: [
            h('span', { className: 'cs-switch-state', children: t(checked ? 'on' : 'off') }),
            h('button', {
              ...common,
              type: 'button',
              role: 'switch',
              'aria-checked': checked,
              'aria-label': fieldLabel(field, locale),
              className: 'cs-switch',
              onClick: () => onChange({ boolean: !checked }),
              children: h('span', { className: 'cs-switch-thumb' }),
            }),
          ],
        })
      } else if (field.kind === 'enum')
        control = h('select', {
          ...common,
          className: 'cs-select',
          value: text,
          onChange: (event) => onChange({ text: event.target.value }),
          children: [
            h('option', { value: '', children: t('source.unset') }),
            ...(field.options ?? []).map((option) =>
              h(
                'option',
                { value: JSON.stringify(option.value), children: optionLabel(field, option, locale) },
                JSON.stringify(option.value),
              ),
            ),
          ],
        })
      else if (['json', 'object', 'array'].includes(field.kind))
        control = h(ComplexEditor, {
          field,
          text,
          onChange,
          disabled,
          t,
          locale,
          id,
          invalid: common['aria-invalid'],
          describedBy: common['aria-describedby'],
        })
      else
        control = h('input', {
          ...common,
          className: 'cs-input',
          type: 'text',
          inputMode: field.kind === 'number' ? 'decimal' : undefined,
          value: text,
          onChange: (event) => onChange({ text: event.target.value }),
        })
      const complex = !field.readonly && ['json', 'object', 'array'].includes(field.kind)
      if (field.kind === 'enum' && !field.readonly) {
        control = h('div', { className: 'cs-select-wrap', children: [control, icon('chevron-down', 15)] })
      }
      return h('div', {
        className: 'cs-field',
        'data-dirty': draft ? 'true' : 'false',
        'data-field': field.key,
        'data-kind': field.kind,
        'data-layout': complex ? 'complex' : 'scalar',
        children: [
          h('div', {
            className: 'cs-field-copy',
            children: [
              h('div', {
                className: 'cs-field-head',
                children: [
                  h('label', {
                    className: 'cs-field-label',
                    htmlFor: id,
                    title: field.key,
                    children: fieldLabel(field, locale),
                  }),
                  field.required
                    ? h('span', { className: 'cs-field-required', children: t('required') })
                    : null,
                  h('span', {
                    className: 'cs-field-source',
                    children: t(
                      field.readonly
                        ? 'readonlyBadge'
                        : `source.${reset ? field.resetSource : (field.source ?? 'unset')}`,
                    ),
                  }),
                  field.volatile ? h('span', { className: 'cs-field-live', children: t('volatile') }) : null,
                ],
              }),
              h('div', {
                id: hintId,
                className: 'cs-hint',
                children: [
                  field.readonly ? t(`reason.${field.reason}`) : description,
                  constraints.length
                    ? h('div', { className: 'cs-constraints', children: constraints.join(' · ') })
                    : null,
                  complex ? h('div', { className: 'cs-complex-hint', children: t('complexHint') }) : null,
                  reset
                    ? h('div', { children: t('resetTo', { value: displayValue(field.inherited, t) }) })
                    : null,
                ],
              }),
              !field.readonly && (field.source === 'override' || field.source === 'overlay' || draft)
                ? h('div', {
                    className: 'cs-field-actions',
                    children: button(
                      reset ? 'undoReset' : 'reset',
                      t,
                      () => onChange(reset ? undefined : { reset: true }),
                      { className: 'cs-reset', disabled: busy },
                    ),
                  })
                : null,
            ],
          }),
          h('div', { className: 'cs-field-control', children: control }),
          error ? h('p', { id: errorId, className: 'cs-invalid', role: 'alert', children: t(error) }) : null,
        ],
      })
    }

    function DetailView({ t, entryId, onBack, onApplied, locale, profile, initialQuery = '' }) {
      const [snapshot, setSnapshot] = React.useState(null),
        [status, setStatus] = React.useState('loading')
      const [drafts, setDrafts] = React.useState({}),
        [notice, setNotice] = React.useState(null)
      const [saving, setSaving] = React.useState(false),
        [conflict, setConflict] = React.useState(false)
      const [modal, setModal] = React.useState(null),
        [query, setQuery] = React.useState(initialQuery),
        [serverErrors, setServerErrors] = React.useState({})
      const requests = React.useRef({ generation: 0, controller: null }),
        savingRef = React.useRef(false)
      const state = React.useRef({ snapshot: null, drafts: {} })
      state.current = { snapshot, drafts }
      const cacheKey = `${profile?.key ?? 'active'}:${entryId}`
      function cache(next, revision = snapshot?.revision) {
        if (Object.keys(next).length) draftCache.set(cacheKey, { drafts: next, revision })
        else draftCache.delete(cacheKey)
      }
      async function readFresh(preserve = true, afterSave = false) {
        const generation = ++requests.current.generation
        requests.current.controller?.abort()
        const controller = new AbortController()
        requests.current.controller = controller
        setStatus('loading')
        try {
          const fresh = await call('read', { id: entryId }, controller.signal)
          if (generation !== requests.current.generation) return
          const cached = preserve ? draftCache.get(cacheKey) : undefined
          const allowed = new Set(fresh.fields.filter((field) => !field.readonly).map((field) => field.key))
          const restored = Object.fromEntries(
            Object.entries(cached?.drafts ?? {}).filter(([key]) => allowed.has(key)),
          )
          const hasDraft = Object.keys(restored).length > 0
          setSnapshot(fresh)
          setDrafts(restored)
          setConflict(hasDraft && cached.revision !== fresh.revision)
          setServerErrors({})
          setStatus('ready')
          if (hasDraft) setNotice({ tone: 'info', text: t('restoredDraft') })
          else {
            draftCache.delete(cacheKey)
            if (!afterSave) setNotice(null)
          }
        } catch (error) {
          if (generation !== requests.current.generation || error.code === 'cancelled') return
          setStatus('error')
          setNotice({ tone: 'error', text: afterSave ? t('refreshFailed') : errorText(t, error) })
        }
      }
      React.useEffect(() => {
        readFresh(true)
        return () => {
          ++requests.current.generation
          requests.current.controller?.abort()
        }
      }, [entryId, cacheKey])
      const fields = snapshot?.fields ?? []
      const { changes, errors } = React.useMemo(() => collectChanges(fields, drafts), [fields, drafts])
      const allErrors = { ...errors, ...serverErrors },
        invalidCount = Object.keys(allErrors).length
      const hasDraft = Object.keys(drafts).length > 0
      const canSave =
        changes.length > 0 &&
        !invalidCount &&
        !saving &&
        !conflict &&
        status === 'ready' &&
        !snapshot?.readonly
      function setDraft(key, draft) {
        const next = { ...state.current.drafts }
        if (draft === undefined) delete next[key]
        else next[key] = draft
        state.current.drafts = next
        setDrafts(next)
        cache(next, draftCache.get(cacheKey)?.revision ?? snapshot?.revision)
        setServerErrors({})
        setNotice(null)
      }
      function discard() {
        setDrafts({})
        state.current.drafts = {}
        cache({})
        setServerErrors({})
        setConflict(false)
        setNotice(null)
      }
      async function submit(undo) {
        if (savingRef.current || (!undo && !canSave)) return
        savingRef.current = true
        setSaving(true)
        setNotice(null)
        try {
          const payload = undo
            ? { undo }
            : {
                changes: changes.map((change) =>
                  change.reset ? { key: change.key, reset: true } : { key: change.key, value: change.value },
                ),
              }
          const result = await call('write', { id: entryId, expectedRevision: snapshot.revision, ...payload })
          discard()
          setNotice({
            tone: 'info',
            text: t(undo ? 'undone' : result.restoredDefault ? 'appliedRestore' : 'applied'),
          })
          onApplied?.()
          setModal(null)
          await readFresh(false, true)
        } catch (error) {
          if (error.code === 'conflict' || error.code === 'stale' || error.code === 'timeout') {
            if (hasDraft) cache(drafts, snapshot.revision)
            await readFresh(true)
            setConflict(!undo && hasDraft)
          }
          if (error.path) setServerErrors({ [error.path]: 'validation' })
          setNotice(
            error.code === 'conflict' && hasDraft ? null : { tone: 'error', text: errorText(t, error) },
          )
        } finally {
          savingRef.current = false
          setSaving(false)
          setModal(null)
        }
      }
      function focusError() {
        setQuery('')
        requestAnimationFrame(() => {
          const target = document.getElementById(`cs-field-${encodeURIComponent(Object.keys(allErrors)[0])}`)
          target?.scrollIntoView({ block: 'center' })
          ;(target?.matches('input,select,textarea,button')
            ? target
            : target?.querySelector('input,select,textarea,button')
          )?.focus()
        })
      }
      const back = () => {
        if (!saving) hasDraft ? setModal('leave') : onBack()
      }
      const visible = fields.filter((field) =>
        `${field.key} ${fieldLabel(field, locale)} ${describe(field, locale) ?? ''}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      )
      if (!snapshot)
        return h('div', {
          className: 'cs-root',
          children: [
            button('back', t, back),
            notice
              ? h(Notice, { text: notice.text, tone: notice.tone })
              : h('p', { className: 'cs-hint', role: 'status', children: t('loading') }),
            status === 'error' ? button('retry', t, () => readFresh(true)) : null,
          ],
        })
      return h('div', {
        className: 'cs-root',
        children: [
          h('div', {
            className: 'cs-detail-head',
            children: [
              button('back', t, back, {
                className: 'cs-button cs-button-quiet cs-back',
                disabled: saving,
              }),
              h('div', {
                className: 'cs-heading-line',
                children: [
                  h('h1', { className: 'cs-title', children: entryLabel(snapshot, locale) }),
                  h(ProfileBadge, { t, profile: snapshot.profile ?? profile }),
                ],
              }),
              h('details', {
                className: 'cs-technical',
                children: [
                  h('summary', { children: t('technical') }),
                  h('div', { children: snapshot.id }),
                  h('div', { children: snapshot.name }),
                  h('div', { children: snapshot.profile?.path }),
                  h('div', { children: fields.map((field) => field.key).join(' · ') }),
                ],
              }),
              h('div', {
                className: 'cs-detail-actions',
                children: [
                  h('span', {
                    className: 'cs-stats',
                    children: t('fieldCount', { fields: String(fields.length) }),
                  }),
                  button('reload', t, () => (hasDraft ? setModal('reload') : readFresh(true)), {
                    disabled: saving || status === 'loading',
                  }),
                ],
              }),
            ],
          }),
          notice
            ? h(Notice, {
                text: notice.text,
                tone: notice.tone,
                children: status === 'error' ? button('retry', t, () => readFresh(true)) : null,
              })
            : null,
          snapshot.readonly ? h(Notice, { text: t(`reason.${snapshot.readonly.code}`) }) : null,
          snapshot.oversized ? h(Notice, { text: t('oversizedExisting') }) : null,
          conflict
            ? h(Notice, {
                tone: 'error',
                text: t('conflictBody'),
                children: button('compare', t, () => setModal('conflict'), {
                  disabled: saving || invalidCount > 0,
                }),
              })
            : null,
          hasDraft ? h('p', { className: 'cs-hint', children: t('draftHint') }) : null,
          fields.length > 4
            ? h(SearchBox, {
                t,
                label: t('fieldSearch'),
                value: query,
                onChange: setQuery,
                disabled: saving || status === 'loading',
              })
            : null,
          h('div', {
            className: 'cs-fields',
            children: visible.map((field) =>
              h(
                FieldRow,
                {
                  t,
                  field,
                  locale,
                  draft: drafts[field.key],
                  disabled: saving || status === 'loading',
                  error: allErrors[field.key],
                  onChange: (draft) => setDraft(field.key, draft),
                },
                field.key,
              ),
            ),
          }),
          !visible.length && fields.length
            ? h('p', { className: 'cs-hint', children: t('emptyFilter') })
            : null,
          snapshot.history?.length
            ? h('details', {
                className: 'cs-history',
                children: [
                  h('summary', { children: t('history') }),
                  h('ul', {
                    children: snapshot.history.map((item, index) =>
                      h(
                        'li',
                        {
                          children: [
                            h('time', {
                              dateTime: item.time,
                              children: new Date(item.time).toLocaleTimeString(locale),
                            }),
                            ' · ',
                            item.keys.map((key) => fieldLabel({ key }, locale)).join(', '),
                            index === 0
                              ? button('undoSave', t, () => setModal('undo'), {
                                  disabled: !item.canUndo || hasDraft || saving,
                                })
                              : null,
                          ],
                        },
                        item.id,
                      ),
                    ),
                  }),
                ],
              })
            : null,
          fields.length
            ? h('div', {
                className: 'cs-footer',
                'data-active': hasDraft || saving || invalidCount > 0,
                children: [
                  h('p', {
                    className: 'cs-footer-status',
                    role: 'status',
                    'aria-live': 'polite',
                    children: saving
                      ? t('saving')
                      : invalidCount
                        ? t('fixInvalid')
                        : hasDraft
                          ? t('pending', { count: String(changes.length || Object.keys(drafts).length) })
                          : t('unchanged'),
                  }),
                  invalidCount
                    ? button('firstError', t, focusError, { className: 'cs-button cs-error-link' })
                    : null,
                  button('discard', t, discard, { disabled: !hasDraft || saving }),
                  button('save', t, () => setModal('review'), {
                    className: 'cs-button cs-button-primary',
                    disabled: !canSave,
                  }),
                ],
              })
            : null,
          modal === 'review'
            ? h(DiffModal, {
                t,
                changes,
                locale,
                onCancel: () => setModal(null),
                onConfirm: () => submit(),
                busy: saving,
              })
            : null,
          modal === 'leave'
            ? h(Modal, {
                closeLabel: t('close'),
                title: t('leaveTitle'),
                note: t('leaveNote'),
                onCancel: () => setModal(null),
                actions: [
                  button('continue', t, () => setModal(null)),
                  button('discardLeave', t, () => {
                    discard()
                    onBack()
                  }),
                  button(
                    'keepLeave',
                    t,
                    () => {
                      cache(drafts, draftCache.get(cacheKey)?.revision ?? snapshot.revision)
                      onBack()
                    },
                    { className: 'cs-button cs-button-primary' },
                  ),
                ],
              })
            : null,
          modal === 'reload'
            ? h(Modal, {
                closeLabel: t('close'),
                title: t('reloadTitle'),
                note: t('reloadNote'),
                onCancel: () => setModal(null),
                actions: [
                  button('diffCancel', t, () => setModal(null)),
                  button(
                    'reloadKeep',
                    t,
                    () => {
                      setModal(null)
                      readFresh(true)
                    },
                    { className: 'cs-button cs-button-primary' },
                  ),
                ],
              })
            : null,
          modal === 'conflict'
            ? h(Modal, {
                closeLabel: t('close'),
                title: t('conflictTitle'),
                note: t('conflictBody'),
                onCancel: () => setModal(null),
                children: h(DiffTable, { changes, t, locale, comparing: true }),
                actions: [
                  button('continue', t, () => setModal(null)),
                  button(
                    'rebase',
                    t,
                    () => {
                      cache(drafts, snapshot.revision)
                      setConflict(false)
                      setModal(null)
                    },
                    { className: 'cs-button cs-button-primary' },
                  ),
                ],
              })
            : null,
          modal === 'undo'
            ? h(Modal, {
                closeLabel: t('close'),
                title: t('undoTitle'),
                note: t('undoNote'),
                busy: saving,
                onCancel: () => setModal(null),
                actions: [
                  button('diffCancel', t, () => setModal(null), { disabled: saving }),
                  button(saving ? 'saving' : 'undoSave', t, () => submit(snapshot.history[0].id), {
                    className: 'cs-button cs-button-primary',
                    disabled: saving,
                  }),
                ],
              })
            : null,
        ],
      })
    }

    const CATEGORY_ORDER = [
      'models',
      'agents',
      'tools',
      'web',
      'account',
      'runtime',
      'session',
      'ui',
      'platform',
      'other',
    ]
    function ListView({ t, locale, onOpen, onProfile }) {
      const [state, setState] = React.useState({ status: 'loading', entries: [], stats: null, profile: null })
      const [token, setToken] = React.useState(0),
        [query, setQuery] = React.useState(browse.query),
        [scope, setScope] = React.useState(browse.scope)
      const [groupBy, setGroupBy] = React.useState(browse.groupBy),
        [collapsed, setCollapsed] = React.useState(browse.collapsed)
      React.useEffect(() => {
        const controller = new AbortController()
        setState((current) => ({ ...current, status: 'loading' }))
        call('list', {}, controller.signal)
          .then((data) => {
            setState({ ...data, status: 'ready' })
            onProfile(data.profile)
          })
          .catch((error) => {
            if (error.code !== 'cancelled') setState({ status: 'error', entries: [], stats: null, error })
          })
        return () => controller.abort()
      }, [token])
      const needle = query.trim().toLowerCase()
      const scoped = state.entries.filter((entry) =>
        scope === 'editable'
          ? entry.editable
          : scope === 'modified'
            ? entry.overridden
            : scope === 'errors'
              ? ['failed', 'inactive', 'disabled'].includes(entry.status)
              : scope === 'recent'
                ? recentEntries.has(entry.id)
                : true,
      )
      const entries = scoped
        .map((entry) => {
          const headline =
            `${entry.id} ${entry.name ?? ''} ${entryLabel(entry, locale)} ${t(`category.${entry.category ?? 'other'}`)}`.toLowerCase()
          const matchingFields = (entry.fieldNames ?? []).filter((field) =>
            `${field.key} ${fieldLabel(field, locale)} ${describe(field, locale) ?? ''}`
              .toLowerCase()
              .includes(needle),
          )
          return {
            ...entry,
            match: !needle || headline.includes(needle) || matchingFields.length > 0,
            fieldQuery: needle && !headline.includes(needle) ? query : '',
          }
        })
        .filter((entry) => entry.match)
      const categories = groupBy === 'origin' ? ['official', 'third-party'] : CATEGORY_ORDER
      const groups = categories
        .map((key) => ({
          key,
          entries: entries.filter(
            (entry) => (groupBy === 'origin' ? entry.origin : (entry.category ?? 'other')) === key,
          ),
        }))
        .filter((group) => group.entries.length)
      const allCollapsed = groups.length > 0 && groups.every((group) => collapsed.has(group.key))
      const change = (key, value, setter) => {
        browse[key] = value
        setter(value)
      }
      return h('div', {
        className: 'cs-root',
        children: [
          h('div', {
            className: 'cs-head',
            children: [
              h('div', {
                className: 'cs-heading-line',
                children: [
                  h('h1', { className: 'cs-title', children: t('title') }),
                  h(ProfileBadge, { t, profile: state.profile }),
                ],
              }),
              h('p', { className: 'cs-sub', children: t('subtitle') }),
              h('div', {
                className: 'cs-filters',
                role: 'group',
                'aria-label': t('filterLabel'),
                children: [
                  ['editable', 'onlyEditable'],
                  ['all', 'allEntries'],
                  ['modified', 'onlyModified'],
                  ['errors', 'onlyErrors'],
                  ['recent', 'recent'],
                ].map(([value, key]) =>
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'cs-seg',
                      'aria-pressed': scope === value,
                      onClick: () => change('scope', value, setScope),
                      children: t(key),
                    },
                    value,
                  ),
                ),
              }),
              h('div', {
                className: 'cs-toolbar',
                children: [
                  h(SearchBox, {
                    t,
                    label: t('search'),
                    value: query,
                    onChange: (value) => change('query', value, setQuery),
                  }),
                  button('refresh', t, () => setToken((x) => x + 1), {
                    className: 'cs-button cs-button-icon',
                    iconOnly: true,
                    disabled: state.status === 'loading',
                  }),
                ],
              }),
              h('div', {
                className: 'cs-stats-row',
                children: [
                  h('p', {
                    className: 'cs-stats',
                    title: state.stats
                      ? t('statsAll', {
                          total: String(state.stats.total),
                          editable: String(state.stats.editable),
                          readonly: String(state.stats.readonly),
                        })
                      : '',
                    children: state.stats
                      ? t('resultCount', { count: String(entries.length), total: String(state.stats.total) })
                      : '',
                  }),
                  h('div', {
                    className: 'cs-list-options',
                    children: [
                      h('select', {
                        className: 'cs-group-select',
                        'aria-label': t('groupLabel'),
                        value: groupBy,
                        onChange: (event) => change('groupBy', event.target.value, setGroupBy),
                        children: [
                          h('option', { value: 'function', children: t('groupByFunction') }),
                          h('option', { value: 'origin', children: t('groupByOrigin') }),
                        ],
                      }),
                      groups.length > 1
                        ? button(
                            allCollapsed ? 'expandAll' : 'collapseAll',
                            t,
                            () =>
                              change(
                                'collapsed',
                                allCollapsed ? new Set() : new Set(groups.map((g) => g.key)),
                                setCollapsed,
                              ),
                            { className: 'cs-link' },
                          )
                        : null,
                    ],
                  }),
                ],
              }),
            ],
          }),
          state.status === 'loading'
            ? h('p', { className: 'cs-hint', role: 'status', children: t('loading') })
            : state.status === 'error'
              ? h(Notice, {
                  tone: 'error',
                  text: errorText(t, state.error),
                  children: button('retry', t, () => setToken((x) => x + 1)),
                })
              : !entries.length
                ? h('div', {
                    className: 'cs-empty',
                    children: [icon('search', 24), h('span', { children: t('emptyFilter') })],
                  })
                : h('div', {
                    className: 'cs-groups',
                    children: groups.map((group) =>
                      h(
                        'section',
                        {
                          className: 'cs-group',
                          children: [
                            h('button', {
                              type: 'button',
                              className: 'cs-group-head',
                              'aria-expanded': !collapsed.has(group.key),
                              onClick: () => {
                                const next = new Set(collapsed)
                                next.has(group.key) ? next.delete(group.key) : next.add(group.key)
                                change('collapsed', next, setCollapsed)
                              },
                              children: [
                                icon('chevron-right', 13),
                                h('span', {
                                  className: 'cs-group-label',
                                  children: t(`${groupBy === 'origin' ? 'origin' : 'category'}.${group.key}`),
                                }),
                                h('span', {
                                  className: 'cs-group-count',
                                  children: String(group.entries.length),
                                }),
                              ],
                            }),
                            collapsed.has(group.key)
                              ? null
                              : h('ul', {
                                  className: 'cs-list',
                                  children: group.entries.map((entry) =>
                                    h(
                                      'li',
                                      {
                                        children: h('button', {
                                          type: 'button',
                                          className: 'cs-item',
                                          'data-readonly': !entry.editable,
                                          onClick: () => {
                                            recentEntries.add(entry.id)
                                            onOpen(entry.id, entry.fieldQuery)
                                          },
                                          children: [
                                            h('span', {
                                              className: 'cs-item-top',
                                              children: [
                                                h('span', {
                                                  className: 'cs-item-title',
                                                  title: entryLabel(entry, locale),
                                                  children: entryLabel(entry, locale),
                                                }),
                                                icon('chevron-right', 14, 'cs-item-arrow'),
                                              ],
                                            }),
                                            h('span', {
                                              className: 'cs-item-id',
                                              title: entry.name ?? entry.id,
                                              children: entry.id,
                                            }),
                                            h('span', {
                                              className: 'cs-item-meta',
                                              children: [
                                                h('span', {
                                                  children: entry.reason
                                                    ? t(`reason.${entry.reason}`)
                                                    : t('fieldCount', { fields: String(entry.fields) }),
                                                }),
                                                h('span', {
                                                  className: 'cs-item-tags',
                                                  children: [
                                                    entry.overridden
                                                      ? h('span', {
                                                          className: 'cs-tag cs-tag-accent',
                                                          children: t('overridden'),
                                                        })
                                                      : null,
                                                    !entry.editable
                                                      ? h('span', {
                                                          className: 'cs-tag',
                                                          children: t('readonlyBadge'),
                                                        })
                                                      : null,
                                                    entry.origin === 'third-party'
                                                      ? h('span', {
                                                          className: 'cs-tag',
                                                          children: t('origin.third-party'),
                                                        })
                                                      : null,
                                                  ],
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                      },
                                      entry.id,
                                    ),
                                  ),
                                }),
                          ],
                        },
                        group.key,
                      ),
                    ),
                  }),
        ],
      })
    }

    function StudioSection(props) {
      const t = props.t ?? props.tr,
        locale = props.locale
      const [selected, setSelected] = React.useState(null),
        [profile, setProfile] = React.useState(null)
      return selected
        ? h(
            DetailView,
            {
              t,
              locale,
              profile,
              entryId: selected.id,
              initialQuery: selected.query,
              onBack: () => setSelected(null),
            },
            selected.id,
          )
        : h(ListView, { t, locale, onProfile: setProfile, onOpen: (id, query) => setSelected({ id, query }) })
    }
    const inject = ['slots', 'locale']
    function apply(ctx) {
      const t = ctx.locale.bind(NS)
      ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'config-studio: dictionaries')
      ctx.effect(() => {
        const style = document.createElement('style')
        style.dataset.plugin = 'dsh-config-studio'
        style.textContent = CSS
        document.head.appendChild(style)
        const onUnload = (event) => {
          if ([...draftCache.values()].some((item) => Object.keys(item.drafts).length)) {
            event.preventDefault()
            event.returnValue = ''
          }
        }
        window.addEventListener('beforeunload', onUnload)
        return () => {
          style.remove()
          window.removeEventListener('beforeunload', onUnload)
          draftCache.clear()
        }
      }, 'config-studio: styles and drafts')
      ctx.slots.inject('settings.section', () =>
        ctx.slots.register(
          {
            name: 'settings.section',
            id: 'config-studio',
            order: 30,
            label: () => t('nav'),
            locale: NS,
            inject: () => ({ tr: t, locale: ctx.locale.getSnapshot().active }),
          },
          StudioSection,
        ),
      )
    }
    return { inject, apply }
  },
})
