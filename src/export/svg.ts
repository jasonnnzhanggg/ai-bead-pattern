import type { RenderModel } from "./renderModel";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function exportSvg(model: RenderModel): string {
  const cellSize = 20;
  const paletteHeight = Math.max(40, model.palette.length * 18 + 20);
  const width = model.columns * cellSize;
  const height = model.rows * cellSize + paletteHeight;

  const cells = model.cells
    .map((cell) => {
      const x = (cell.column - 1) * cellSize;
      const y = (cell.row - 1) * cellSize;
      return `<g data-cell="${cell.index}" data-code="${escapeXml(
        cell.code ?? ""
      )}"><rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${
        cell.hex
      }" stroke="#B8B1A4" stroke-width="1"/><text x="${x + cellSize / 2}" y="${
        y + 13
      }" text-anchor="middle" font-size="7">${escapeXml(cell.code ?? "")}</text></g>`;
    })
    .join("");

  const palette = model.palette
    .map((color, index) => {
      const y = model.rows * cellSize + 20 + index * 18;
      return `<g data-palette-code="${escapeXml(color.code)}"><rect x="0" y="${
        y - 10
      }" width="12" height="12" fill="${color.hex}" stroke="#25231F"/><text x="18" y="${y}" font-size="12">${escapeXml(
        color.code
      )} × ${color.count}</text></g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" data-columns="${model.columns}" data-rows="${model.rows}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${cells}${palette}</svg>`;
}
