---
name: material-recommendation
description: Recommend useful materials from the local index based on a topic or keyword. Use when the user asks what references they already have.
---

# Material Recommendation

## Goal

内容根目录默认是 `~/Documents/openclaw-content-os-data`。如果设置了 `CONTENT_OS_HOME`，以它为准。

根据关键词，从：

- `materials/index.md`

里找出最相关的素材。

## Happy Path

1. 提取用户关键词
2. 搜索索引
3. 返回最相关的 3 到 5 条
4. 每条都带：
   - 标题
   - 简短摘要
   - 本地路径

## Output Rule

完成后告诉用户：

- 找到了几条
- 哪几条最值得先读
- 下一步建议：`record-inspiration` 或 `deepen-topic`
