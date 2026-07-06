export interface PaletteColor {
  code: string;
  hex: string;
  nameZh: string;
  source: string;
}

export function activePalette<T extends PaletteColor>(
  all: readonly T[],
  ownedCodes?: ReadonlySet<string>
): T[] {
  if (!ownedCodes) {
    return [...all];
  }

  return all.filter(({ code }) => ownedCodes.has(code));
}
