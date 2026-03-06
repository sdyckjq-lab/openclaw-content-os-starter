# Quickstart

这份 quickstart 只追求一件事：让你先用一条命令装好，再跑通一次。

## 第 0 步：先装好 OpenClaw CLI

按官方文档完成安装和初始化：

1. 安装 OpenClaw
2. 如果你已经跑过 `onboard`，很好
3. 如果你还没跑过，也没关系，安装器现在会帮你补这一步

官方文档：<https://docs.openclaw.ai/start/getting-started>

## 第 1 步：执行安装命令

如果你已经在仓库目录里：

```bash
bash scripts/install.sh
```

如果这个项目已经发布到 GitHub，可以用远程安装方式：

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/sdyckjq-lab/openclaw-content-os-starter/main/scripts/install.sh)
```

## 第 2 步：安装器会自动完成什么

- 如果你还是第一次使用 OpenClaw，会先自动完成一次官方 onboarding
- 创建 5 个 starter agents
- 复制 workspace 模板
- 复制本地内容目录模板
- 安装 6 个 starter skills
- 自动补全 `tools.agentToAgent`
- 在全新环境里把 `content-boss` 设成默认入口

## 第 3 步：安装器不会做什么

- 不会写入你的真实密钥
- 不会自动接入 Telegram
- 不会自动帮你发布内容
- 不会覆盖你现有的复杂自定义配置

## 第 4 步：第一次安装时怎么提供 API key

如果你本机还没有 OpenClaw 配置，安装器会直接问你两件事：

1. 你要用哪家模型提供商
2. 你的 API key 是什么

输入后，安装器会把 key 存到你本机私有的：

- `~/.openclaw/.env`

不会写进这个公开仓库。

如果你不想在安装时手输，也可以提前这样写：

```bash
OPENCLAW_CONTENT_OS_PROVIDER=gemini \
GEMINI_API_KEY="your-key" \
bash <(curl -fsSL https://raw.githubusercontent.com/sdyckjq-lab/openclaw-content-os-starter/main/scripts/install.sh)
```

## 第 5 步：先走最简单入口

用 Control UI，而不是先配 Bot。

```bash
openclaw dashboard
```

然后先和 `boss` 说一句简单的话：

```text
请按这个 starter 的默认流程，帮我规划一篇内容，从素材整理开始。
```

## 第 6 步：判断你是否成功

如果下面 3 件事都正常，就说明 starter 已经装好了：

1. 你能在 `~/.openclaw/` 看到 5 个新 workspace
2. 你能在 `~/Documents/openclaw-content-os-data/` 看到内容目录
3. `content-boss` 能解释 5 个角色和 6 步工作流

## 最小建议

第一次使用时，只做这三件事：

1. 用浏览器聊天
2. 只让 `boss` 作为入口
3. 先跑通一篇内容的流程，再考虑 Telegram 和自动发布

## 常见卡点

### 我没有 Bot

没关系。默认就不要求 Bot。

### 我为什么不需要手工改 JSON 了

因为安装器已经自动做了最小必要配置。

手工 merge 现在降级成高级用户排障手段，不再是主路径。

### 我没有 5 个模型

也没关系。先让多个 agent 共用一个模型。

### 一个 key 怎么给 5 个 agent 用

默认不是“一人一把 key”。

而是：

- 1 个 key
- 1 个默认模型
- 5 个 agent 先共享

等你以后更熟了，再给 `thinktank` 或 `tech` 单独换模型。

### 我不想一开始就开自动化

完全正确。`cron` 和 `bindings` 都是可选项。

## 下一步

- 看 `docs/architecture.md`
- 看 `examples/first-prompts.md`
- 想改成自己的风格时，看 `docs/customization.md`
