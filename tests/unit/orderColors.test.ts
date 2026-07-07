import { orderColors } from "../../src/assembly/orderColors";
import type { BeadGrid } from "../../src/domain/grid";

const grid: BeadGrid = {
  columns: 4,
  rows: 3,
  cells: [
    "A1",
    "A1",
    "B2",
    "B2",
    "A1",
    "C7",
    "C7",
    "B2",
    "D9",
    "C7",
    "E5",
    "B2"
  ]
};

it("orders used colors by build priority and deterministic code fallback", () => {
  const ordered = orderColors(grid);

  expect(ordered.map((color) => color.code)).toEqual(["B2", "A1", "C7", "D9", "E5"]);
  expect(ordered[0]).toMatchObject({ code: "B2", total: 4, completed: 0 });
});

it("counts completion per color", () => {
  const ordered = orderColors(grid, [0, 3, 5, 9]);

  expect(ordered.find((color) => color.code === "A1")?.completed).toBe(1);
  expect(ordered.find((color) => color.code === "C7")?.completed).toBe(2);
});
