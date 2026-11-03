<p align="center">
  <img src="icon.svg" width="72" alt="dsh-config-studio 图标">
</p>

<h1 align="center">dsh-config-studio</h1>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.zh.md"><b>中文</b></a>
</p>

<p align="center">
  <a href="https://github.com/MaxHan0102/dsh-config-studio/releases"><img alt="release" src="https://img.shields.io/github/v/release/MaxHan0102/dsh-config-studio?label=release" /></a>
  <a href="https://github.com/MaxHan0102/dsh-config-studio/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/MaxHan0102/dsh-config-studio" /></a>
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" /></a>
  <img alt="DSH 0.2.1-rc.5+" src="https://img.shields.io/badge/DSH-0.2.1--rc.5%2B-4d6bfe" />
</p>

给 DSH 里那些「内置设置页够不着」的配置补一个可视化入口。它列出当前 profile 中所有**可寻址的 Loader 条目**，按每个插件自己的 `Config` schema 生成表单，把改动写回 profile 的 `cordis.patch.yml`——走 `ctx.configEditor`，和官方设置页同一个写入器，但没有「只能写 volatile 字段」的限制。

页面出现在 **设置 → 插件配置**，文案跟随 Harness 的语言（简体中文 / English）。

## 为什么需要它

官方设置页通过 `settings.mutate` 写入，只接受插件用 `.volatile()` 声明过的字段，写其它字段会直接抛 `Config field "<path>" is not volatile`；其余配置只能手改 YAML。

对需要热更新的偏好项来说这个限制是合理的，但它让 profile 里的大部分配置没有图形入口：插件开关、超时、功能开关、provider 表……这个插件走另一条路——操作**完整的原始 config**，由宿主按 Loader 的规则校验并应用。

## 功能

- **浏览**——列出 `configEditor.entries()` 返回的全部条目，显示包名、字段数、是否已覆盖、当前状态；支持按 id 或包名搜索；在「仅可编辑」（默认）和「全部」之间切换；可按**功能**（模型与推理、Agent 与预设、工具与技能、联网、账号与凭据、执行与文件、会话与存储、界面、平台服务、其他）或按**来源**（官方 / 第三方）分组；分组可折叠；进入条目再返回，浏览状态不丢。
- **编辑**——每个顶层配置键一个控件：文本、数字、开关、枚举下拉，对象和数组用 JSON 编辑器；每行显示当前生效值、是否来自 profile 补丁，并提供一键**恢复默认**。
- **先复核再保存**——保存前给出补丁形态的变更 diff；revision 校验会拒绝覆盖并发编辑；结果行会说明是「已应用」还是「覆盖已移除」。
- **默认只读的边界**——密钥、`!!js` 表达式、无法识别的 schema 结构、超大条目一律不可写（见下表）。
- **中英双语**——跟随 Harness 语言切换，包括导航名、页面内所有文案和错误提示。

## 安装

本包是 `dsh.bundle` 包，**零依赖、无构建步骤**，下面几种安装源等价，按你的宿主选一种即可。

### DSH 桌面版（推荐）

桌面 profile 由应用独占管理，`dsh plugin` 装不进去：

1. 打开 **设置 → 插件**；
2. 在安装框里粘贴下面任一地址：

   ```text
   https://github.com/MaxHan0102/dsh-config-studio/releases/download/v0.1.0/dsh-config-studio-0.1.0.tgz
   ```

   或

   ```text
   github:MaxHan0102/dsh-config-studio
   ```

3. 确认列表里的 **dsh-config-studio** 为启用状态，然后刷新页面（`Cmd/Ctrl+R`）。

### dsh web 或自定义 profile

```bash
# Release tarball（钉在 tag 上，链接不会失效）
dsh plugin --profile web add https://github.com/MaxHan0102/dsh-config-studio/releases/download/v0.1.0/dsh-config-studio-0.1.0.tgz

# 或者直接从仓库安装
dsh plugin --profile web add github:MaxHan0102/dsh-config-studio
```

把 `web` 换成你自己的 profile 名。宿主没有立刻加载就重启一次，然后刷新页面。

### 更新

换新 tag 重跑安装命令：

```bash
dsh plugin --profile web add https://github.com/MaxHan0102/dsh-config-studio/releases/download/v0.1.1/dsh-config-studio-0.1.1.tgz
```

桌面版用插件卡片上的更新按钮。git 方式安装没有自动更新检查，需要先移除再重新安装。

### 卸载

```bash
dsh plugin --profile web remove dsh-config-studio
```

插件写过的覆盖会留在 `cordis.patch.yml` 里；卸载插件不会动你的配置。

### 环境要求

| | |
|---|---|
| DSH | `0.2.1-rc.5` 及以上（在 `0.2.1-rc.5` 上测试） |
| 依赖服务 | `ctx.configEditor` 与 `ctx.connection.fetch`，Web 组合默认都带 |
| Node | 20+ |
| 浏览器 | 任意当前版本的 Web GUI；这个分区就是一个普通的客户端插件 |

包刻意不声明 DSH 版本范围：它是纯 JavaScript、不 import 任何宿主包，这样新版本照样能装，而不是被预发布 peer 范围挡在门外。

## 使用

1. **打开** **设置 → 插件配置**。首屏列出「有东西可改」的条目；把过滤切到「全部」可以查看只读条目。
2. **选择一个条目。** 右侧按插件自己的 schema 生成字段；标了**已覆盖**的字段来自你的 profile 补丁，其余显示继承值。
3. **编辑。** 改过的行会高亮；非法数字、枚举、JSON 会在保存前标红。点某一行的**恢复默认**表示「保存时恢复为继承值」（输入框里显示待写入的值）。
4. **复核。** 点「保存到 profile」会先弹出变更 diff，只列出真正会写进去的内容。
5. **应用。** 宿主用插件 schema 校验完整 config，原子写入补丁，再由 Loader 重载该条目。schema 拒绝的值会带字段名返回；并发编辑会以冲突形式提示，并给出重新读取。

