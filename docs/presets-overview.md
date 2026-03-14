# Presets Overview

这份文档只回答一个问题：

`这个仓库现在有哪些 preset，以后要怎么加新的？`

## 什么是 preset

在这个仓库里，`preset` 不是一句口号。

它是一个明确的安装单元，至少要定义：

- 角色列表
- boss 角色
- shared skills
- agent 前缀
- workspace 前缀

对应位置主要是：

- `presets/*.json`
- `templates/workspaces/*`
- `templates/content-system/*`

## 当前已有的 preset

### 1. `content-basic`

文件：

- `presets/content-basic.json`

定位：

- 当前正式对外的默认内容创作 starter
- 面向新手
- 默认先跑通“素材 -> 选题 -> 初稿”的最小链路

角色：

- `boss`
- `material`
- `creator`
- `thinktank`
- `tech`

shared skills：

- `x-article-extractor`
- `update-material-index`
- `material-recommendation`
- `record-inspiration`
- `deepen-topic`
- `generate-draft`

当前它是整个仓库的主路径。

### 2. `preset-template`

文件：

- `presets/preset-template.json`

定位：

- 这是一个骨架，不是推荐用户直接安装的现成场景
- 主要用于后续新增 preset 时参考结构

它的意义是：

- 帮维护者理解字段长什么样
- 降低未来新增场景时的起步成本

## 一个 preset 目前至少依赖什么

如果你新增一个真正可安装的 preset，通常至少要配齐这几层：

1. `presets/<preset>.json`
2. 对应角色的 `templates/workspaces/<role>/`
3. 需要复用或新增的 `skills/`
4. 必要时更新 `catalog/skills.json`
5. 必要时补文档说明

注意：

- 不一定每个新场景都要新建一套内容目录模板
- 但至少要说明复用现有目录是否合理

## 当前 preset 设计原则

现阶段这个仓库不追求“很多 preset”。

更重要的是：

- 每个 preset 都能装起来
- 每个 preset 都能自检
- 每个 preset 都有清晰工作流
- 每个 preset 都能解释给零基础用户听

所以当前最推荐的扩展方式不是：

- 一次加很多场景

而是：

- 一次只扩 1 个新场景
- 先定义它解决什么问题
- 再决定角色复用还是新增

## 新增 preset 时的推荐顺序

### 第一步：先写场景定义

先回答：

- 这个场景服务谁
- 这个场景解决什么问题
- 用户装完后第一条最小流程是什么

如果这三件事说不清，不要急着写 preset。

### 第二步：先决定是否复用现有角色

优先问：

- `boss` 能不能复用
- `tech` 能不能复用
- 只是 skill 变化，还是角色边界也变化

默认优先：

- 先复用角色
- 再局部改 SOUL / AGENTS / TOOLS

而不是立刻新建很多角色。

### 第三步：再决定 skill 来源

优先顺序建议是：

1. 先复用现有 skill
2. 再参考成熟项目里已有的角色/模板/能力拆分
3. 最后才自己从零写新的 skill

也就是说：

`先找能复用的，再找需要改造的，最后才自己发明。`

### 第四步：最后才补安装器说明

当 preset 本身结构稳定了，再去补：

- README
- quickstart
- presets 总览
- 参考项目说明

## 新增 preset 的最小检查单

一个新 preset 至少要能回答这些问题：

### 结构层

- boss 是谁
- 角色有哪些
- shared skills 是什么
- workspace 模板是否存在

### 用户层

- 安装后用户第一步做什么
- 这个 preset 不做什么
- 新手最容易卡在哪

### 维护层

- 哪些东西复用了现有实现
- 哪些东西只是局部改造
- 哪些才是真正新增

### 验证层

- `bash scripts/bootstrap-test.sh`
- `bash scripts/sandbox-test.sh`
- `bash "$OPENCLAW_HOME/content-os-starter/scripts/check.sh"`

## 当前最推荐的 preset 扩展方向

如果按你目前的项目目标，最推荐的下一个 preset 不是随便挑一个酷炫场景。

而是选一个和“内容系统”邻近、但边界足够清楚的场景，比如：

- 素材研究型
- 选题策划型
- 发布准备型
- 客户定制内容系统 starter

这样最容易复用当前内容 starter 的骨架。

## 和参考项目的关系

未来做新 preset 时，优先参考：

- `docs/reference-projects.md`

尤其是：

- 用 `awesome-openclaw-agents` 看有没有现成角色人格或 SOUL 模板可借
- 用 `agency-agents` 看场景角色怎么写得更清楚、怎么做角色边界和协作说明

## 一句话总结

`preset 不是多写几个 JSON，而是要沉淀成“用户选一个场景就能装起来”的完整单元。`
