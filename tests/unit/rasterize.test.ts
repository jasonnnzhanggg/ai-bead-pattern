import { containRect, rasterizePixels } from "../../src/engine/rasterize";

const palette = [
  { code: "R1", hex: "#FF0000", nameZh: "R1", source: "test" },
  { code: "H7", hex: "#000000", nameZh: "H7", source: "test" }
];

it("letterboxes rather than stretching the source", () => {
  const placement = containRect(
    { width: 400, height: 200 },
    { columns: 25, rows: 25 }
  );

  expect(placement.width / placement.height).toBe(2);
  expect(placement.width).toBe(25);
  expect(placement.height).toBe(12.5);
  expect(placement.y).toBe(6.25);
});

it("maps source pixels deterministically to allowed bead codes", () => {
  const source = {
    width: 2,
    height: 1,
    data: new Uint8ClampedArray([
      255, 0, 0, 255,
      0, 0, 0, 255
    ])
  };

  const first = rasterizePixels(source, { columns: 2, rows: 1, palette });
  const second = rasterizePixels(source, { columns: 2, rows: 1, palette });

  expect(first.cells).toEqual(["R1", "H7"]);
  expect(second).toEqual(first);
});

it("keeps transparent source cells empty", () => {
  const source = {
    width: 1,
    height: 1,
    data: new Uint8ClampedArray([255, 0, 0, 0])
  };

  expect(
    rasterizePixels(source, { columns: 1, rows: 1, palette }).cells
  ).toEqual([null]);
});
