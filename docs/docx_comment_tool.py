# -*- coding: utf-8 -*-
"""
Word 批注工具模板 (docx_comment_tool.py)
========================================
合并自 add_comments.py + remove_inline_comments.py，
用于为 Word 文档(.docx) 添加原生批注(comment)，并可移除内联 // 注释块。

适用场景
--------
- 给公式 / 代码块中的关键符号挂批注说明
- 批量把文档中的内联注释(如 "// 说明") 转换为 Word 边栏批注
- 生成技术规范、评审文档时增强可读性

依赖
----
- lxml           : 解析 / 修改 OOXML（核心）
- python-docx    : 仅用于最终打开校验（可选）

用法
----
按需修改下方【配置区】后直接运行：
    python docx_comment_tool.py
或导入复用：
    from docx_comment_tool import add_comments_to_docx, remove_inline_comment_blocks

关于 Word 批注(comment) 的 OOXML 结构
------------------------------------
Word 文档本质上是一个 ZIP 包（OOXML）。给一段文字挂批注，需要改动 5 处：

1. word/comments.xml            批注内容本体（每条含 id、作者、正文文本）
2. word/commentsExtended.xml    批注扩展属性（记录 paraId、是否已"解决"），
                                缺省时部分版本(尤其新版 Word)可能不显示批注
3. [Content_Types].xml          声明新增两个部件的内容类型(ContentType)，
                                否则包校验不通过
4. word/_rels/document.xml.rels 为两个新部件登记关系(Relationship)，
                                并分配唯一的 rId
5. word/document.xml            在正文中插入三要素：
    - <w:commentRangeStart>      批注起点（在目标文字之前）
    - <w:commentRangeEnd>        批注终点（在目标文字之后）
    - <w:commentReference>       批注引用标记（一个独立的 run，Word 用它
                                 在边栏/标记区显示批注气泡）

本工具正是按上述 5 个步骤逐一构造并写回。
"""

import zipfile
import copy
from lxml import etree

# ═══════════════════════════════════════════════════════════════
#  命名空间常量
# ═══════════════════════════════════════════════════════════════
# OOXML 使用大量 XML 命名空间。这里集中定义，避免各处硬编码。
# W_NS   : 主文档命名空间（几乎所有正文元素都属于它）
# W15_NS : Word 2012+ 扩展（commentsExtended 使用）
# R_NS   : 关系(relationship)类型命名空间
W_NS   = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W15_NS = 'http://schemas.microsoft.com/office/word/2012/wordml'
R_NS   = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
# w:t 中保留空格需要用 xml:space="preserve"，否则多个空格会被折叠
XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'

# lxml 中所有操作都要带花括号前缀命名空间，预生成便于拼接
W = '{%s}' % W_NS
W15 = '{%s}' % W15_NS


