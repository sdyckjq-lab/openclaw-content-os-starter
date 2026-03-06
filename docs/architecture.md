# Architecture

这个 starter 用的是“一个入口，多个专业角色”的结构。

## 默认原则

- 用户只和 `boss` 说话
- `boss` 负责拆任务
- 其他 agent 只负责自己那一段
- 默认先走内容工作流，不先上复杂自动化

## 5 个角色

### 1. boss

- 唯一主入口
- 接收需求
- 决定先做哪一步
- 汇总其他 agent 的结果

### 2. material

- 保存素材
- 更新索引
- 推荐相关材料

### 3. creator

- 根据材料写大纲
- 根据大纲写初稿

### 4. thinktank

- 拆选题
- 想角度
- 想标题
- 判断内容优先级

### 5. tech

- 配置 OpenClaw
- 排查技能和脚本问题
- 处理结构升级和迁移

## 默认工作流

```text
用户
  -> boss
  -> material: 收素材
  -> material: 更新索引
  -> thinktank: 找可写角度
  -> creator: 写大纲
  -> creator: 写初稿
  -> boss: 汇总并给用户下一步建议
```

## 6 个核心 starter skills

1. `x-article-extractor`
2. `update-material-index`
3. `material-recommendation`
4. `record-inspiration`
5. `deepen-topic`
6. `generate-draft`

它们对应的是一条很具体的链路，不是抽象的空架构。

## 本地数据目录

默认数据目录：`~/Documents/openclaw-content-os-data`

```text
openclaw-content-os-data/
├── materials/
│   ├── source-articles/
│   └── index.md
├── ideas/
│   └── ideas.md
├── outlines/
├── drafts/
├── published/
└── config/
    └── style-guide.md
```

## 为什么默认不用自动发布

因为新手最容易在这里踩坑：

- token 不知道填哪
- 平台权限不清楚
- 一旦误发就是外部动作

所以这个 starter 的默认顺序是：

1. 先在本地跑通
2. 再接聊天渠道
3. 最后再接发布渠道

## 和官方概念的关系

这个仓库遵循 OpenClaw 官方模型：

- 每个 agent 一个独立 workspace
- `AGENTS.md` / `SOUL.md` / `TOOLS.md` 作为角色定义
- `openclaw.json` 负责多 agent 和工具配置
- skills 作为能力扩展

官方参考：

- <https://docs.openclaw.ai/concepts/agent-workspace>
- <https://docs.openclaw.ai/concepts/multi-agent>
- <https://docs.openclaw.ai/tools/skills>
