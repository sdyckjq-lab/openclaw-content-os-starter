# Customization

这个 starter 的目标不是让你照抄到底，而是让你先跑起来，再慢慢换成自己的系统。

## 最推荐的改法顺序

### 第 1 层：先不改结构

先保持：

- 5 个角色名字
- 6 步工作流
- 默认数据目录

把一篇内容跑通后，再改。

### 第 2 层：再改风格

优先改这些：

- `templates/content-system/config/style-guide.md`
- 各 workspace 里的 `SOUL.md`
- 各 workspace 里的 `TOOLS.md`

### 第 3 层：最后改渠道

等你已经能稳定生成内容后，再加：

- Telegram
- Discord
- 飞书
- 自动发布

## 如果你只想先用一个 agent

完全可以。

最简单的方式：

1. 只保留 `boss` workspace
2. 让 `boss` 先自己模拟执行 6 个步骤
3. 以后再拆成 5 个 agent

## 如果你想改数据目录

默认是：`~/Documents/openclaw-content-os-data`

如果你想改成别的路径，请统一修改：

- `templates/content-system/`
- `skills/` 里的 starter skill 说明
- 你本地复制后的 workspace `TOOLS.md`

不要只改一处。

## 如果你想增加发布能力

建议顺序：

1. 先人工复制草稿去发布
2. 再接 Markdown 转 HTML
3. 最后再接真实平台 API 或浏览器自动化

这样出错成本最低。

## 如果你想换角色名字

可以，但不建议一开始就换。

原因很简单：

- 文档会跟不上
- skill 描述会混乱
- 新手最容易把自己绕晕

先跑通，再重命名。
