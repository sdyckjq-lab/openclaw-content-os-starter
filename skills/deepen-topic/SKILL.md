---
name: deepen-topic
description: Turn one saved idea into a practical outline with sections, key points, and source references. Use when the user wants a topic expanded into a draftable structure.
---

# Deepen Topic

## Goal

内容根目录默认是 `~/Documents/openclaw-content-os-data`。如果设置了 `CONTENT_OS_HOME`，以它为准。

把一个灵感变成可写的大纲，并保存到：

- `outlines/`

## Happy Path

1. 读取灵感
2. 找相关素材
3. 生成 3 个主体小标题
4. 给每个小标题写一句核心观点
5. 标注参考素材

## Minimum Outline Format

```markdown
# 标题

## 小标题 1
- 核心观点：...
- 参考素材：...

## 小标题 2
- 核心观点：...
- 参考素材：...

## 小标题 3
- 核心观点：...
- 参考素材：...
```

## Output Rule

完成后告诉用户：

- 保存路径
- 3 个小标题是什么
- 下一步建议：运行 `generate-draft`
