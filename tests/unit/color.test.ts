import { nearestMard } from "../../src/engine/color";

const palette = [
  { code: "A1", hex: "#FAF4C8", nameZh: "A1", source: "test" },
  { code: "H7", hex: "#000000", nameZh: "H7", source: "test" }
];

it("selects the perceptually nearest allowed MARD color", () => {
  expect(nearestMard("#FAF5C9", palette).color.code).toBe("A1");
  expect(nearestMard("#010101", palette).color.code).toBe("H7");
});

it("uses MARD code as a deterministic tie breaker", () => {
  const duplicateHex = [
    { code: "B2", hex: "#FFFFFF", nameZh: "B2", source: "test" },
    { code: "A1", hex: "#FFFFFF", nameZh: "A1", source: "test" }
  ];

  expect(nearestMard("#FFFFFF", duplicateHex).color.code).toBe("A1");
});

it("rejects an empty active palette", () => {
  expect(() => nearestMard("#FFFFFF", [])).toThrow("Palette is empty");
});
