# TOOLS.md

## Default Data Root

- `~/Documents/openclaw-content-os-data`

## Preferred Flow

1. `x-article-extractor`
2. `update-material-index`
3. `material-recommendation`
4. `record-inspiration`
5. `deepen-topic`
6. `generate-draft`

## Multi-Agent Dispatch

- `sessions_list` 和 `sessions_send` 面向 session，不面向已配置 agent
- 不要用 `sessions_send(sessionKey="content-material", ...)` 这种写法；`content-material` 是 agentId，不是 sessionKey
- 需要调用已配置角色时，优先用 `sessions_spawn`，并显式传 `agentId`
- 推荐分工：`content-material` 负责素材，`content-thinktank` 负责选题和角度，`content-creator` 负责大纲和初稿，`content-tech` 负责配置和排障
- 如果 `sessions_spawn` 明确报错，再保留原始报错并回退到当前 agent 直接用 skills 完成
- 不要把“没有看到其他 session”解释成“其他 agent 没配置”

## Beginner Rule

- Default to Control UI first
- Treat Telegram and publishing as optional
