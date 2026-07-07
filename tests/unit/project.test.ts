import { createProject } from "../../src/domain/project";

it("pins new projects to schema and palette versions", () => {
  const project = createProject("project-1", 1_752_400_000_000);

  expect(project).toMatchObject({
    id: "project-1",
    schemaVersion: 1,
    paletteVersion: "mard-291-v1",
    createdAt: 1_752_400_000_000,
    updatedAt: 1_752_400_000_000,
    beadSizeId: "standard-5",
    boardPresetId: "square-30",
    orientation: "portrait"
  });
});

it("starts with an empty editable grid and assembly progress", () => {
  const project = createProject("project-2", 1);

  expect(project.grid.columns).toBe(30);
  expect(project.grid.rows).toBe(30);
  expect(project.grid.cells).toHaveLength(900);
  expect(project.grid.cells.every((cell) => cell === null)).toBe(true);
  expect(project.completedCellIndexes).toEqual([]);
});
