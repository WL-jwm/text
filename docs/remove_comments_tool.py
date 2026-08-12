# -*- coding: utf-8 -*-
"""
remove_comments_tool.py —— 从 .docx 中移除全部 Word 批注

与 docx_comment_tool.py（添加批注）互逆，负责清理已存在的批注。
添加批注时写了 5 处部件，本工具按同样结构逐一拆除：

  1. word/document.xml
       删除 <w:commentRangeStart> / <w:commentRangeEnd> / <w:commentReference>
       三个标记元素（批注圈定范围与气泡引用全部摘除）
  2. word/comments.xml           删除整个部件（批注内容本体）
  3. word/commentsExtended.xml   删除整个部件（批注扩展属性）
  4. [Content_Types].xml         移除两个新增部件的 Override 声明
  5. word/_rels/document.xml.rels 移除两个新增部件的关系 Relationship

用法：
    python remove_comments_tool.py <docx_path> [docx_path ...]
    # 例：清除开发文档汇编.docx 的旧批注
    python remove_comments_tool.py "开发文档汇编.docx"
"""

import sys
import zipfile
import shutil
import os

# 命名空间（与 docx_comment_tool.py 保持一致）
W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
W15_NS = 'http://schemas.microsoft.com/office/word/2012/wordml'

# 批注相关部件
COMMENT_PARTS = ('word/comments.xml', 'word/commentsExtended.xml')

# Content_Types 中要移除的两条 Override（按 PartName 定位，含引号包裹）
CT_OVERRIDES = (
    '<Override PartName="/word/comments.xml" '
    'ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml"/>',
    '<Override PartName="/word/commentsExtended.xml" '
    'ContentType="application/vnd.ms-word.commentsExtended+xml"/>',
)

# document.xml.rels 中要移除的两条 Relationship（按 Id 定位，含引号包裹）
REL_RELATIONSHIPS = (
    '<Relationship Id="rIdC0" Type="{0}/comments" Target="comments.xml"/>'.format(R_NS),
    '<Relationship Id="rIdC1" Type="http://schemas.microsoft.com/office/2007/relationships/commentsExtended" '
    'Target="commentsExtended.xml"/>',
)


def _remove_elements_by_tag(root, tags):
    """从 XML 根中删除所有指定标签的元素，返回删除个数。"""
    removed = 0
    for tag in tags:
        # .// 递归遍历整棵文档树，批注标记嵌套在段落/run 深处，仅 findall 查不到
        for el in root.findall('.//' + tag):
            el.getparent().remove(el)
            removed += 1
    return removed


def remove_all_comments(docx_path):
    """
    移除指定 docx 的全部批注，返回清理的统计信息 dict。

    策略：重写 zip 包。先解出全部成员，剔除批注相关部件，
    再对 document.xml / Content_Types / document.xml.rels 做文本层清理，
    最后重新打包。保留其余所有部件与文件结构。
    """
    src = os.path.abspath(docx_path)
    if not os.path.exists(src):
        raise FileNotFoundError('文件不存在: %s' % src)

    tmp = src + '.tmp_rm'

    removed_markers = 0
    removed_entries = {}

    with zipfile.ZipFile(src, 'r') as zin:
        names = zin.namelist()
        with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
            for name in names:
                data = zin.read(name)

                # 1) 批注部件整体剔除
                if name in COMMENT_PARTS:
                    removed_entries[name] = True
                    continue

                # 2) Content_Types：移除 Override 声明
                if name == '[Content_Types].xml':
                    text = data.decode('utf-8')
                    for ov in CT_OVERRIDES:
                        if ov in text:
                            text = text.replace(ov, '')
                    data = text.encode('utf-8')

                # 3) document.xml.rels：移除 Relationship
                if name == 'word/_rels/document.xml.rels':
                    text = data.decode('utf-8')
                    for rel in REL_RELATIONSHIPS:
                        if rel in text:
                            text = text.replace(rel, '')
                    data = text.encode('utf-8')

                # 4) document.xml：删除三个批注标记元素
                if name == 'word/document.xml':
                    from lxml import etree
                    root = etree.fromstring(data)
                    W = '{%s}' % W_NS
                    markers = [
                        W + 'commentRangeStart',
                        W + 'commentRangeEnd',
                        W + 'commentReference',
                    ]
                    removed_markers += _remove_elements_by_tag(root, markers)
                    data = etree.tostring(root, xml_declaration=True,
                                          encoding='UTF-8', standalone=True)

                zout.writestr(name, data)

    # 用清理后的包替换原文件（os.replace 原子替换，无需删除）
    os.replace(tmp, src)

    return {
        'docx_path': src,
        'comments_removed': removed_entries.get('word/comments.xml', False),
        'comments_extended_removed': removed_entries.get('word/commentsExtended.xml', False),
        'range_markers_removed': removed_markers,
    }


def main(argv):
    if len(argv) < 2:
        print('用法: python remove_comments_tool.py <docx_path> [docx_path ...]')
        return 1
    ok = 0
    for p in argv[1:]:
        try:
            r = remove_all_comments(p)
            print('[OK] %s' % p)
            print('     comments.xml 部件: %s' % ('已删除' if r['comments_removed'] else '不存在'))
            print('     commentsExtended.xml 部件: %s' % ('已删除' if r['comments_extended_removed'] else '不存在'))
            print('     标记元素 commentRangeStart/End/Reference 移除: %d 个' % r['range_markers_removed'])
            ok += 1
        except Exception as e:
            print('[ERR] %s: %s' % (p, e))
    print('完成，处理 %d 个文档' % ok)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
