import { compareMasks } from "../../src/engine/outline";

it("accepts an unchanged subject outline", () => {
  const mask = {
    width: 2,
    height: 2,
    data: new Uint8Array([1, 1, 1, 0])
  };

  expect(compareMasks(mask, mask)).toEqual({
    originalArea: 3,
    candidateArea: 3,
    areaChangeRatio: 0,
    intersectionOverUnion: 1,
    changedCellRatio: 0,
    withinAutomaticLimit: true
  });
});

it("rejects automatic outline changes over ten percent", () => {
  const original = {
    width: 5,
    height: 2,
    data: new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
  };
  const changed = {
    width: 5,
    height: 2,
    data: new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1, 0, 0])
  };

  const report = compareMasks(original, changed);

  expect(report.areaChangeRatio).toBe(0.2);
  expect(report.changedCellRatio).toBe(0.2);
  expect(report.withinAutomaticLimit).toBe(false);
});

it("rejects masks with incompatible dimensions", () => {
  expect(() =>
    compareMasks(
      { width: 1, height: 1, data: new Uint8Array([1]) },
      { width: 2, height: 1, data: new Uint8Array([1, 1]) }
    )
  ).toThrow("Mask dimensions must match");
});
