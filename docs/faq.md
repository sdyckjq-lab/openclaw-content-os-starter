# FAQ

## 我需要给 5 个 agent 配 5 个模型吗

不需要。

starter 的默认策略就是：

- `1` 个 provider
- `1` 个 API key
- `1` 个默认模型
- `5` 个 agent 先共用

等你跑顺了，再给个别 agent 单独换模型。

## 一个 key 怎么给 5 个 agent 用

不是每个 agent 一把 key。

而是让它们先共用全局默认模型：

- 全局共享：`agents.defaults.model`
- 单 agent 覆盖：`agents.list[].model`

如果你现在已经在 OpenClaw 里有全局默认模型，新装 starter 时大多数情况下不用重配。

## 我已经有一个能用的 OpenClaw agent 了，还要重配模型吗

大多数情况下，不用。

如果你已经有：

- 一个能正常聊天的 agent
- 一个全局默认模型

那 starter 新增的 5 个 agent 通常会直接继承它。

只有这些情况要额外留意：

- 你原来用的是按 agent 隔离的 auth profile
- 你原来用的是某种 Portal / OAuth 登录态
- 你想让某个 starter agent 单独用不同模型

## 为什么 provider 菜单没有把所有官方 provider 全放在第一层

因为小白最容易被“可选项太多”劝退。

starter 现在故意分成三层：

- 推荐提供商
- 更多提供商
- 自定义接入

第一层只保留最适合“先跑起来”的路线。

## 为什么 Qwen Portal、MiniMax Portal 没放进默认一键路径

因为它们更像 OAuth / Portal 登录流，不是最简单的“输入 key 回车”模式。

starter 的默认目标是：

- 先跑起来
- 再逐步升级

所以 Portal 路线建议放在 starter 装好后再接。

## 我是中文用户，最推荐先选谁

先按这个顺序试：

1. `MiniMax`
2. `Moonshot / Kimi API`
3. `Z.AI / GLM`
4. `OpenRouter`

如果你只想最稳地装起来，我最推荐：

- 第一优先：`MiniMax`
- 第二优先：`Moonshot / Kimi API`

## OpenRouter 适合什么人

适合这类用户：

- 还没决定长期用哪家模型
- 想先用一个 key 跑起来
- 后面可能切换很多模型

它的优点是灵活，缺点是概念会比单一 provider 多一点。

## Custom API 什么时候再考虑

当你满足下面任意一种情况时：

- 你已经有自己的中转服务
- 你用的是 starter 菜单里没有的 provider
- 你知道你的接口兼容 OpenAI 或 Anthropic

否则不建议一开始就选它。

## 这个项目会自动帮我发内容吗

不会默认自动发。

starter 的默认路径是：

- 先本地跑通工作流
- 先生成素材、大纲、初稿
- 再考虑渠道接入和发布

## Telegram 为什么不是默认路径

因为新手最容易在这里卡住：

- token 不知道怎么配
- 渠道绑定概念多
- 一旦配错就容易怀疑整个系统坏了

所以 starter 默认先推荐 Control UI。

## 安装器现在能不能顺手接入 Telegram

可以，但仍然是可选项。

现在安装器会给你两个选择：

- 现在输入 Telegram bot token，直接把私聊入口接到当前 `boss`
- 先跳过，等本地工作流跑顺了再配

这样你不用手改 `bindings` 和 `channels`，但也不会被强制卡在 Telegram 这一步。

## 我怎么完全隔离测试，不碰我现有的 OpenClaw

看：`docs/testing-sandbox.md`

那份文档是专门给你这种需求准备的。

如果你是维护这个仓库的人，再看：`docs/maintainer-safety.md`

## 我不想让公开仓库显示我的真实姓名，怎么办

先分两种情况：

1. 还没提交
2. 已经推送了

如果还没提交，最稳的是只对这一次提交临时指定身份：

```bash
GIT_AUTHOR_NAME="OpenClaw Maintainer" \
GIT_AUTHOR_EMAIL="maintainer@openclaw.invalid" \
GIT_COMMITTER_NAME="OpenClaw Maintainer" \
GIT_COMMITTER_EMAIL="maintainer@openclaw.invalid" \
git commit -m "docs: your message"
```

这不会改你的全局 Git 配置。

如果已经推送了，想把历史里的真实姓名去掉，就需要重写 Git 历史再强制推送。

这对公开仓库和默认分支都属于高风险操作，不建议随手做。

## 安装好以后，我第一句应该说什么

可以直接说：

```text
请按这个 starter 的默认流程，帮我规划一篇内容，从素材整理开始。
```

如果你想更保守一点，也可以先说：

```text
请先用一句话解释这个 starter 的 5 个角色分别负责什么。
```
