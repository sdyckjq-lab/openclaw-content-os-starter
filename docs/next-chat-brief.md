# 下次对话速览

## 这是什么项目

这是一个公开版 `OpenClaw Content OS Starter`。

目标是：

- 让新手一键装好
- 自动得到 5 个内容工作流 agent
- 默认用 1 个 provider、1 个 key、1 个模型先跑通
- 支持完全隔离的 sandbox 测试
- 绝不碰用户真实 `~/.openclaw`

## 当前状态

- GitHub 仓库已发布并可用
- 一键安装、fresh install、自检、sandbox 测试都已做好
- 默认入口已修成 `content-boss`
- starter 多 agent 调度问题已补强
- 当前最新提交：`e2811de` `fix: enable starter agent delegation`

## 已知关键点

- 聊天里的 `/agents` 不是“配置 agent 列表”，而是“当前会话绑定 agent”
- `sessions_send` 需要的是 `sessionKey`，不是 `agentId`
- 跨 agent 调度时，`content-boss` 应优先用 `sessions_spawn(agentId=...)`
- 如果调度失败，才回退成 boss 自己直接调用 shared skills

## 明天优先做什么

先不要乱改代码，先复测。

### 1. 更新代码

```bash
cd ~/Desktop/openclaw-content-os-starter && git pull
```

### 2. 进入当前主测试沙箱

```bash
SANDBOX_DIR="$HOME/Documents/openclaw-content-os-sandbox-20260306-223109"
source "$SANDBOX_DIR/enter-sandbox.sh"
source "$OPENCLAW_HOME/.env"
export ZAI_API_KEY
```

### 3. 启动沙箱 gateway

```bash
openclaw gateway run --bind loopback --port "$OPENCLAW_CONTENT_OS_GATEWAY_PORT"
```

### 4. 另开一个终端打开 dashboard

```bash
SANDBOX_DIR="$HOME/Documents/openclaw-content-os-sandbox-20260306-223109"
source "$SANDBOX_DIR/enter-sandbox.sh"
source "$OPENCLAW_HOME/.env"
export ZAI_API_KEY

openclaw dashboard
```

### 5. 新建一个全新会话，发这句

```text
请做一次多 agent 调度自检：
1. 不要把 6 步全都自己做完
2. 先把素材整理交给 `content-material`
3. 再把选题建议交给 `content-thinktank`
4. 再把大纲或初稿交给 `content-creator`
5. 如果工具调用失败，原样告诉我错误，不要编造“其他 agent 没配置”
6. 最后用列表说明每一步实际是哪个 agent 完成的
```

## 如果明天要让别的 AI 接手

直接把下面这段发给它：

```text
请先阅读 `~/Desktop/openclaw-content-os-starter/docs/next-chat-brief.md`。

我的目标：把这个 OpenClaw 内容创作 starter 继续维护成适合小白的一键安装项目。

硬要求：
1. 所有交流都用简体中文
2. 一定要新手友好
3. 一定要脱敏
4. 绝对不要动我真实的 `~/.openclaw`
5. 测试只能在 sandbox 里进行

先检查：
- 仓库状态
- 当前 sandbox 是否还可用
- `content-boss` 的多 agent 调度是否已经跑通

如果没跑通，优先修最小问题，不要大改架构。
```

## 不要做的事

- 不要删除用户真实 `~/.openclaw`
- 不要停止本地正式 gateway
- 不要把临时验证问题误判成 starter 完全失效
- 不要一上来重构整个项目
