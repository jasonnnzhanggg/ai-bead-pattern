export type BeadCode = string;
export type GridCell = BeadCode | null;

export interface BeadGrid {
  columns: number;
  rows: number;
  cells: GridCell[];
}

export function createEmptyGrid(columns: number, rows: number): BeadGrid {
  if (!Number.isInteger(columns) || !Number.isInteger(rows)) {
    throw new Error("Grid dimensions must be integers");
  }

  if (columns <= 0 || rows <= 0) {
    throw new Error("Grid dimensions must be positive");
  }

  return {
    columns,
    rows,
    cells: Array<GridCell>(columns * rows).fill(null)
  };
}
