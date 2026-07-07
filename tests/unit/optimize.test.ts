import { analyzeBuildability } from "../../src/engine/optimize";
import type { BeadGrid } from "../../src/domain/grid";

it("reports but does not silently remove a one-cell island", () => {
  const grid: BeadGrid = {
    columns: 3,
    rows: 3,
    cells: ["A1", "A1", null, "A1", null, null, null, null, "H7"]
  };

  const report = analyzeBuildability(grid);

  expect(report.issues).toContainEqual({
    type: "isolated-cell",
    cellIndexes: [8]
  });
  expect(report.grid).toEqual(grid);
  expect(report.suggestions).toEqual([]);
});

it("reports disconnected bead components", () => {
  const grid: BeadGrid = {
    columns: 3,
    rows: 2,
    cells: ["A1", "A1", null, null, null, "B2"]
  };

  const report = analyzeBuildability(grid);

  expect(report.componentCount).toBe(2);
  expect(report.issues).toContainEqual({
    type: "disconnected-component",
    cellIndexes: [5]
  });
});

it("accepts an orthogonally connected shape", () => {
  const grid: BeadGrid = {
    columns: 2,
    rows: 2,
    cells: ["A1", "A1", null, "B2"]
  };

  expect(analyzeBuildability(grid)).toMatchObject({
    componentCount: 1,
    issues: []
  });
});