# ═══════════════════════════════════════════════════════════════
#  配置区：按需修改
# ═══════════════════════════════════════════════════════════════
CONFIG = {
    # ── 单文档模式配置（batch 为 None 时生效）──

    # 目标 docx 文件的绝对路径（会被原地覆盖，请提前备份）
    'docx_path': r"E:\OWNclaw\20260509-21-58-28-174\frontend\docs\开发文档汇编.docx",

    # 批注定义：[(目标文本片段, 注释内容), ...]
    # 工具会在含 anchor_text 的段落中逐一定位这些片段并挂批注。
    # 说明：若某片段在段落中出现多次，只会挂到第一次出现的位置。
    # 恢复原来的 5 条批注（与备份文件 开发文档汇编_备份带批注.docx 一致）
    'comments': [
        ("passRate",    "通过率，即通过测试占总测试的百分比（%），数值越高说明质量越可靠"),
        ("passedTests", "通过的测试用例数：即 totalTests 中未失败的用例数量"),
        ("totalTests",  "测试用例总数：本次全量回归运行的全部用例数（含通过的与失败的）"),
        ("× 100%",      "将比率转换为百分比形式，便于直观比较"),
        ("passedTests = totalTests - failedTests",
                         "通过的测试用例数 = 总测试用例数 - 失败的测试用例数（failedTests ≥ 0）"),
    ],

    # 锚点文本：用于从整篇文档中定位承载批注的段落。
    # 程序会扫描正文，找到第一个包含该文本的段落作为批注挂载点。
    # 若置空(None/'')，则不做段落定位（需自行扩展逻辑）。
    'anchor_text': 'passRate = (passedTests / totalTests)',

    # 是否移除内联注释块：段落文本包含以下任一特征字符串时，整段删除。
    # 用于清除被批注替代的旧 "// 说明" 段落，避免边栏批注与行内注释重复。
    # 该文档此前已移除内联注释块，此处保持 False 避免误删正文。
    'remove_inline': False,
    'inline_markers': ['// 通过率', '// 赋值运算符', '// 测试用例总数', '// 减去失败'],

    # 批注作者信息（显示在 Word 批注栏的作者列）
    'author': '灵犀',
    'initials': 'LX',  # 作者缩写（新版 Word 批注角标显示）

    # ── 批量模式配置（可选）──
    # 若启用 batch，将忽略上方单文档字段，改用本列表批量处理。
    # 每个元素是一个文档的 spec，键同 batch_add_comments 说明：
    #   docx_path / comments 必填；anchor_text / remove_inline /
    #   inline_markers 可选；author / initials 可选(缺省用全局值)。
    # 批量模式已启用：处理 docs 目录下的两份实际文档
    # 注意：开发文档汇编.docx 此前已挂过批注，再次运行会重复添加，
    #       如需干净结果请先从无批注的源文件重新生成。
    'batch': None  # 单文档模式：批注上面 comments 定义的 5 条
    # 如需批量处理多份文档，取消注释并填入各文档 spec（见下方参考）：
    # 'batch': [
    #     {
    #         'docx_path': r"E:\path\to\开发文档汇编.docx",
    #         'comments': [("passRate", "通过率说明")],
    #         'anchor_text': 'passRate',
    #     },
    # ],
}


# ═══════════════════════════════════════════════════════════════
#  内部工具函数（不建议直接调用）
# ═══════════════════════════════════════════════════════════════

def _esc(s):
    """对字符串做 XML 转义，防止特殊字符破坏文档结构。

    OOXML 是 XML，其中 & < > " 是保留字符，若注释文本含这些字符
    必须先转义为实体，否则生成的 comments.xml 会变成非法 XML。
    """
    return (s.replace('&', '&amp;').replace('<', '&lt;')
             .replace('>', '&gt;').replace('"', '&quot;'))


def _split_run(line_el, rpr, parts):
    """把一个 w:r（run）的文本按 parts 拆分成多个 run。

    WHY：一个 run 内部只能有一个 w:t 文本节点。若要在同一 run 的文本中
    只给其中一部分挂批注，就必须先把它拆成多个 run，让目标子串独占一个 run。

    参数
    ----
    line_el : lxml 元素，原 w:r
    rpr     : 原 run 的 <w:rPr>（复制到每个拆分出的新 run，保持格式一致）
    parts   : [(text, comment_id_or_None), ...]，text 为拆分出的文本片段，
              comment_id 为该片段要挂的批注 id（None 表示不挂批注）

    返回
    ----
    [(新 w:r 元素, comment_id_or_None), ...]
    """
    t_el = line_el.find(W + 't')
    assert t_el is not None, 'run 中没有 w:t'
    parent = line_el.getparent()
    idx = parent.index(line_el)
    new_runs = []
    for text, cid in parts:
        r = etree.Element(W + 'r')
        if rpr is not None:
            r.append(copy.deepcopy(rpr))  # 深拷贝，避免多个 run 共享同一 rPr 对象
        nt = etree.SubElement(r, W + 't')
        nt.set(XML_SPACE, 'preserve')  # 保留空白，防止被折叠
        nt.text = text
        new_runs.append((r, cid))
    parent.remove(line_el)  # 删除原 run
    for j, (r, _cid) in enumerate(new_runs):
        parent.insert(idx + j, r)  # 按原位置依次插回
    return new_runs


