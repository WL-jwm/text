# docx_comment_tool.py 使用说明

> Word 批注工具：为 `.docx` 文档添加原生批注（comment），并可移除内联 `//` 注释块。
> 支持单文档、多文档批量、目录批量三种模式。

---

## 目录

1. [环境准备](#1-环境准备)
2. [模式一：单文档批注](#2-模式一单文档批注)
3. [模式二：多文档批量（不同配置）](#3-模式二多文档批量不同配置)
4. [模式三：目录批量（相同配置）](#4-模式三目录批量相同配置)
5. [导入复用](#5-导入复用)
6. [常见问题](#6-常见问题)

---

## 1. 环境准备

```bash
# 依赖：lxml（核心）、python-docx（仅校验用，可选）
pip install lxml python-docx
```

文件位置：`docs/docx_comment_tool.py`

---

## 2. 模式一：单文档批注

**适用场景**：给一份文档的公式/代码块中关键符号挂批注说明。

### 2.1 修改配置区

编辑文件底部 `CONFIG`：

```python
CONFIG = {
    'docx_path': r"E:\path\to\your.docx",   # 目标文档（会原地覆盖，提前备份）

    # (目标文本片段, 注释内容) 列表
    'comments': [
        ("passRate",    "通过率，即通过测试占总测试的百分比（%）"),
        ("totalTests",  "测试用例总数"),
    ],

    # 定位批注所在段落：程序找第一个包含该文本的段落
    'anchor_text': 'passRate = (passedTests / totalTests)',

    # 是否移除被批注替代的旧 "// 注释" 段落（避免重复显示）
    'remove_inline': True,
    'inline_markers': ['// 通过率', '// 测试用例总数'],

    'author': '灵犀',
    'initials': 'LX',

    # 单文档模式：保持 None
    'batch': None,
}
```

### 2.2 运行

```bash
python docx_comment_tool.py
```

输出示例：
```
已添加批注: 2 条
已移除内联注释块: 2 段
文档校验通过，段落数: 120
```

---

## 3. 模式二：多文档批量（不同配置）

**适用场景**：给多份报告各挂不同批注，或不同章节文档分别处理。

### 3.1 在配置区设置 `batch`

```python
CONFIG = {
    'author': '灵犀',
    'initials': 'LX',

    # 进入批量模式：填文档 spec 列表
    'batch': [
        {
            'docx_path': r"E:\docs\报告A.docx",
            'comments': [("TDS", "溶解性总固体")],
            'anchor_text': 'TDS =',
            'remove_inline': True,
        },
        {
            'docx_path': r"E:\docs\报告B.docx",
            'comments': [("pH", "酸碱度")],
            # 该文档可覆盖作者信息
            'author': '张三',
            'initials': 'ZS',
        },
    ],
}
```

### 3.2 运行

```bash
python docx_comment_tool.py
```

输出示例：
```
批量处理结果：
  E:\docs\报告A.docx
    批注=1 移除内联块=1 状态=OK
  E:\docs\报告B.docx
    批注=1 移除内联块=0 状态=OK

总计: 2/2 个文档成功
```

**说明**：某个文档失败（如找不到锚点）会被标记 `FAIL`，但不影响其他文档继续处理。

---

## 4. 模式三：目录批量（相同配置）

**适用场景**：给一批同模板的规范/报告统一挂同一批注释，只需配置一次。

### 4.1 命令行使用

通过代码调用 `process_directory`：

```python
from docx_comment_tool import process_directory

results = process_directory(
    directory=r"E:\docs\reports",   # 目标目录
    comments=[("TDS", "溶解性总固体"), ("pH", "酸碱度")],
    anchor_text='TDS =',
    pattern='*.docx',               # 只处理 .docx
    recursive=False,                # 是否递归子目录
    remove_inline=True,
    inline_markers=['// 溶解性总固体'],
)

for r in results:
    print(r['docx_path'], '->', 'OK' if r['ok'] else r['error'])
```

### 4.2 结果字段说明

| 字段 | 含义 |
|------|------|
| `docx_path` | 文档路径 |
| `comments_added` | 添加的批注条数 |
| `blocks_removed` | 移除的内联注释块数 |
| `ok` | 是否处理成功 |
| `error` | 失败时的异常信息 |

---

## 5. 导入复用

在自己的脚本中导入函数，灵活组合：

```python
from docx_comment_tool import add_comments_to_docx, remove_inline_comment_blocks

# 只添加批注（不移除内联块）
add_comments_to_docx(
    r"E:\docs\a.docx",
    [("pH", "酸碱度")],
    anchor_text='pH =',
    author='灵犀',
)

# 只移除内联注释块
remove_inline_comment_blocks(r"E:\docs\a.docx", ['// 酸碱度'])
```

---

## 6. 常见问题

### Q1：Word 打开提示"文件损坏"？

检查是否所有 5 处部件都已更新。工具已自动处理，若手动改动需确保：
- `word/comments.xml` 与 `word/commentsExtended.xml` 存在
- `[Content_Types].xml` 声明了两个部件
- `word/_rels/document.xml.rels` 登记了两个关系

### Q2：批注栏不显示批注？

`commentsExtended.xml` 中 `paraId` 必须是 **8 位十六进制**（工具已内置合法 id 池）。缺失此文件时部分新版 Word 不渲染批注。

### Q3：找不到锚点文本？

确认 `anchor_text` 与文档中文本**完全一致**（含空格）。工具只匹配第一个出现的段落。

### Q4：批注重复？

若文档中已有旧批注又再次运行，会重复添加。如需重新生成，请从干净文档（无批注）重新处理。

### Q5：处理前要注意什么？

**文档会被原地覆盖**，务必提前备份。可在调用前 `shutil.copy` 保存原文件。

---

## 附：函数一览

| 函数 | 功能 | 适用 |
|------|------|------|
| `add_comments_to_docx()` | 单文档添加批注 | 单份文档 |
| `remove_inline_comment_blocks()` | 移除内联注释块 | 清理旧注释 |
| `batch_add_comments(specs)` | 多文档批量（不同配置） | 多份报告 |
| `process_directory(dir, ...)` | 目录批量（相同配置） | 批量同模板文档 |
