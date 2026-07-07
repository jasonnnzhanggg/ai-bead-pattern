export function createManualMask(width: number, height: number): ImageData {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error("Mask dimensions must be positive integers");
  }

  return {
    width,
    height,
    colorSpace: "srgb",
    data: new Uint8ClampedArray(width * height).fill(255)
  } as ImageData;
}