def _wrap_comment(run_el, cid):
    """在给定 run 周围插入批注三要素。

    这是批注在正文中的呈现方式：
      [commentRangeStart] [目标run] [commentRangeEnd] [commentReference run]

    顺序解释（注意插入位置依赖索引的微妙关系）：
    - idx     : 目标 run 当前索引
    - 插 commentRangeStart 到 idx   （start 在目标之前）
    - 插 commentRangeEnd 到 idx+2   （跳过目标 run 与 start）
    - 插 commentReference 到 idx+3  （reference 放在 end 之后）

    WHY：commentReference 必须是一个独立 run，Word 靠它确定边栏批注
    气泡挂在哪一行；commentRangeStart/End 共同圈定高亮覆盖的文字范围。
    """
    parent = run_el.getparent()
    idx = parent.index(run_el)

    # 1. 批注起点：放在目标 run 之前
    cs = etree.Element(W + 'commentRangeStart')
    cs.set(W + 'id', cid)
    parent.insert(idx, cs)

    # 2. 批注终点：放在目标 run 之后（跳过 start，即 idx+2）
    ce = etree.Element(W + 'commentRangeEnd')
    ce.set(W + 'id', cid)

    # 3. 批注引用：一个独立 run，放在 end 之后（idx+3）
    ref_r = etree.Element(W + 'r')
    rpr = run_el.find(W + 'rPr')
    if rpr is not None:
        ref_r.append(copy.deepcopy(rpr))  # 复制格式，保证引用标记显示正常
    ref = etree.SubElement(ref_r, W + 'commentReference')
    ref.set(W + 'id', cid)

    parent.insert(idx + 2, ce)
    parent.insert(idx + 3, ref_r)


# ═══════════════════════════════════════════════════════════════
#  主功能
# ═══════════════════════════════════════════════════════════════

