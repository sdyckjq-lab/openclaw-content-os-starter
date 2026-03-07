---
name: x-article-extractor
description: Save a public X or Twitter article, thread, or post as local Markdown under the starter content system. Use when the user shares a public X link and wants to keep it as source material.
---

# X Article Extractor

这是 starter 版素材入口技能。

## Goal

内容根目录默认是 `~/Documents/openclaw-content-os-data`。如果设置了 `CONTENT_OS_HOME`，以它为准。

把公开 X 链接保存到：

- `materials/source-articles/`

## Happy Path

1. 读取公开链接内容
2. 生成一个 Markdown 文件
3. 文件里至少包含：
   - 标题
   - 来源链接
   - 简短摘要
   - 正文或关键内容
4. 保存到 `materials/source-articles/`

## If You Do Not Have An Extractor Yet

先不要卡住。

可以这样做：

1. 用浏览器打开公开链接
2. 手动提取主要内容
3. 按上面的结构存成 Markdown

## Output Rule

完成后告诉用户：

- 保存路径
- 文件标题
- 下一步建议：运行 `update-material-index`
