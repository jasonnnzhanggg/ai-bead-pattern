import type { BeadGrid } from "../domain/grid";

export type BuildabilityIssueType =
  | "isolated-cell"
  | "disconnected-component";

export interface BuildabilityIssue {
  type: BuildabilityIssueType;
  cellIndexes: number[];
}

export interface GridSuggestion {
  cellIndex: number;
  replacement: string | null;
  reason: BuildabilityIssueType;
}

export interface BuildabilityReport {
  grid: BeadGrid;
  componentCount: number;
  issues: BuildabilityIssue[];
  suggestions: GridSuggestion[];
}

function occupiedNeighbors(grid: BeadGrid, index: number): number[] {
  const row = Math.floor(index / grid.columns);
  const column = index % grid.columns;
  const candidates = [
    row > 0 ? index - grid.columns : -1,
    column > 0 ? index - 1 : -1,
    column + 1 < grid.columns ? index + 1 : -1,
    row + 1 < grid.rows ? index + grid.columns : -1
  ];

  return candidates.filter(
    (candidate) => candidate >= 0 && grid.cells[candidate] !== null
  );
}

function connectedComponents(grid: BeadGrid): number[][] {
  const unseen = new Set(
    grid.cells.flatMap((cell, index) => (cell === null ? [] : [index]))
  );
  const components: number[][] = [];

  while (unseen.size > 0) {
    const start = unseen.values().next().value as number;
    const queue = [start];
    const component: number[] = [];
    unseen.delete(start);

    while (queue.length > 0) {
      const current = queue.shift() as number;
      component.push(current);
      for (const neighbor of occupiedNeighbors(grid, current)) {
        if (unseen.delete(neighbor)) {
          queue.push(neighbor);
        }
      }
    }

    components.push(component.sort((left, right) => left - right));
  }

  return components.sort((left, right) => right.length - left.length);
}

export function analyzeBuildability(grid: BeadGrid): BuildabilityReport {
  if (grid.cells.length !== grid.columns * grid.rows) {
    throw new Error("Grid cell count does not match dimensions");
  }

  const components = connectedComponents(grid);
  const issues: BuildabilityIssue[] = [];

  for (const component of components) {
    if (component.length === 1) {
      issues.push({ type: "isolated-cell", cellIndexes: component });
    }
  }

  for (const component of components.slice(1)) {
    issues.push({ type: "disconnected-component", cellIndexes: component });
  }

  return {
    grid,
    componentCount: components.length,
    issues,
    suggestions: []
  };
}
