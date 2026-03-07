# Testing In A Sandbox

这份文档的目标只有一个：

`让你在同一台电脑上测试 starter，但完全不碰你现有的 OpenClaw。`

这里的“现有 OpenClaw”包括你真实的：

- `~/.openclaw/openclaw.json`
- `~/.openclaw/.env`
- 已跑通的 agent / workspace
- 正在使用的 gateway

## 核心原则

沙箱测试必须满足这 4 条：

- 不写入你真实的 `~/.openclaw`
- 不覆盖你现在的 `openclaw.json`
- 不修改你真实的 `.env`、agent 注册和 workspace
- 不安装新的 daemon 到系统服务里
- 不占用你现有 Gateway 的默认端口

## 这个 starter 现在怎么做到隔离

我们使用：

- `OPENCLAW_HOME`
- `CONTENT_OS_HOME`
- `OPENCLAW_CONTENT_OS_SANDBOX=1`
- `OPENCLAW_CONTENT_OS_GATEWAY_PORT`

并且在沙箱模式下，安装器会：

- 使用独立目录
- 跳过 daemon 安装
- 跳过首次 gateway health 检查
- 使用单独的 Gateway 端口

## 最推荐的测试方式

macOS / Linux：

```bash
bash scripts/sandbox-test.sh
```

它会：

- 创建一个新的沙箱目录
- 给你生成一个 `enter-sandbox.sh`
- 用沙箱环境运行 starter 安装器
- 不会改动你真实的 `~/.openclaw`

## 沙箱目录长什么样

默认类似这样：

```text
~/Documents/openclaw-content-os-sandbox-20260306-210000/
├── openclaw-home/
├── content-data/
└── enter-sandbox.sh
```

## 你应该怎么跑一遍完整流程

### 第 1 步：启动沙箱安装

```bash
bash scripts/sandbox-test.sh
```

如果你本机没有沙箱配置，安装器会在沙箱里问你：

- provider 选哪个
- API key 是什么

这些都只写进沙箱目录，不碰你真实 OpenClaw。

### 第 2 步：进入沙箱环境

脚本结束后，它会打印一个 `enter-sandbox.sh` 路径。

执行：

```bash
source "/你的沙箱目录/enter-sandbox.sh"
```

执行后，这个终端里的 `openclaw` 命令就会指向沙箱配置。

### 第 3 步：先跑自检

```bash
bash "$OPENCLAW_HOME/content-os-starter/scripts/check.sh"
```

### 第 4 步：启动沙箱 Gateway

```bash
openclaw gateway run --bind loopback --port "$OPENCLAW_CONTENT_OS_GATEWAY_PORT"
```

这一步会以前台方式运行，所以不会安装系统 daemon。

### 第 5 步：开第二个终端，再次进入沙箱

```bash
source "/你的沙箱目录/enter-sandbox.sh"
```

然后打开：

```bash
openclaw dashboard
```

### 第 6 步：开始测试对话

你可以先发这句：

```text
请先用一句话解释这个 starter 的 5 个角色分别负责什么。
```

然后再发：

```text
请按这个 starter 的默认流程，帮我规划一篇内容，从素材整理开始。
```

如果你想专门验证多 agent 调度，再发这句：

```text
请做一次多 agent 调度自检：
1. 不要把 6 步全都自己做完
2. 先把素材整理交给 `<当前前缀>-material`
3. 再把选题建议交给 `<当前前缀>-thinktank`
4. 再把大纲或初稿交给 `<当前前缀>-creator`
5. 如果工具调用失败，原样告诉我错误，不要编造“其他 agent 没配置”
6. 最后用列表说明每一步实际是哪个 agent 完成的
```

## 我怎么确认没有碰到我现有的 OpenClaw

看这几个点：

- 当前终端里的 `OPENCLAW_HOME` 不是你的真实 `~/.openclaw`
- 沙箱模式不会安装 daemon
- Gateway 跑在单独端口，不是你平时默认端口
- 所有内容目录都落在 `CONTENT_OS_HOME`

## 沙箱测试完成后怎么退出

最简单的方法：

1. 关掉前台 Gateway 终端
2. 关闭或退出已经 `source enter-sandbox.sh` 的终端
3. 以后不再 `source` 那个文件，就回到你的正常环境

## 要不要删除沙箱目录

如果你只是临时测试，可以直接删整个沙箱目录。

如果你觉得这个沙箱状态还不错，也可以先保留，后面继续在里面测试。

## 重要提醒

不要在沙箱测试终端里顺手去改你真实的 `~/.openclaw`。

只要你坚持：

- 先 `source enter-sandbox.sh`
- 再执行测试命令

那整套测试就会和你现在的 OpenClaw 分开。
