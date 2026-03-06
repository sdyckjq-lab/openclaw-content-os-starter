# OpenClaw Content OS Starter

一个面向新手的 OpenClaw 多 Agent 内容创作模板。

它不是空壳 prompt 仓库，而是一套可以照着搭起来的内容生产骨架：

- 素材采集
- 素材索引
- 灵感记录
- 选题深化
- 初稿生成
- 可选发布

默认目标只有一个：让你先用一条命令把系统装起来，然后跑通一条最小工作流。

## 适合谁

- 刚接触 OpenClaw
- 想做自己的内容创作系统
- 想要多 Agent，但不想先研究复杂架构

## 这个仓库包含什么

- 5 个角色模板：`boss`、`material`、`creator`、`thinktank`、`tech`
- 6 个公开版 starter skills
- 一套脱敏后的 `openclaw.json5` 配置模板
- 本地内容目录模板
- macOS / Windows 引导脚本
- 面向新手的快速开始文档

## 先看这个：一条命令安装

前提：你已经装好 OpenClaw，并至少完成过一次 `openclaw onboard --install-daemon`。

本地仓库安装：

```bash
bash scripts/install.sh
```

发布到 GitHub 后，可以把 README 换成真正的远程一键安装：

```bash
OPENCLAW_CONTENT_OS_REPO=your-name/openclaw-content-os-starter \
  bash <(curl -fsSL https://raw.githubusercontent.com/your-name/openclaw-content-os-starter/main/scripts/install.sh)
```

这个安装器会自动做这些事：

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

最简单的第一条消息：

```text
帮我从一个公开链接开始，走一遍素材整理到初稿的大致流程。
```

## 为什么现在终于接近“一键安装”了

旧版 starter 的问题是：

- 要 clone
- 要复制模板
- 要手工 merge JSON
- 要自己判断能不能重启

这对新手太重。

现在改成安装器优先之后，用户真正要做的只剩：

1. 先装好 OpenClaw
2. 跑一条安装命令
3. 打开 Control UI 开始用

这就更接近 skill 的安装体验了。

## 为什么默认不用 Telegram

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
