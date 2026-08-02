/**
 * F-03 可视化数据导出 — SVG/PNG 导出工具
 *
 * 提供SVG到PNG的转换导出能力：
 *   - exportSVGToPNG: 将SVG元素转为PNG图片下载
 *   - exportSVGFile: 直接导出SVG源文件
 *   - exportVizDataExcel: 导出可视化面板的结构化数据为Excel
 */

// ============================================================
// SVG → PNG 导出
// ============================================================

/**
 * 将SVG元素转换为PNG图片并下载
 *
 * @param svgElement 目标SVG DOM元素
 * @param filename 输出文件名（不含扩展名）
 * @param scale 放大倍数（默认2x，提升清晰度）
 * @param background 背景色（默认透明）
 */
export function exportSVGToPNG(
  svgElement: SVGSVGElement,
  filename: string,
  scale: number = 2,
  background: string = 'transparent',
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const clone = svgElement.cloneNode(true) as SVGSVGElement;

      // 获取原始尺寸
      const bbox = svgElement.getBoundingClientRect();
      const width = svgElement.viewBox.baseVal.width || bbox.width || 800;
      const height = svgElement.viewBox.baseVal.height || bbox.height || 600;

      clone.setAttribute('width', String(width));
      clone.setAttribute('height', String(height));
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      // 序列化SVG
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(clone);

      // 确保XML声明
      if (!svgString.startsWith('<?xml')) {
        svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
      }

      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(svgUrl);
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // 填充背景
        if (background !== 'transparent') {
          ctx.fillStyle = background;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        URL.revokeObjectURL(svgUrl);

        canvas.toBlob(blob => {
          if (!blob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }
          downloadBlob(blob, `${filename}.png`);
          resolve();
        }, 'image/png');
      };

      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('SVG image load failed'));
      };

      img.src = svgUrl;
    } catch (err) {
      reject(err);
    }
  });
}

// ============================================================
// SVG 源文件导出
// ============================================================

export function exportSVGFile(svgElement: SVGSVGElement, filename: string): void {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(clone);

  if (!svgString.startsWith('<?xml')) {
    svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
  }

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, `${filename}.svg`);
}

// ============================================================
// 可视化数据 Excel 导出
// ============================================================

export interface VizExportSheet {
  name: string;
  headers: string[];
  rows: (string | number | null | undefined)[][];
}

/**
 * 导出可视化面板数据为多Sheet Excel
 * 复用 exportMultiSheetExcel 的底层实现
 */
export function exportVizDataExcel(
  sheets: VizExportSheet[],
  filename: string,
): void {
  // 动态导入避免循环依赖
  import('./exportUtils').then(({ exportMultiSheetExcel }) => {
    exportMultiSheetExcel(sheets, filename);
  });
}

/**
 * 导出可视化面板数据为CSV
 */
export function exportVizDataCSV(
  headers: string[],
  rows: (string | number | null | undefined)[][],
  filename: string,
): void {
  import('./exportUtils').then(({ exportCSV }) => {
    exportCSV(headers, rows, filename);
  });
}

// ============================================================
// 内部工具
// ============================================================

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
