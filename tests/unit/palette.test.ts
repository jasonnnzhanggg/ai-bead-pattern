import palette from "../../src/data/mard-291.v1.json";
import { activePalette } from "../../src/domain/palette";

it("contains exactly 291 unique MARD codes with valid hex colors", () => {
  expect(palette).toHaveLength(291);
  expect(new Set(palette.map(({ code }) => code)).size).toBe(291);
  expect(palette.every(({ code }) => /^[A-Z]+[0-9]+$/.test(code))).toBe(true);
  expect(palette.every(({ hex }) => /^#[0-9A-F]{6}$/i.test(hex))).toBe(true);
  expect(
    palette.every(({ source }) => source === "pixel-beads-2026-07-06")
  ).toBe(true);
});

it("limits matching to colors in the customer inventory", () => {
  const colors = activePalette(palette, new Set(["A1", "H7"]));

  expect(colors.map(({ code }) => code)).toEqual(["A1", "H7"]);
});

it("uses the complete palette when no inventory filter is supplied", () => {
  expect(activePalette(palette)).toHaveLength(291);
});
