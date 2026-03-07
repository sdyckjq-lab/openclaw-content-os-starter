# Quickstart

这份 quickstart 只追求一件事：让你先用一条命令装好，再跑通一次。

## 第 0 步：先装好 OpenClaw CLI

按官方文档完成安装和初始化：

1. 安装 OpenClaw
2. 如果你已经跑过 `onboard`，很好
3. 如果你还没跑过，也没关系，安装器现在会帮你补这一步

官方文档：<https://docs.openclaw.ai/start/getting-started>

## 第 1 步：执行安装命令

当前默认 preset 是：`content-basic`。

如果你已经在仓库目录里：

```bash
bash scripts/install.sh
```

如果你想显式写出来，也可以：

```bash
bash scripts/install.sh --preset content-basic
```

如果这个项目已经发布到 GitHub，可以用远程安装方式：

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/sdyckjq-lab/openclaw-content-os-starter/main/scripts/install.sh)
```

## 第 2 步：安装器会自动完成什么

- 如果你已经有可用的 OpenClaw 配置和默认模型，直接复用，不再要求你重新输入 API key
- 如果你还是第一次使用 OpenClaw，会先自动完成一次官方 onboarding
- 安装 `content-basic` preset
- 创建 5 个 starter agents
- 复制 workspace 模板
- 在 `CONTENT_OS_HOME`（默认 `~/Documents/openclaw-content-os-data`）准备本地内容目录模板
- 安装 6 个 starter skills
- 自动补全 `tools.agentToAgent`
- 在全新环境里把当前前缀的 `-boss` 设成默认入口
- 复制一个安装后自检命令到 `~/.openclaw/content-os-starter/scripts/check.sh`

## 第 3 步：安装器不会做什么

- 不会把你的真实密钥写进这个公开仓库；如果你提供 API key，只会写到本机私有的 `~/.openclaw/.env`
- 不会自动接入 Telegram
- 不会自动帮你发布内容
- 不会覆盖你现有的复杂自定义配置

## 第 4 步：第一次安装时怎么提供 API key

如果你本机还没有 OpenClaw 配置，安装器会直接问你两件事：

1. 你要用哪家模型提供商
2. 你的 API key 是什么

现在 provider 菜单已经把中文用户更常用的路线放前面了：

- `MiniMax`
- `Moonshot / Kimi API`
- `Z.AI / GLM`
- `OpenRouter`

输入后，安装器会把 key 存到你本机私有的：

- `~/.openclaw/.env`

不会写进这个公开仓库。

如果你不想在安装时手输，也可以提前这样写：

```bash
OPENCLAW_CONTENT_OS_PROVIDER=minimax \
MINIMAX_API_KEY="your-key" \
bash <(curl -fsSL https://raw.githubusercontent.com/sdyckjq-lab/openclaw-content-os-starter/main/scripts/install.sh)
```

如果你要用自定义兼容接口：

```bash
OPENCLAW_CONTENT_OS_PROVIDER=custom \
CUSTOM_API_KEY="your-key" \
OPENCLAW_CONTENT_OS_CUSTOM_BASE_URL="https://llm.example.com/v1" \
OPENCLAW_CONTENT_OS_CUSTOM_MODEL_ID="foo-large" \
bash <(curl -fsSL https://raw.githubusercontent.com/sdyckjq-lab/openclaw-content-os-starter/main/scripts/install.sh)
```

## 第 5 步：先运行安装后自检

```bash
bash ~/.openclaw/content-os-starter/scripts/check.sh
```

Windows:

```bat
%USERPROFILE%\.openclaw\content-os-starter\scripts\check.bat
```

如果有失败项，先按提示修掉。

如果只有 warning，通常已经可以继续往下走。

如果你暂时不想做首次 onboarding，也可以先退出：

```bash
bash scripts/install.sh --skip-onboard
```

## 第 6 步：先走最简单入口

用 Control UI，而不是先配 Bot。

```bash
openclaw dashboard
```

然后先和 `boss` 说一句简单的话：

```text
请按这个 starter 的默认流程，帮我规划一篇内容，从素材整理开始。
```

## 第 7 步：判断你是否成功

如果下面 3 件事都正常，就说明 starter 已经装好了：

1. 你能在 `~/.openclaw/` 看到 5 个新 workspace
2. 你能在 `CONTENT_OS_HOME` 指向的目录里看到内容目录；如果你没改过，它默认就是 `~/Documents/openclaw-content-os-data/`
3. `bash ~/.openclaw/content-os-starter/scripts/check.sh` 没有报 failed
4. 当前默认 boss agent 能解释 5 个角色和 6 步工作流

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

### 我已经有一个 agent 和模型了，还需要给 5 个 starter agent 单独再配一次吗

大多数情况下，不需要。

如果你现在已经有：

- 一个能正常聊天的 OpenClaw agent
- 一个已经配置好的全局默认模型

那 starter 新加的 5 个 agent 通常可以直接继承这个默认模型。

只有在这些情况下，你才可能需要额外动作：

- 你原来用的是按 agent 隔离的登录态
- 你想让某个 starter agent 单独用不同模型

如果你原来用的是 API key + `.env` 路线，一般最省事。

### 那 Qwen Portal、MiniMax Portal 这类官方登录流怎么办

OpenClaw 官方支持它们。

但它们不属于“输入 key 回车”的默认路径，所以 starter 安装器没有把它们放进第一层菜单。

建议顺序是：

1. 先用 API key 路线把 starter 装好
2. 再按官方文档接 Portal / OAuth 登录流

### 我不想一开始就开自动化

完全正确。`cron` 和 `bindings` 都是可选项。

## 下一步

- 看 `docs/provider-guide.md`
- 看 `docs/testing-sandbox.md`
- 看 `docs/faq.md`
- 看 `docs/architecture.md`
- 看 `examples/first-prompts.md`
- 想改成自己的风格时，看 `docs/customization.md`
