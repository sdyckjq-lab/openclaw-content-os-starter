# OpenClaw Content OS Starter

一个面向新手的 OpenClaw 多 Agent 内容创作 starter。

它不是空壳 prompt 仓库，而是一套可以真正装起来、跑起来、扩展起来的内容生产系统骨架：

- 素材采集
- 素材索引
- 灵感记录
- 选题深化
- 初稿生成
- 可选发布

默认目标只有一个：让你先用一条命令把系统装起来，然后跑通一条最小工作流。

## Why This Repo

- 大多数 OpenClaw 示例停在配置片段
- 这个仓库直接给你一个可运行的内容工作流起点
- 默认先解决“装起来”和“第一篇内容能不能跑通”
- 复杂渠道、自动化、发布能力都放到第二阶段

## 适合谁

- 刚接触 OpenClaw
- 想做自己的内容创作系统
- 想要多 Agent，但不想先研究复杂架构

## What You Get

- 5 个角色模板：`boss`、`material`、`creator`、`thinktank`、`tech`
- 6 个公开版 starter skills
- 一套脱敏后的 `openclaw.json5` 配置模板
- 本地内容目录模板
- fresh-machine 一键安装器
- 安装后自检命令
- 面向新手的快速开始文档

## Install In One Command

分两种情况：

- 你已经装好 OpenClaw，但还没配 starter
- 你已经装好 OpenClaw CLI，连第一次 `onboard` 都还没做

这两种情况，现在都可以直接跑同一条安装命令。

本地仓库安装：

```bash
bash scripts/install.sh
```

