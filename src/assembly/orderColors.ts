import type { BeadGrid } from "../domain/grid";

export interface AssemblyColor {
  code: string;
  total: number;
  completed: number;
  edgeCount: number;
  largestArea: number;
}

function isEdge(index: number, grid: BeadGrid): boolean {
  const row = Math.floor(index / grid.columns);
  const column = index % grid.columns;
  return (
    row === 0 ||
    column === 0 ||
    row === grid.rows - 1 ||
    column === grid.columns - 1
  );
}

function neighbors(index: number, grid: BeadGrid): number[] {
  const row = Math.floor(index / grid.columns);
  const column = index % grid.columns;
  const result: number[] = [];
  if (row > 0) result.push(index - grid.columns);
  if (row < grid.rows - 1) result.push(index + grid.columns);
  if (column > 0) result.push(index - 1);
  if (column < grid.columns - 1) result.push(index + 1);
  return result;
}

function largestConnectedArea(
  code: string,
  indexes: readonly number[],
  grid: BeadGrid
): number {
  const remaining = new Set(indexes);
  let largest = 0;

  for (const start of indexes) {
    if (!remaining.has(start)) {
      continue;
    }

    const stack = [start];
    remaining.delete(start);
    let size = 0;

    while (stack.length > 0) {
      const current = stack.pop()!;
      size += 1;
      for (const next of neighbors(current, grid)) {
        if (remaining.has(next) && grid.cells[next] === code) {
          remaining.delete(next);
          stack.push(next);
        }
      }
    }

    largest = Math.max(largest, size);
  }

  return largest;
}

export function orderColors(
  grid: BeadGrid,
  completedCellIndexes: readonly number[] = []
): AssemblyColor[] {
  const completed = new Set(completedCellIndexes);
  const byCode = new Map<string, number[]>();

  grid.cells.forEach((code, index) => {
    if (!code) {
      return;
    }
    byCode.set(code, [...(byCode.get(code) ?? []), index]);
  });

  return [...byCode.entries()]
    .map(([code, indexes]) => ({
      code,
      total: indexes.length,
      completed: indexes.filter((index) => completed.has(index)).length,
      edgeCount: indexes.filter((index) => isEdge(index, grid)).length,
      largestArea: largestConnectedArea(code, indexes, grid)
    }))
    .sort((left, right) => {
      const leftOutline = left.edgeCount > 0 ? 1 : 0;
      const rightOutline = right.edgeCount > 0 ? 1 : 0;
      return (
        rightOutline - leftOutline ||
        right.edgeCount - left.edgeCount ||
        right.largestArea - left.largestArea ||
        right.total - left.total ||
        left.code.localeCompare(right.code, "en")
      );
    });
}
