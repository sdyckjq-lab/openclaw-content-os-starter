# Project Map

这份文档只回答一个问题：

`如果我是第一次进入这个仓库，应该先看哪里，才能最快理解它？`

它既写给新维护者，也写给新开对话的 AI 工具。

## 一句话定位

这是一个面向新手的 `OpenClaw 多 agent 场景化 starter`。

当前仓库不是通用 agent 模板市场，也不是传统 Web 应用。
它的目标是：

- 让已经有 OpenClaw 基础的用户
- 通过一条安装命令
- 直接得到一套可运行的多 agent 内容系统

## 先看顺序

如果你只想在 10 分钟内进入状态，按这个顺序看：

1. `USER.md`
2. `AGENTS.md`
3. `README.md`
4. `docs/quickstart.md`
5. `docs/architecture.md`
6. `docs/presets-overview.md`
7. `docs/maintainer-playbook.md`
8. `docs/future-direction.md`
9. `docs/reference-projects.md`

## 当前项目状态

到当前主分支为止，这个仓库已经具备：

- 1 个默认 preset：`content-basic`
- 5 个默认角色：`boss`、`material`、`creator`、`thinktank`、`tech`
- 6 个 starter skills
- 一键安装器
- 一键自检
- 完全隔离的沙箱测试路径
- 可选 Telegram 接入
- 正常安装后自动尝试重启 gateway

也就是说，它已经不是“只给几段 prompt”。
而是一个可以真正安装和验证的 starter。

## 顶层目录怎么理解

### `docs/`

说明项目做什么、怎么装、怎么测、怎么扩展。

优先看：

- `docs/quickstart.md`
- `docs/architecture.md`
- `docs/testing-sandbox.md`
- `docs/maintainer-playbook.md`
- `docs/future-direction.md`

### `scripts/`

运行入口和 bootstrap 逻辑。

最重要的是：

- `scripts/install.sh`
- `scripts/check.sh`
- `scripts/sandbox-test.sh`
- `scripts/bootstrap/install.mjs`
- `scripts/bootstrap/check.mjs`

### `templates/`

安装时要复制到用户环境里的模板。

主要包含：

- `templates/workspaces/*`
- `templates/content-system/*`
- `templates/openclaw.json5.template`

### `skills/`

当前 starter 自带的本地 skills。

它们不是抽象示例，而是对应默认内容工作流的真实能力。

### `presets/`

定义“一个场景 starter 到底包含哪些角色、skills、前缀规则”。

当前真正对外可用的是：

- `presets/content-basic.json`

另外还有一个骨架：

- `presets/preset-template.json`

## 代码热点

### 安装逻辑

看：

- `scripts/bootstrap/install.mjs`

这里负责：

- 复用已有 OpenClaw 配置
- fresh install onboarding
- 安装 workspace / skills / content 模板
- 可选 Telegram 接入
- gateway 重启与结束提示

### 自检逻辑

看：

- `scripts/bootstrap/check.mjs`

这里负责检查：

- config
- agents
- workspace
- skills
- content 目录
- gateway

### preset 解析

看：

- `scripts/bootstrap/starter-manifest.mjs`
- `presets/*.json`

### prefix / identity 规则

看：

- `scripts/bootstrap/starter-identity.mjs`

### 小型交互与辅助模块

看：

- `scripts/bootstrap/interactive-menu.mjs`
- `scripts/bootstrap/empty-secret-actions.mjs`
- `scripts/bootstrap/telegram-channel.mjs`
- `scripts/bootstrap/gateway-restart.mjs`

## 当前默认工作流

默认链路是：

`素材 -> 索引 -> 选题 -> 大纲 -> 初稿`

默认调度方式是：

`用户 -> boss -> 其他角色 -> boss`

这个仓库现在优先优化的是：

- 先装起来
- 先跑通一条最小流程
- 先让新手少踩坑

不是：

- 一开始就几十个 agent
- 一开始就接很多平台
- 一开始就做复杂自动化

## 命令面

这个仓库当前可信的命令面很少，主要就是这些：

- 安装：`bash scripts/install.sh`
- 自检：`bash scripts/check.sh`
- 沙箱测试：`bash scripts/sandbox-test.sh`
- bootstrap 原生测试：`bash scripts/bootstrap-test.sh`

不要默认去找：

- `npm run dev`
- `pnpm build`
- `yarn test`

因为这里不是那种项目。

## 维护时最重要的判断

### 如果你要改安装器

先看：

- `scripts/bootstrap/install.mjs`
- `docs/testing-sandbox.md`
- `docs/maintainer-playbook.md`

### 如果你要改角色行为

先看：

- `templates/workspaces/<role>/AGENTS.md`
- `templates/workspaces/<role>/SOUL.md`
- `templates/workspaces/<role>/TOOLS.md`

### 如果你要扩场景

先看：

- `docs/presets-overview.md`
- `docs/future-direction.md`
- `docs/reference-projects.md`

## 和参考项目的关系

当前仓库不是从零发明一切。

未来明确允许优先借鉴这两类成熟参考：

- `awesome-openclaw-agents`
- `agency-agents`

但默认策略仍然是：

- 先比较
- 再决定局部复用
- 不重复造轮子
- 不盲目整套照搬

具体怎么借鉴，看：

- `docs/reference-projects.md`

## 一句话总结

`先把它当成“可安装的场景 starter”，而不是“海量 agent 模板仓库”，很多判断就会更清楚。`
