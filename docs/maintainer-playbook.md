# Maintainer Playbook

这份文档只回答一个问题：

`我现在要维护这个仓库，应该先改哪里、怎么验证、怎么避免踩坑？`

它既给人看，也给 AI 工具看。

## 维护总原则

- 先按真实仓库结构判断，不靠想象补全
- 先最小修改，再考虑扩展
- 优先复用已有模板、skills、角色说明
- 安装相关改动默认先走沙箱
- 不要直接拿真实 `~/.openclaw` 当测试环境

## 任务类型 -> 优先看哪里

### 1. 改安装流程

优先看：

- `scripts/bootstrap/install.mjs`
- `scripts/install.sh`
- `docs/testing-sandbox.md`
- `docs/maintainer-safety.md`

最常见改动包括：

- 安装提示
- onboarding 分支
- Telegram 等可选渠道接入
- gateway 行为
- 结束提示

验证顺序：

1. `bash scripts/bootstrap-test.sh`
2. `bash scripts/sandbox-test.sh`
3. 沙箱里再跑 `bash "$OPENCLAW_HOME/content-os-starter/scripts/check.sh"`

### 2. 改自检逻辑

优先看：

- `scripts/bootstrap/check.mjs`
- `scripts/check.sh`

验证顺序：

1. `bash scripts/bootstrap-test.sh`
2. `bash scripts/check.sh`

### 3. 改角色模板

优先看：

- `templates/workspaces/<role>/AGENTS.md`
- `templates/workspaces/<role>/SOUL.md`
- `templates/workspaces/<role>/TOOLS.md`
- `docs/architecture.md`

改角色时一定要先判断：

- 是角色边界不清楚
- 还是 skill 能力不够
- 还是 boss 分派规则不够稳

不要把所有问题都理解成“再加新 agent”。

### 4. 改 skill

优先看：

- `skills/<skill>/SKILL.md`
- `catalog/skills.json`
- `presets/content-basic.json`

判断顺序建议是：

1. 先看现有 skill 能不能覆盖
2. 再看是不是只需要改 skill 文案
3. 最后才决定新增一个 skill

### 5. 改内容目录模板

优先看：

- `templates/content-system/*`
- `templates/content-system/config/style-guide.md`

这类改动通常不需要跑安装器，但要核对：

- 路径
- 命名
- 示例是否脱敏

### 6. 新增场景 / 新增 preset

优先看：

- `docs/presets-overview.md`
- `docs/future-direction.md`
- `docs/reference-projects.md`
- `presets/preset-template.json`

不要一上来就新建很多角色。
先问：当前 5 个角色里哪些能复用。

## 验证顺序

### 安装器 / bootstrap 逻辑

推荐顺序：

1. `bash scripts/bootstrap-test.sh`
2. `bash scripts/sandbox-test.sh`
3. 沙箱自检

### 只改文档 / 模板 / 文案

通常可做：

- 只读检查
- 路径检查
- 命名检查
- 安全检查

不需要为了“保险”去碰真实环境。

### 只改角色文字

至少要检查：

- 角色职责是否清楚
- 和 `docs/architecture.md` 是否一致
- 有没有违反公开仓库安全约束

## 维护时最容易犯的错

### 错误 1：把仓库当 Web 项目

不要去找：

- 前端构建链
- API server
- 数据库迁移

这里不是那种项目。

### 错误 2：直接在真实环境验证

这会带来两个风险：

- 改坏自己当前能用的 OpenClaw
- 误把真实配置写进公开仓库

### 错误 3：看到成熟项目就想整套照搬

这个仓库已经明确的方向是：

- 场景化 starter
- 一键安装
- 新手友好

不是：

- 角色数量竞赛
- 超大 agent 模板仓库

### 错误 4：把所有扩展都理解成“新增角色”

很多时候更合理的是：

- 先改 skill
- 先改 boss 分派
- 先改 SOUL / AGENTS

而不是直接再加 5 个 agent。

## AI 工具接手时推荐先问自己的 5 个问题

1. 这次任务是改安装、自检、模板、skill，还是场景规划？
2. 这次改动会不会碰真实 `~/.openclaw`？
3. 有没有现成模板、skill、角色文案可以复用？
4. 能不能先参考成熟项目，而不是从零写？
5. 最小可验证路径是什么？

## 参考项目怎么用

这件事不要每次都重想，默认照这个顺序：

1. 先读 `docs/local-reference-rules.md`
2. 再读 `docs/reference-projects.md`
3. 然后只借最小必要的一部分

如果用户明确要求“参考后直接改造”，优先做：

- 局部复用
- 局部拿现成 SOUL / agent 结构
- 局部借安装与集成思路

不要默认全盘复制。

## 做完一轮改动后，输出时最好包含什么

无论是人还是 AI，结束一轮后最好明确说：

- 现在做到哪里了
- 改了哪一层
- 还没验证什么
- 下一步最推荐做什么

## 一句话总结

`维护这个仓库时，最重要的不是写更多东西，而是让“装起来、测得动、以后好扩展”一直成立。`
