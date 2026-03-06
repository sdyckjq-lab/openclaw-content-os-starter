# Workflow: Update Material Index

## 目标

让新增素材可以被后续步骤找到。

## 输入

- `materials/source-articles/` 里的 Markdown 文件

## 输出

- 更新后的 `materials/index.md`

## 最小步骤

1. 扫描素材目录
2. 提取标题和摘要
3. 写入索引
4. 更新最后刷新时间

## 完成标准

- 索引里的文章数量正确
- 新增内容能被搜索到
