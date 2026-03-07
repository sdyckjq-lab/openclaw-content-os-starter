---
name: update-material-index
description: Scan local source articles and rebuild the materials index for the starter content system. Use when new materials were added and the user wants the library refreshed.
---

# Update Material Index

## Goal

内容根目录默认是 `~/Documents/openclaw-content-os-data`。如果设置了 `CONTENT_OS_HOME`，以它为准。

扫描：

- `materials/source-articles/`

并更新：

- `materials/index.md`

## What To Extract

每篇素材至少提取：

- 标题
- 来源
- 一句话摘要
- 2 到 5 个关键词

## Output Format

索引至少要有：

- 总数
- 最近更新时间
- 文章列表
- 关键词提示

## Output Rule

完成后告诉用户：

- 本次扫描了多少篇
- 新增了多少篇
- 下一步建议：运行 `material-recommendation`
