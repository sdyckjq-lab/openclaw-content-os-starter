# Provider Guide

这份文档只回答一个问题：

`我是小白，现在到底该选哪个 provider？`

如果你不想研究太多，先记住 starter 的默认策略：

- 先只选 `1` 个 provider
- 先只填 `1` 个 API key
- 先只用 `1` 个默认模型
- 让 `5` 个 starter agents 先共用它

不要一开始就给每个 agent 配不同模型。

## 最短结论

如果你只想先跑起来，按这个顺序选：

1. `MiniMax`
2. `Moonshot / Kimi API`
3. `Z.AI / GLM`
4. `OpenRouter`

这 4 个就是当前 starter 最推荐的第一层选项。

## 怎么选

### 方案 A：我想最稳地先跑起来

优先选：`MiniMax`

为什么：

- 对中文用户更友好
- 官方文档支持清楚
- 支持 API key 路线
- 也支持 Portal / OAuth 路线
- 适合先走 starter 的默认一键安装流程

适合你如果：

- 你在国内
- 你不想先折腾太多平台差异
- 你只想先把多 agent 跑通

## 方案 B：我已经习惯 Kimi

优先选：`Moonshot / Kimi API`

为什么：

- 国内用户很熟
- 官方文档支持 `moonshot-api-key`
- 直接输入 key 就能接

注意：

- `Moonshot API` 和 `Kimi Coding` 不是同一个 provider
- key 也不是完全通用
- starter 默认走的是更简单的 `moonshot-api-key` 路线

## 方案 C：我更想走 GLM 路线

优先选：`Z.AI / GLM`

为什么：

- 官方支持 `zai-api-key`
- 接法简单
- 对中文用户也比较友好

适合你如果：

- 你本来就更偏向 GLM 系列
- 你希望走一个官方文档比较清楚的 API key 路线

## 方案 D：我不确定以后想用哪个模型

优先选：`OpenRouter`

为什么：

- 一个 key 可以接很多模型
- 对“先跑通，再换模型”很方便
- 特别适合你现在还没决定长期用哪家

代价：

- 概念会比单一 provider 多一点
- 你以后还是需要慢慢理解模型路由和费用

## 什么情况下不建议一开始选这些

### `OpenAI`

不是不能用，而是对中文用户来说，不一定是 starter 默认第一推荐。

如果你已经在用 OpenAI，当然可以直接用。

### `Anthropic`

也不是不能用。

但对很多中文新手来说，接入和使用环境通常没有前面几种顺手。

### `Gemini`

适合已经在 Google 生态里的人。

如果你本来就在用 Gemini，可以直接选；否则 starter 不把它放在第一优先位。

## 那 Qwen Portal、MiniMax Portal 怎么办

它们是官方支持的。

但它们不是“输入 key 回车”这种最简单的第一层路径，而更像：

- 先完成 starter 安装
- 再补 Portal / OAuth 登录

所以 starter 里没有把它们做成第一层默认菜单。

这是故意的，不是漏掉了。

原因很简单：

- 小白更容易先被 OAuth / Portal 登录绕晕
- starter 的第一目标是“跑起来”
- 不是“第一天就把所有官方接法全学会”

## 如果我已经有一个能跑的 agent 和模型了

大多数情况下，你不用重新给 5 个 starter agent 再配一遍模型。

默认规则是：

- 新增 starter agents 先继承全局默认模型
- 只有想做细分优化时，才给单个 agent 覆盖模型

也就是：

- 全局共享：`agents.defaults.model`
- 单 agent 覆盖：`agents.list[].model`

最省心的老用户状态是：

- 你已经用 API key + `.env`
- 你已经有全局默认模型

这种情况下，starter 最容易直接接上。

## 什么时候可能没法直接复用

如果你原来用的是：

- 某些按 agent 隔离的 auth profile
- 某些 Portal / OAuth 登录态

那你新加 agent 后，模型名字虽然能继承，但认证可能还要补一次。

这不是 starter 特有问题，而是多 agent 认证隔离带来的正常现象。

## 自定义兼容接口什么时候用

如果你满足下面任意一种情况，再考虑 `Custom API`：

- 你已经有自己的中转服务
- 你用的是官方菜单里没有的 provider
- 你知道你的接口兼容 OpenAI 或 Anthropic

这不是第一推荐给小白的路线。

但对已经有现成 API 网关的人，非常有用。

## 我给你的实际推荐

如果你是中文新手，按这个顺序试：

1. `MiniMax`
2. `Moonshot / Kimi API`
3. `Z.AI / GLM`
4. `OpenRouter`

如果你只是想把这个 starter 最快装起来，我最推荐：

- 第一优先：`MiniMax`
- 第二优先：`Moonshot / Kimi API`

## 官方文档

- MiniMax：<https://docs.openclaw.ai/providers/minimax>
- Moonshot：<https://docs.openclaw.ai/providers/moonshot>
- Z.AI：<https://docs.openclaw.ai/providers/zai>
- Qwen：<https://docs.openclaw.ai/providers/qwen>
- Onboard：<https://docs.openclaw.ai/cli/onboard>
- Gateway config：<https://docs.openclaw.ai/gateway/configuration>
