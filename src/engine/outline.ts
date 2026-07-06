export interface BinaryMask {
  width: number;
  height: number;
  data: Uint8Array;
}

export interface OutlineReport {
  originalArea: number;
  candidateArea: number;
  areaChangeRatio: number;
  intersectionOverUnion: number;
  changedCellRatio: number;
  withinAutomaticLimit: boolean;
}

export function compareMasks(
  original: BinaryMask,
  candidate: BinaryMask
): OutlineReport {
  if (
    original.width !== candidate.width ||
    original.height !== candidate.height ||
    original.data.length !== candidate.data.length
  ) {
    throw new Error("Mask dimensions must match");
  }

  let originalArea = 0;
  let candidateArea = 0;
  let intersection = 0;
  let union = 0;
  let changedCells = 0;

  for (let index = 0; index < original.data.length; index += 1) {
    const originalFilled = original.data[index] > 0;
    const candidateFilled = candidate.data[index] > 0;
    originalArea += Number(originalFilled);
    candidateArea += Number(candidateFilled);
    intersection += Number(originalFilled && candidateFilled);
    union += Number(originalFilled || candidateFilled);
    changedCells += Number(originalFilled !== candidateFilled);
  }

  const areaChangeRatio =
    originalArea === 0
      ? Number(candidateArea > 0)
      : Math.abs(candidateArea - originalArea) / originalArea;
  const changedCellRatio =
    original.data.length === 0 ? 0 : changedCells / original.data.length;

  return {
    originalArea,
    candidateArea,
    areaChangeRatio,
    intersectionOverUnion: union === 0 ? 1 : intersection / union,
    changedCellRatio,
    withinAutomaticLimit:
      areaChangeRatio <= 0.1 && changedCellRatio <= 0.1
  };
}