### 徽章含义

| 徽章 | 含义 |
|---|---|
| **已覆盖**（条目级） | profile 补丁里有这个条目的 `config:` 记录 |
| **已覆盖**（字段级） | 这个键写在那条记录里，值来自 profile 层 |
| **只读** | 见下表；字段只为展示上下文，不会被写入 |
| **第三方** | 包不在 `@deepseek-ai/` 作用域下 |

### 两个必须知道的语义

**补丁是整份 config 替换。** DSH 应用补丁时替换条目的整个 `config` 对象，而不是逐键合并。所以保存一个字段，写进去的是「该条目当前 config + 你的改动」，其余已有值会被一并固定下来；当所有字段都等于继承层时，整条记录会被删除——这就是「恢复默认」对一个条目的实际效果。

**保存会重载插件。** 每次保存都走 Loader 的正常生命周期，插件用新配置重新启动；个别插件需要重启宿主才完全生效，结果行里会说明。

## 只读规则

由宿主判定，浏览器无法绕过。

| 条件 | 原因 |
|---|---|
| `role('secret')` 字段 | 值不离开宿主，页面只知道「是否已设置」 |
| `role('credential-ref')` 字段 | 引用不是可编辑的值 |
| 内部含密钥的对象 | 用 JSON 编辑会泄露密钥 |
| 未求值的 `!!js` 表达式 | 只有 YAML 能安全表达 |
| 表单无法识别的 schema 类型 | 没有安全的控件 |
| 字段带 `meta.disabled` | 插件自己禁用了它 |
| 条目超过 64 KiB | 单个表单里改不动 |
| 条目被禁用、加载失败、未激活或是分组 | 当前不可寻址 |
| 插件没有声明 `Config` | 没有可生成表单的 schema |

## 实现方式

仓库里是完整的两半：

- **Host 半边**（`index.js`）——通过 `ctx.connection.fetch` 注册三个 `POST` 端点，因此 `/api` 的 Host/Origin 校验与 cookie 鉴权都会先生效。除 Node 内置模块外不 import 任何东西：表单形状直接读 Loader 已持有的 **schemastery** schema。

  | 端点 | 请求体 | 返回 |
  |---|---|---|
  | `/api/config-studio/list` | `{}` | 条目、状态、字段数、分类、来源 |
  | `/api/config-studio/read` | `{ id }` | revision、字段、值、只读原因 |
  | `/api/config-studio/write` | `{ id, expectedRevision, changes }` | `{ ok, revision }` 或 `{ ok: false, error }` |

- **Client 半边**（`client.js`）——以模块加载器格式注册 `settings.section`，不 import 任何 Harness 客户端包；控件自绘，样式只用主题 token。

写入会校验两次：请求中按插件 schema 校验一次，`configEditor.edit()` 内部再校验一次——后者持有 profile 锁、保留注释与 `!!js`、原子写入、重载条目，并在重载失败时回滚文件。`revision` 是「继承层 + profile 覆盖 + 原始 config」的哈希，过期表单会被拒绝而不是静默覆盖。

## 常见问题

| 现象 | 处理 |
|---|---|
| 看不到「插件配置」 | 确认插件已启用且处于 active，然后刷新页面；桌面版在 **设置 → 插件** 里检查插件卡片。 |
| 提示「配置服务没有响应」 | Host 半边没激活：检查 DSH 版本，以及插件列表里该条目是否为 `active`。 |
| 需要的字段是只读 | 命中了上面的规则；密钥和 `!!js` 请直接编辑 `cordis.patch.yml`。 |
| 保存成功但没变化 | 有更高优先级的层：home 补丁（`~/.dsh/cordis.patch.yml`）或 `--patch` 覆盖会压过 profile 层。 |
| 保存报冲突 | 页面读取之后，该条目被其它工具改过；重新读取再提交。 |
| DSH 升级后页面消失 | 查看上游发布说明里设置界面的变化，并带上 DSH 版本提 issue。 |

## 安全

- 只写当前 profile 的 `cordis.patch.yml`；home 补丁、命令行覆盖层、bundle 层只读不写。
- 只有 `configEditor.entries()` 返回的条目可寻址，其余条目对本页面不可见。
- 密钥从不下发到浏览器；schema 校验错误在离开宿主前会把凭据文本替换成占位符。
- 日志只记录条目 id 与字段名，从不打印配置值。
- 浏览器无法改变写入目标：宿主用自己的副本重建候选 config 并重新校验。

## 开发

仓库就是安装产物——纯 JavaScript，无需构建。

```text
index.js           Host 半边：schema 解析、端点、校验
client.js          Client 半边：设置分区、表单、diff、i18n
cordis.patch.yml   bundle 补丁，插入 Host 条目
locale/*.json      插件页展示用的元数据
icon.svg           插件列表用的图标
```

用一次性 profile 跑当前代码：

```bash
cp -R ~/.dsh/profiles /tmp/dsh-home/profiles
DSH_HOME=/tmp/dsh-home dsh --profile web --no-open --port 0
```

把工作副本装进那个 profile（`dsh plugin --profile web add <绝对路径>`），改完刷新页面。Host 半边通过重新启用插件来重载，Client 半边在页面刷新时重新拉取。

## 许可证

[MIT](./LICENSE)
