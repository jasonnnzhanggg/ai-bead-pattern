import { differenceCiede2000 } from "culori";
import type { PaletteColor } from "../domain/palette";

export interface ColorMatch<T extends PaletteColor> {
  color: T;
  deltaE: number;
}

const deltaE2000 = differenceCiede2000();

export function nearestMard<T extends PaletteColor>(
  inputHex: string,
  palette: readonly T[]
): ColorMatch<T> {
  if (palette.length === 0) {
    throw new Error("Palette is empty");
  }

  const ordered = [...palette].sort((left, right) =>
    left.code.localeCompare(right.code, "en")
  );
  let best = ordered[0];
  let bestDelta = deltaE2000(inputHex, best.hex);

  for (const color of ordered.slice(1)) {
    const delta = deltaE2000(inputHex, color.hex);
    if (delta < bestDelta) {
      best = color;
      bestDelta = delta;
    }
  }

  return { color: best, deltaE: bestDelta };
}
