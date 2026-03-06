---
name: record-inspiration
description: Save a rough idea into the local ideas inbox and attach any related materials. Use when the user shares a topic, angle, or early writing thought.
---

# Record Inspiration

## Goal

把一个灵感记录到：

- `~/Documents/openclaw-content-os-data/ideas/ideas.md`

## Happy Path

1. 生成一个短标题
2. 记录核心想法
3. 尽量补上相关素材路径
4. 标记当前状态为“待深化”

## Minimum Entry Format

```markdown
## [标题]
- 核心想法：...
- 为什么值得写：...
- 相关素材：...
- 状态：待深化
```

## Output Rule

完成后告诉用户：

- 已记录到哪个文件
- 附带了哪些素材
- 下一步建议：运行 `deepen-topic`
