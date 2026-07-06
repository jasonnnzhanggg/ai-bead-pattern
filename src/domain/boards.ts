export type BeadSizeId = "mini-2.6" | "standard-5";
export type BoardPresetId =
  | "square-25"
  | "square-29"
  | "square-30"
  | "square-50"
  | "physical-26x20";

export interface BeadSize {
  id: BeadSizeId;
  label: string;
  pitchMm: number;
}

export interface BoardPreset {
  id: BoardPresetId;
  label: string;
  columns?: number;
  rows?: number;
  targetWidthMm?: number;
  targetHeightMm?: number;
}

export interface ResolvedBoard {
  id: BoardPresetId;
  columns: number;
  rows: number;
  pitchMm: number;
  physicalWidthMm: number;
  physicalHeightMm: number;
}

export const beadSizes: readonly BeadSize[] = [
  { id: "mini-2.6", label: "2.6mm迷你豆", pitchMm: 2.6 },
  { id: "standard-5", label: "5mm普通豆", pitchMm: 5 }
];

export const boardPresets: readonly BoardPreset[] = [
  { id: "square-25", label: "25×25格", columns: 25, rows: 25 },
  { id: "square-29", label: "29×29格", columns: 29, rows: 29 },
  { id: "square-30", label: "30×30格", columns: 30, rows: 30 },
  { id: "square-50", label: "50×50格", columns: 50, rows: 50 },
  {
    id: "physical-26x20",
    label: "约26×20cm",
    targetWidthMm: 260,
    targetHeightMm: 200
  }
];

export function resolveBoard(
  boardPresetId: BoardPresetId,
  beadSizeId: BeadSizeId
): ResolvedBoard {
  const preset = boardPresets.find(({ id }) => id === boardPresetId);
  const beadSize = beadSizes.find(({ id }) => id === beadSizeId);

  if (!preset || !beadSize) {
    throw new Error("Unknown board or bead size");
  }

  const columns =
    preset.columns ?? Math.floor((preset.targetWidthMm ?? 0) / beadSize.pitchMm);
  const rows =
    preset.rows ?? Math.floor((preset.targetHeightMm ?? 0) / beadSize.pitchMm);

  return {
    id: preset.id,
    columns,
    rows,
    pitchMm: beadSize.pitchMm,
    physicalWidthMm: columns * beadSize.pitchMm,
    physicalHeightMm: rows * beadSize.pitchMm
  };
}
