import paletteData from "../data/mard-291.v1.json";
import { resolveBoard } from "../domain/boards";
import type { BeadProject } from "../domain/project";

export interface RenderCell {
  index: number;
  row: number;
  column: number;
  code: string | null;
  hex: string;
}

export interface RenderPaletteColor {
  code: string;
  hex: string;
  count: number;
}

export interface RenderModel {
  projectId: string;
  columns: number;
  rows: number;
  pitchMm: number;
  physicalWidthMm: number;
  physicalHeightMm: number;
  cells: RenderCell[];
  palette: RenderPaletteColor[];
  splitLines: {
    columns: number[];
    rows: number[];
  };
}

const paletteByCode = new Map(
  paletteData.map((color) => [color.code, color.hex] as const)
);

function splitLines(total: number, size: number): number[] {
  const lines: number[] = [];
  for (let next = size; next <= total; next += size) {
    lines.push(next);
  }
  if (lines.at(-1) !== total) {
    lines.push(total);
  }
  return lines;
}

export function createRenderModel(project: BeadProject): RenderModel {
  const board = resolveBoard(project.boardPresetId, project.beadSizeId);
  const counts = new Map<string, number>();
  const cells = project.grid.cells.map((code, index) => {
    if (code) {
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }

    return {
      index,
      row: Math.floor(index / project.grid.columns) + 1,
      column: (index % project.grid.columns) + 1,
      code,
      hex: code ? paletteByCode.get(code) ?? "#FFFFFF" : "#FFFFFF"
    };
  });

  return {
    projectId: project.id,
    columns: project.grid.columns,
    rows: project.grid.rows,
    pitchMm: board.pitchMm,
    physicalWidthMm: project.grid.columns * board.pitchMm,
    physicalHeightMm: project.grid.rows * board.pitchMm,
    cells,
    palette: [...counts.entries()]
      .map(([code, count]) => ({
        code,
        count,
        hex: paletteByCode.get(code) ?? "#FFFFFF"
      }))
      .sort((left, right) => left.code.localeCompare(right.code, "en")),
    splitLines: {
      columns: splitLines(project.grid.columns, board.columns),
      rows: splitLines(project.grid.rows, board.rows)
    }
  };
}
