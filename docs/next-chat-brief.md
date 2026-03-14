# 下次对话速览

这份文档只回答一个问题：

`如果我开一个新对话，或者换一个新的 AI 工具，最短的接手路径是什么？`

## 先读顺序

请新 AI 进入仓库后，按这个顺序读：

1. `USER.md`
2. `AGENTS.md`
3. `docs/project-map.md`
4. `docs/presets-overview.md`
5. `docs/maintainer-playbook.md`
6. `docs/future-direction.md`
7. `docs/reference-projects.md`

如果只是想快速知道怎么安装和怎么测，再补读：

8. `README.md`
9. `docs/quickstart.md`
10. `docs/testing-sandbox.md`

## 当前项目是什么

这是一个公开版 `OpenClaw 多 agent 场景化 starter`。

当前不是多场景大仓库。
当前先以 `content-basic` 作为第一个真实可安装的参考实现。

## 当前已经稳定具备的能力

- 一键安装
- 一键自检
- 沙箱隔离测试
- 5 个默认角色
- 6 个 starter skills
- 可选 Telegram 接入
- 正常安装后自动尝试重启 gateway

## 当前最重要的项目判断

以后看这个仓库，默认不要把它理解成：

- 海量 agent 模板仓库
- 通用 prompt 集合
- 传统 Web 工程

更准确的理解应该是：

- 用户先选一个场景
- 跑一条安装命令
- 直接得到一套可用的多 agent 系统

## 维护时默认的测试路径

默认顺序：

1. `bash scripts/bootstrap-test.sh`
2. `bash scripts/sandbox-test.sh`
3. 沙箱里跑 `bash "$OPENCLAW_HOME/content-os-starter/scripts/check.sh"`

默认不要动真实 `~/.openclaw` 做安装验证。

## 未来方向

未来最重要的方向不是卷 agent 数量。

而是：

- 多场景 preset
- 一键安装
- 新手可用
- 尽量复用成熟项目
- 不重复造轮子

最关键的未来说明看：

- `docs/future-direction.md`

## 外部参考项目

当前未来优先参考的两个项目是：

- `awesome-openclaw-agents`
- `agency-agents`

以后如果 AI 要扩角色、扩场景、补模板，默认先判断能不能从这两个项目里局部借鉴或直接拿现成结构，而不是先自己发明。

具体规则看：

- `docs/reference-projects.md`
- `docs/local-reference-rules.md`

## 交给新 AI 的推荐提示词

如果你要把任务交给新的 AI 工具，最推荐直接发这段：

```text
请先阅读这个仓库里的这些文件：
1. USER.md
2. AGENTS.md
3. docs/project-map.md
4. docs/presets-overview.md
5. docs/maintainer-playbook.md
6. docs/future-direction.md
7. docs/reference-projects.md

项目定位：
这是一个面向新手的 OpenClaw 多 agent 场景化 starter。
当前默认 preset 是 content-basic。
目标不是卷 agent 数量，而是让用户选一个场景后能一键安装并直接可用。

硬要求：
1. 全程用简体中文
2. 默认把维护者当零基础用户
3. 优先最小修改
4. 不要动真实 ~/.openclaw 做安装验证
5. 先复用已有模板、skills、角色说明
6. 优先参考成熟项目，避免重复造轮子

重点参考外部项目：
- awesome-openclaw-agents
- agency-agents

如果要做扩展，请先说明：
1. 当前仓库里哪些能复用
2. 外部成熟项目里哪些值得借
3. 最推荐先做的最小下一步是什么
4. 应该怎么验证
```

## 一句话总结

`以后不管换哪个 AI，先读这 7 份文件，它就应该能比较快理解这个项目现在是什么、未来要往哪走。`
