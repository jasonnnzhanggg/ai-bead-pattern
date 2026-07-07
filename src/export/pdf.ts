import { jsPDF } from "jspdf";
import type { RenderModel } from "./renderModel";

function blobWithText(chunks: BlobPart[], options: BlobPropertyBag, text: string) {
  const blob = new Blob(chunks, options);
  if (typeof blob.text !== "function") {
    Object.defineProperty(blob, "text", {
      value: async () => text
    });
  }
  return blob;
}

export function exportPdf(model: RenderModel): Blob {
  const pdf = new jsPDF({
    unit: "mm",
    format: "a4"
  });

  pdf.setFontSize(16);
  pdf.text("MARD 拼豆模板", 12, 16);
  pdf.setFontSize(10);
  pdf.text("请按 100% 原尺寸打印。下方线段应为 100mm。", 12, 24);
  pdf.line(12, 32, 112, 32);
  pdf.text("100mm", 52, 38);
  pdf.text(`${model.columns} × ${model.rows} 格`, 12, 48);
  pdf.text(
    `预计尺寸 ${model.physicalWidthMm.toFixed(0)} × ${model.physicalHeightMm.toFixed(
      0
    )} mm`,
    12,
    56
  );
  pdf.text("色号清单", 12, 68);
  model.palette.forEach((color, index) => {
    pdf.text(`${color.code} × ${color.count}`, 12, 76 + index * 6);
  });

  const output = pdf.output();
  return blobWithText([output], { type: "application/pdf" }, output);
}
