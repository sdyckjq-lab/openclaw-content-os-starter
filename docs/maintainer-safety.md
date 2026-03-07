# Maintainer Safety

这份文档只服务一件事：

`你在维护这个 starter 时，既不要碰坏真实 OpenClaw，也不要把自己的真实信息带进公开仓库。`

## 默认原则

- 把真实 `~/.openclaw` 当成已经跑通的正式环境
- 安装、自检、gateway、agent 注册、模板合并，默认都不要先在真实环境验证
- 能用只读检查就先只读检查
- 需要动安装流程时，优先走沙箱

## 最推荐的验证顺序

在仓库根目录按这个顺序走：

1. `bash scripts/bootstrap-test.sh`
2. `bash scripts/sandbox-test.sh`
3. `bash "$OPENCLAW_HOME/content-os-starter/scripts/check.sh"`

只有你明确知道影响范围，而且用户确认过风险，才考虑碰真实 `~/.openclaw`。

## 默认不要直接动的真实文件

- `~/.openclaw/openclaw.json`
- `~/.openclaw/.env`
- 真实 workspace
- 真实 agent 注册
- 正在使用的 gateway

## 提交前要多看一眼的风险

- 终端输出里有没有真实姓名、真实邮箱、主机名
- 示例路径里有没有 `/Users/你的名字/` 这种真实路径
- 截图里有没有真实账号、真实目录、真实聊天内容
- 文档里有没有把“沙箱验证”写成“直接改真实环境”

## 如果你不想在提交记录里暴露真实姓名

这个仓库不会自动修改你的 Git 配置。

如果你只是想做一次临时匿名提交，可以只对当前这一次命令加环境变量：

```bash
GIT_AUTHOR_NAME="OpenClaw Maintainer" \
GIT_AUTHOR_EMAIL="maintainer@openclaw.invalid" \
GIT_COMMITTER_NAME="OpenClaw Maintainer" \
GIT_COMMITTER_EMAIL="maintainer@openclaw.invalid" \
git commit -m "docs: your message"
```

这只是本次命令生效，不会改你的全局 Git 配置。

## 如果真实姓名已经出现在已推送提交里

要移除已经推送出去的提交身份，需要：

1. 重写 Git 历史
2. 强制推送远程分支

这属于高风险操作，尤其是默认分支。

如果不是特别确定，先不要为了“顺手改一下”去重写公开历史。

## 发布前最小检查

```bash
git status
git diff --stat
git log -5 --format='%h %an <%ae>'
grep -R "/Users/" docs templates skills
```

如果这里面出现真实身份、真实路径或真实配置，再发布就不安全。
