# Security

这个仓库是公开 starter，不是你的私有生产环境备份。

## 绝对不要提交的内容

- `~/.openclaw/openclaw.json` 的真实内容
- 任何 Bot token
- 任何 API key
- 任何真实 `allowFrom`、`chatId`、`accountId`
- 任何真实个人路径，比如 `/Users/你的名字/...`
- 真实姓名、真实邮箱、真实主机名这类可直接指向你本人的身份信息
- 私有草稿、未发布内容、真实素材库
- 真实 persona 文件

## 正确做法

- 仓库里只放 `*.template`、`*.example`
- 真正的密钥放在 `.env` 或你自己的本地配置里
- 真实渠道绑定只保留在本机 `~/.openclaw/openclaw.json`
- 如果只是想临时避免在提交里暴露真实姓名，用一次性 `GIT_AUTHOR_*` / `GIT_COMMITTER_*` 环境变量，不要直接把真实身份写进公开示例

## 发布前检查清单

- [ ] 没有真实 token
- [ ] 没有真实用户 ID
- [ ] 没有真实账号映射
- [ ] 没有 `/Users/你的名字/` 这种私有路径
- [ ] 没有真实姓名、真实邮箱、真实主机名
- [ ] 没有真实草稿和素材
- [ ] 没有私有记忆文件

## 快速自查命令

在仓库根目录执行：

```bash
grep -R "/Users/" .
grep -R "botToken" .
grep -R "apiKey" .
grep -R "allowFrom" .
grep -R "chatId" .
git log -5 --format='%h %an <%ae>'
```

如果这些结果里出现了真实值，而不是占位符，你就还没脱敏完。

## 推荐占位符格式

```text
[FILL_IN_YOUR_MODEL]
[FILL_IN_YOUR_TOKEN]
[FILL_IN_YOUR_USER_ID]
```

或使用环境变量：

```text
${OPENAI_API_KEY}
${TELEGRAM_BOT_TOKEN}
```

## 发布闸门

第一次推送到 GitHub 前，至少做这 3 件事：

1. 看 `git diff`
2. 看 `git status`
3. 再读一遍 `docs/public-safe-content-contract.md`
