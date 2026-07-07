import { boardPresets, resolveBoard } from "../../src/domain/boards";

it("keeps bead size separate from square board dimensions", () => {
  expect(resolveBoard("square-25", "mini-2.6").columns).toBe(25);
  expect(resolveBoard("square-25", "standard-5").columns).toBe(25);
  expect(resolveBoard("square-25", "mini-2.6").pitchMm).not.toBe(
    resolveBoard("square-25", "standard-5").pitchMm
  );
});

it("defines every agreed square board preset", () => {
  expect(boardPresets.map((preset) => preset.id)).toEqual([
    "square-25",
    "square-29",
    "square-30",
    "square-50",
    "physical-26x20"
  ]);
});

it("derives the physical large format from the selected bead pitch", () => {
  const standard = resolveBoard("physical-26x20", "standard-5");
  const mini = resolveBoard("physical-26x20", "mini-2.6");

  expect(standard.physicalWidthMm).toBeLessThanOrEqual(260);
  expect(standard.physicalHeightMm).toBeLessThanOrEqual(200);
  expect(standard.columns).toBe(52);
  expect(standard.rows).toBe(40);
  expect(mini.columns).toBe(100);
  expect(mini.rows).toBe(76);
});
