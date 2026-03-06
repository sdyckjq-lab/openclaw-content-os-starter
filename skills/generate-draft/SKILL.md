---
name: generate-draft
description: Turn an outline into a readable first draft using the local style guide and source materials. Use when the user wants a practical first version instead of a perfect final article.
---

# Generate Draft

## Goal

根据：

- `~/Documents/openclaw-content-os-data/outlines/`
- `~/Documents/openclaw-content-os-data/config/style-guide.md`
- 参考素材

生成一版初稿，保存到：

- `~/Documents/openclaw-content-os-data/drafts/<topic>/draft.md`

## Happy Path

1. 读取大纲
2. 读取风格指南
3. 把每个小标题写成一个可读段落组
4. 补上例子和细节
5. 存成初稿

## Quality Bar

- 结构清楚
- 不是只重复大纲
- 有具体例子
- 读者能看懂下一步该做什么

## Output Rule

完成后告诉用户：

- 保存路径
- 大概字数
- 下一步建议：人工改稿或准备发布