GitHub 远程安装：

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/sdyckjq-lab/openclaw-content-os-starter/main/scripts/install.sh)
```

## Verify In One Command

安装完成后，直接运行：

```bash
bash ~/.openclaw/content-os-starter/scripts/check.sh
```

Windows:

```bat
%USERPROFILE%\.openclaw\content-os-starter\scripts\check.bat
```

它会检查这些关键项：

- `openclaw.json` 是否存在且可通过校验
- 5 个 starter agents 是否已经注册
- 5 个 workspace 模板是否在正确位置
- 6 个 starter skills 是否已经复制到 `~/.openclaw/skills`
- 内容目录是否已经创建
- `tools.agentToAgent` 是否已经补齐
- Gateway 是否在运行

如果有问题，它会直接告诉你缺哪一项。

## Reuse Existing Models

如果你已经在 OpenClaw 里跑通了一个 agent 和一个模型，这个 starter 默认不要求你再给 5 个 agent 逐个配模型。

默认规则是：

- 新增 starter agents 先继承全局默认模型
- 只有你想让某个 agent 更强、更便宜、或更偏代码时，才单独覆盖

你可以把它理解成两层：

- 全局共享：`agents.defaults.model`
- 单 agent 覆盖：`agents.list[].model`

这意味着大多数老用户都可以直接复用现有默认模型。

只有一种情况你需要额外留意：

- 如果你现在用的是某些按 agent 隔离的登录态或 auth profile
- 新 agent 可能还要补一次认证

如果你当前用的是 API key + `.env` 方式，通常最省心，也最适合这个 starter。

这个安装器会自动做这些事：

- 如果你还没有 `~/.openclaw/openclaw.json`，先自动跑一次官方 `openclaw onboard --non-interactive`
- 创建 5 个 starter agents
- 复制 5 个 workspace 模板
- 复制内容目录模板
- 安装 6 个 starter skills 到 `~/.openclaw/skills`
- 自动开启并补全 `tools.agentToAgent`
- 在新装环境里自动把 `content-boss` 设为默认入口

它不会做这些危险动作：

- 不会写入真实 token
- 不会替你开 Telegram
- 不会覆盖你现有的自定义 agent
- 不会偷偷删除你的配置

## First Install For Beginners

如果这是你的第一次安装，而且本机还没有 `openclaw.json`：

1. 安装器会先问你要用哪家模型提供商
2. 再问你 1 个 API key
3. 它会把这个 key 保存到你本机私有的 `~/.openclaw/.env`
4. 然后自动跑官方 onboarding
5. 再继续安装 starter

你不用自己手改大段 JSON。

## Recommended Providers For Chinese Users

这个 starter 现在把 provider 菜单改成了更适合中文用户的顺序。

推荐优先顺序：

1. `MiniMax`
2. `Moonshot / Kimi API`
3. `Z.AI / GLM`
4. `OpenRouter`

这些都比较适合“选一个 provider -> 输入一个 key -> 直接开跑”的路径。

另外，OpenClaw 官方还支持一些不是“输入 key 回车”形态的登录流，比如：

- `Qwen Portal`
- `MiniMax Portal`

这类更适合放在 starter 装好之后再接，因为它们属于 OAuth / Portal 登录路径，不是默认的一键 key 流。

官方文档：

- <https://docs.openclaw.ai/providers/minimax>
- <https://docs.openclaw.ai/providers/moonshot>
- <https://docs.openclaw.ai/providers/zai>
- <https://docs.openclaw.ai/providers/qwen>

## Beginner Mental Model

够。

默认设计就是：

- 你先提供 1 个 API key
- 先选 1 个默认模型
- 5 个 starter agents 先共用它

这样新手最容易跑起来。

等你以后想升级，再单独给某几个 agent 指定不同模型。

## Unattended Install

如果你不想在安装过程中手动输入，也可以提前把值放进环境变量。

国内用户更推荐从这些例子开始：

```bash
OPENCLAW_CONTENT_OS_PROVIDER=minimax \
MINIMAX_API_KEY="your-key" \
bash <(curl -fsSL https://raw.githubusercontent.com/sdyckjq-lab/openclaw-content-os-starter/main/scripts/install.sh)
```

```bash
OPENCLAW_CONTENT_OS_PROVIDER=moonshot \
MOONSHOT_API_KEY="your-key" \
bash <(curl -fsSL https://raw.githubusercontent.com/sdyckjq-lab/openclaw-content-os-starter/main/scripts/install.sh)
```

```bash
OPENCLAW_CONTENT_OS_PROVIDER=zai \
ZAI_API_KEY="your-key" \
bash <(curl -fsSL https://raw.githubusercontent.com/sdyckjq-lab/openclaw-content-os-starter/main/scripts/install.sh)
```

如果你更喜欢聚合路由，再用这个：

```bash
OPENCLAW_CONTENT_OS_PROVIDER=openrouter \
OPENROUTER_API_KEY="your-key" \
bash <(curl -fsSL https://raw.githubusercontent.com/sdyckjq-lab/openclaw-content-os-starter/main/scripts/install.sh)
```

可选：你也可以额外指定默认模型：

```bash
OPENCLAW_CONTENT_OS_PROVIDER=openai \
OPENAI_API_KEY="your-key" \
OPENCLAW_CONTENT_OS_MODEL="openai/gpt-5.2" \
bash <(curl -fsSL https://raw.githubusercontent.com/sdyckjq-lab/openclaw-content-os-starter/main/scripts/install.sh)
```

如果你要接入自定义兼容接口，也支持：

```bash
OPENCLAW_CONTENT_OS_PROVIDER=custom \
CUSTOM_API_KEY="your-key" \
OPENCLAW_CONTENT_OS_CUSTOM_BASE_URL="https://llm.example.com/v1" \
OPENCLAW_CONTENT_OS_CUSTOM_MODEL_ID="foo-large" \
bash <(curl -fsSL https://raw.githubusercontent.com/sdyckjq-lab/openclaw-content-os-starter/main/scripts/install.sh)
```

## First Successful Run

先运行自检：

```bash
bash ~/.openclaw/content-os-starter/scripts/check.sh
```

再打开 Control UI：

```bash
openclaw dashboard
```

最简单的第一条消息：

```text
帮我从一个公开链接开始，走一遍素材整理到初稿的大致流程。
```

## What This Repo Optimizes For

旧版 starter 的问题是：

- 要 clone
- 要复制模板
- 要手工 merge JSON
- 要自己判断能不能重启

这对新手太重。

现在改成安装器优先之后，用户真正要做的只剩：

1. 先装好 OpenClaw CLI
2. 跑一条安装命令
3. 打开 Control UI 开始用

这就更接近 skill 的安装体验了。

## Why Telegram Is Optional By Default

因为新手最容易卡在渠道配置。

这个仓库的默认快乐路径是：

- 先用 OpenClaw Control UI
- 先跑通工作流
- 需要时再启用 Telegram / Discord / 飞书

渠道绑定在这个仓库里是“可选示例”，不是默认必做项。

## 仓库结构

```text
openclaw-content-os-starter/
├── README.md
├── .env.example
├── .gitignore
├── templates/
│   ├── openclaw.json5.template
│   ├── workspaces/
│   └── content-system/
├── skills/
├── scripts/bootstrap/
├── docs/
└── examples/
```

## 文档入口

- `docs/quickstart.md`：10 分钟上手
- `docs/provider-guide.md`：中文用户怎么选 provider
- `docs/architecture.md`：角色和流程图
- `docs/security.md`：脱敏和安全检查
- `docs/customization.md`：怎么改成你自己的系统
- `docs/public-safe-content-contract.md`：什么绝对不能公开

## 默认角色分工

- `boss`：统一入口，拆任务，收结果
- `material`：采集素材，更新索引，找资料
- `creator`：写大纲，写初稿
- `thinktank`：想选题，想标题，想角度
- `tech`：配配置，修问题，管工具

## 默认工作流

1. `x-article-extractor`
2. `update-material-index`
3. `material-recommendation`
4. `record-inspiration`
5. `deepen-topic`
6. `generate-draft`

## 脱敏说明

这个仓库已经按“公开发布”思路设计：

- 没有真实 token
- 没有真实账号映射
- 没有真实个人路径
- 没有私有素材库内容
- 没有私有人设文件

你继续修改时，也请先看 `docs/security.md` 和 `docs/public-safe-content-contract.md`。

## 官方文档参考

- <https://docs.openclaw.ai/start/getting-started>
- <https://docs.openclaw.ai/concepts/agent-workspace>
- <https://docs.openclaw.ai/concepts/multi-agent>
- <https://docs.openclaw.ai/tools/skills>
- <https://docs.openclaw.ai/cli/agents>
- <https://docs.openclaw.ai/gateway/configuration>

## 许可证

MIT
