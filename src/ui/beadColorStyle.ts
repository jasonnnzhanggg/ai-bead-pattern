import type { CSSProperties } from "react";
import paletteData from "../data/mard-291.v1.json";

const paletteByCode = new Map(
  paletteData.map((color) => [color.code, color.hex] as const)
);

function readableTextColor(hex: string): "#FFFFFF" | "#25231F" {
  const red = Number.parseInt(hex.slice(1, 3), 16);
  const green = Number.parseInt(hex.slice(3, 5), 16);
  const blue = Number.parseInt(hex.slice(5, 7), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

  return luminance < 150 ? "#FFFFFF" : "#25231F";
}

export function beadColorStyle(code: string | null): CSSProperties | undefined {
  if (!code) {
    return undefined;
  }

  const backgroundColor = paletteByCode.get(code);
  if (!backgroundColor) {
    return undefined;
  }

  return {
    backgroundColor,
    color: readableTextColor(backgroundColor)
  };
}