def add_comments_to_docx(docx_path, comments, anchor_text=None,
                         author='灵犀', initials='LX'):
    """向 docx 添加 Word 批注。

    在含 anchor_text 的段落中，将 comments 中每个目标片段包裹成批注。
    涉及 OOXML 包的全部 5 处改动（见模块顶部结构说明）。

    参数
    ----
    docx_path   : 目标 docx 文件路径（会被原地覆盖）
    comments    : [(目标文本片段, 注释内容), ...]
    anchor_text : 承载批注的段落锚点（用于定位段落），可空
    author      : 批注作者名
    initials    : 批注作者缩写

    返回
    ----
    int : 实际添加的批注条数
    """
    # 先读取 docx 包内全部部件到内存（ZIP 不能直接原地改，需整体重写）
    with zipfile.ZipFile(docx_path) as z:
        contents = {n: z.read(n) for n in z.namelist()}

    # ── 第 1 步：构造批注定义，自动分配递增 id ──
    # 注意：id 必须与后面 document.xml 中 commentRangeStart/End/Reference 的 id 一一对应
    comment_defs = []
    for i, (_target, text) in enumerate(comments):
        comment_defs.append((str(i), text))

    # ── 第 2 步：写入 word/comments.xml（批注内容本体）──
    entries = ''
    for cid, text in comment_defs:
        entries += (
            f'<w:comment w:id="{cid}" w:author="{_esc(author)}" w:initials="{_esc(initials)}" '
            f'w:date="2026-01-01T00:00:00Z">'
            f'<w:p><w:r><w:rPr><w:rFonts w:ascii="Microsoft YaHei" w:eastAsia="Microsoft YaHei"/>'
            f'<w:sz w:val="18"/></w:rPr>'
            f'<w:t xml:space="preserve">{_esc(text)}</w:t></w:r></w:p>'
            f'</w:comment>'
        )
    contents['word/comments.xml'] = (
        f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        f'<w:comments xmlns:w="{W_NS}">{entries}</w:comments>'
    ).encode('utf-8')

    # ── 第 3 步：写入 word/commentsExtended.xml（扩展属性）──
    # WHY：新版 Word 依赖此文件记录批注的 paraId 与"是否已解决"状态；
    #      缺失时部分版本可能不渲染批注栏。paraId 必须是 8 位十六进制，
    #      故维护一个合法 id 池循环使用。
    hex_ids = ['0A1B2C3D', '0E1F2A3B', '1C2D3E4F', '5A6B7C8D', '9E0F1A2B', '3B4C5D6E',
               '7F8A9B0C', 'D1E2F3A4', 'B5C6D7E8', 'F9A0B1C2']
    ext_entries = ''
    for i, (cid, _text) in enumerate(comment_defs):
        pid = hex_ids[i % len(hex_ids)]
        ext_entries += f'<w15:commentEx w15:paraId="{pid}" w15:done="0" w15:commentId="{cid}"/>'
    contents['word/commentsExtended.xml'] = (
        f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        f'<w15:commentsEx xmlns:w15="{W15_NS}">{ext_entries}</w15:commentsEx>'
    ).encode('utf-8')

    # ── 第 4 步：在 [Content_Types].xml 声明新部件的内容类型 ──
    # WHY：OOXML 包规范要求每个部件都登记 ContentType，否则包结构非法，
    #      Word 打开时会提示文件损坏。
    ct = contents['[Content_Types].xml'].decode('utf-8')
    ct = ct.replace(
        '</Types>',
        '<Override PartName="/word/comments.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml"/>'
        '<Override PartName="/word/commentsExtended.xml" '
        'ContentType="application/vnd.ms-word.commentsExtended+xml"/></Types>'
    )
    contents['[Content_Types].xml'] = ct.encode('utf-8')

    # ── 第 5 步：在 document.xml.rels 为两个新部件登记关系 ──
    # WHY：主文档通过关系(Relationship)引用部件，必须分配唯一 rId，
    #      否则 Word 找不到批注部件。
    rels = contents['word/_rels/document.xml.rels'].decode('utf-8')
    rels = rels.replace(
        '</Relationships>',
        f'<Relationship Id="rIdC0" Type="{R_NS}/comments" Target="comments.xml"/>'
        f'<Relationship Id="rIdC1" Type="http://schemas.microsoft.com/office/2007/relationships/commentsExtended" '
        f'Target="commentsExtended.xml"/></Relationships>'
    )
    contents['word/_rels/document.xml.rels'] = rels.encode('utf-8')

    # ── 第 6 步：定位承载批注的段落 ──
    doc = etree.fromstring(contents['word/document.xml'])
    para = None
    if anchor_text:
        # 扫描正文所有段落，找第一个包含锚点文本的段落
        for p in doc.iter(W + 'p'):
            txt = ''.join(t.text or '' for t in p.iter(W + 't'))
            if anchor_text in txt:
                para = p
                break
    if para is None:
        raise ValueError(f'未找到锚点文本: {anchor_text}')

    # ── 第 7 步：为每个目标片段定位 run 并挂批注 ──
    for (target, _text), (cid, _ct) in zip(comments, comment_defs):
        # 7.1 在段落内找到包含目标文本的那个 run
        target_run = None
        for run in para.findall(W + 'r'):
            t_el = run.find(W + 't')
            if t_el is not None and target in (t_el.text or ''):
                target_run = run
                break
        if target_run is None:
            raise ValueError(f'段落中未找到目标片段: {target}')

        # 7.2 拆分 run，让目标子串独占一个 run（才能精确圈定批注范围）
        t_el = target_run.find(W + 't')
        full = t_el.text or ''
        rpr = target_run.find(W + 'rPr')
        pos = full.find(target)
        pre = full[:pos]                       # 目标之前的部分（不挂批注）
        mid = full[pos:pos + len(target)]      # 目标本身（挂批注）
        post = full[pos + len(target):]        # 目标之后的部分（不挂批注）
        parts = []
        if pre:
            parts.append((pre, None))
        parts.append((mid, cid))
        if post:
            parts.append((post, None))
        new_runs = _split_run(target_run, rpr, parts)

        # 7.3 只对携带 cid 的那个 run 包裹批注标记
        for run_el, cid2 in new_runs:
            if cid2 == cid:
                _wrap_comment(run_el, cid)

    # 序列化回 document.xml（保留 XML 声明，standalone 以符合 OOXML 约定）
    contents['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)

    # ── 第 8 步：整体写回 ZIP 包 ──
    # WHY：ZIP 无法原地修改，必须用修改后的部件集合重建整个包。
    with zipfile.ZipFile(docx_path, 'w', zipfile.ZIP_DEFLATED) as zout:
        for name in contents:
            zout.writestr(name, contents[name])

    return len(comment_defs)


def remove_inline_comment_blocks(docx_path, markers):
    """移除段落文本包含任一 markers 特征字符串的内联注释块。

    用于清除被批注替代的旧 "// 说明" 段落，避免与边栏批注重复。

    参数
    ----
    docx_path : 目标 docx 文件路径（会被原地覆盖）
    markers   : 特征字符串列表，段落文本含任一特征即整段删除

    返回
    ----
    int : 实际删除的段落数
    """
    with zipfile.ZipFile(docx_path) as z:
        contents = {n: z.read(n) for n in z.namelist()}

    doc = etree.fromstring(contents['word/document.xml'])
    body = doc.find(W + 'body')
    removed = 0
    # 注意：需用 list() 拷贝后再迭代，否则遍历时删除元素会跳过/报错
    for p in list(body.iter(W + 'p')):
        txt = ''.join(t.text or '' for t in p.iter(W + 't'))
        if any(m in txt for m in markers):
            body.remove(p)
            removed += 1

    contents['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)

    with zipfile.ZipFile(docx_path, 'w', zipfile.ZIP_DEFLATED) as zout:
        for name in contents:
            zout.writestr(name, contents[name])
    return removed


# ═══════════════════════════════════════════════════════════════
#  批量处理功能
# ═══════════════════════════════════════════════════════════════
#
#  两种批量场景：
#  1. 多文档不同配置   -> 用 batch_add_comments(specs)
#     每个文档可以有不同的注释、锚点，各自独立处理。
#  2. 多文档相同配置   -> 用 process_directory(directory, ...)
#     对某个目录下所有 .docx 批量挂同一批注释（如统一规范文档）。


def batch_add_comments(specs, author='灵犀', initials='LX'):
    """批量处理多个 docx 文档，每个文档可配不同的批注与锚点。

    典型场景：给同一规范的多份报告，或同一批不同章节的文档各自挂批注。

    参数
    ----
    specs : list[dict]，每个 dict 支持以下键：
        - docx_path      (必填) 文档路径
        - comments       (必填) [(目标文本, 注释内容), ...]
        - anchor_text    (可选) 锚点文本；缺省沿用 add_comments_to_docx 默认
        - remove_inline  (可选) 是否移除内联注释块，缺省 False
        - inline_markers (可选) 内联注释特征列表
    每个文档内部可覆盖全局 author/initials（通过 dict 中的同名字段）。

    返回
    ----
    list[dict] : 每个文档的处理结果
        {
          'docx_path': 文档路径,
          'comments_added': 添加批注数,
          'blocks_removed': 移除内联块数,
          'ok': True/False,       # 是否成功
          'error': 异常信息(失败时)
        }

    示例
    ----
    specs = [
        {'docx_path': 'a.docx', 'comments': [('TDS', '溶解性总固体')]},
        {'docx_path': 'b.docx', 'comments': [('pH', '酸碱度')], 'remove_inline': True},
    ]
    results = batch_add_comments(specs)
    """
    results = []
    for spec in specs:
        path = spec['docx_path']
        entry = {'docx_path': path, 'ok': False, 'error': None,
                 'comments_added': 0, 'blocks_removed': 0}
        try:
            # 每个 spec 可覆盖全局作者；未提供则用函数默认
            a = spec.get('author', author)
            ini = spec.get('initials', initials)
            entry['comments_added'] = add_comments_to_docx(
                path,
                spec['comments'],
                anchor_text=spec.get('anchor_text'),
                author=a, initials=ini,
            )
            if spec.get('remove_inline'):
                entry['blocks_removed'] = remove_inline_comment_blocks(
                    path, spec.get('inline_markers', []))
            entry['ok'] = True
        except Exception as e:  # 捕获单个文档异常，避免中断整个批次
            entry['error'] = str(e)
        results.append(entry)
    return results


def process_directory(directory, comments, anchor_text=None,
                      author='灵犀', initials='LX', pattern='*.docx',
                      remove_inline=False, inline_markers=None, recursive=False):
    """对目录下的多个 docx 文件批量挂相同的批注。

    典型场景：给一批同模板的规范/报告统一挂注释，只需配置一次。

    参数
    ----
    directory      : 目标目录绝对路径
    comments       : [(目标文本, 注释内容), ...]
    anchor_text    : 锚点文本（各文档段落定位用，可空）
    author         : 批注作者
    initials       : 作者缩写
    pattern        : 文件名匹配模式，默认 '*.docx'
    remove_inline  : 是否同时移除内联注释块
    inline_markers : 内联注释特征列表
    recursive      : 是否递归子目录，缺省 False

    返回
    ----
    list[dict] : 与 batch_add_comments 相同的处理结果列表

    注意
    ----
    - 所有文档会被原地覆盖，请确保已备份。
    - 若某文档不含 anchor_text，该文档会报错并标记 ok=False，
      但不会中断后续文档的处理。
    """
    import glob as _glob
    import os as _os

    specs = []
    # 递归或非递归地收集匹配的 .docx 文件
    if recursive:
        for root, _dirs, files in _os.walk(directory):
            for fn in files:
                if _glob.fnmatch.fnmatch(fn, pattern):
                    specs.append(_os.path.join(root, fn))
    else:
        for fn in _glob.glob(_os.path.join(directory, pattern)):
            specs.append(fn)

    # 统一转成 batch_add_comments 所需的 spec 结构
    spec_list = [{
        'docx_path': p,
        'comments': comments,
        'anchor_text': anchor_text,
        'remove_inline': remove_inline,
        'inline_markers': inline_markers,
    } for p in specs]

    return batch_add_comments(spec_list, author=author, initials=initials)


# ═══════════════════════════════════════════════════════════════
#  入口：读取 CONFIG 执行，并校验结果
# ═══════════════════════════════════════════════════════════════

if __name__ == '__main__':
    cfg = CONFIG
    from docx import Document  # 仅用于最终校验

    if cfg.get('batch'):
        # ── 批量模式：处理多个文档 ──
        results = batch_add_comments(cfg['batch'], author=cfg['author'], initials=cfg['initials'])
        print('\n批量处理结果：')
        for r in results:
            status = 'OK' if r['ok'] else f"FAIL: {r['error']}"
            print(f"  {r['docx_path']}")
            print(f"    批注={r['comments_added']} 移除内联块={r['blocks_removed']} 状态={status}")
        ok_count = sum(1 for r in results if r['ok'])
        print(f'\n总计: {ok_count}/{len(results)} 个文档成功')
    else:
        # ── 单文档模式 ──
        path = cfg['docx_path']
        n = add_comments_to_docx(
            path,
            cfg['comments'],
            anchor_text=cfg['anchor_text'],
            author=cfg['author'],
            initials=cfg['initials'],
        )
        print(f'已添加批注: {n} 条')
        if cfg['remove_inline']:
            m = remove_inline_comment_blocks(path, cfg['inline_markers'])
            print(f'已移除内联注释块: {m} 段')

        # 校验：用 python-docx 重新打开，确认包结构未损坏
        d = Document(path)
        print(f'文档校验通过，段落数: {len(d.paragraphs)}')
