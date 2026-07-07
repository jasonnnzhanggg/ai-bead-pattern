import { createProject, type BeadProject } from "../../src/domain/project";
import { createRenderModel } from "../../src/export/renderModel";
import { exportPdf } from "../../src/export/pdf";
import { exportPng } from "../../src/export/png";
import { exportSvg } from "../../src/export/svg";

function projectFixture(): BeadProject {
  const project = createProject("export-project", 1_752_400_000_000);
  return {
    ...project,
    beadSizeId: "standard-5",
    boardPresetId: "square-30",
    grid: {
      columns: 3,
      rows: 2,
      cells: ["A1", "B2", "A1", null, "C7", "B2"]
    },
    ownedColorCodes: ["A1", "B2", "C7"]
  };
}

function sumCounts(palette: { count: number }[]) {
  return palette.reduce((sum, color) => sum + color.count, 0);
}

function countOccupied(cells: readonly unknown[]) {
  return cells.filter(Boolean).length;
}

function inspectSvg(svg: string) {
  const document = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = document.documentElement;
  return {
    columns: Number(root.getAttribute("data-columns")),
    rows: Number(root.getAttribute("data-rows")),
    paletteCount: document.querySelectorAll("[data-palette-code]").length,
    cellCount: document.querySelectorAll("[data-cell]").length
  };
}

it("uses identical dimensions and counts in every export", async () => {
  const project = projectFixture();
  const model = createRenderModel(project);

  expect(model.columns).toBe(project.grid.columns);
  expect(model.rows).toBe(project.grid.rows);
  expect(sumCounts(model.palette)).toBe(countOccupied(project.grid.cells));
  expect(inspectSvg(exportSvg(model))).toMatchObject({
    columns: model.columns,
    rows: model.rows,
    paletteCount: model.palette.length,
    cellCount: model.columns * model.rows
  });

  const pdf = exportPdf(model);
  expect(pdf.type).toBe("application/pdf");
  expect((await pdf.text()).startsWith("%PDF")).toBe(true);

  const png = await exportPng(model);
  expect(png.type).toBe("image/png");
});

it("keeps coordinates and physical pitch in the render model", () => {
  const model = createRenderModel(projectFixture());

  expect(model.pitchMm).toBe(5);
  expect(model.cells[0]).toMatchObject({
    index: 0,
    row: 1,
    column: 1,
    code: "A1"
  });
  expect(model.splitLines.columns).toEqual([3]);
  expect(model.splitLines.rows).toEqual([2]);
});
