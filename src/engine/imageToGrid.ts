import type { BeadGrid } from "../domain/grid";
import type { PaletteColor } from "../domain/palette";
import { rasterizePixels, type TargetGridSize } from "./rasterize";

export interface ImageToGridOptions extends TargetGridSize {
  palette: readonly PaletteColor[];
}

export type ImageToGrid = (
  image: File,
  options: ImageToGridOptions
) => Promise<BeadGrid>;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image could not be decoded"));
    };
    image.src = url;
  });
}

export const browserImageToGrid: ImageToGrid = async (imageFile, options) => {
  const image = await loadImage(imageFile);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;

  if (canvas.width <= 0 || canvas.height <= 0) {
    throw new Error("Image dimensions must be positive");
  }

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Canvas 2D context is unavailable");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);

  return rasterizePixels(
    {
      width: pixels.width,
      height: pixels.height,
      data: pixels.data
    },
    options
  );
};
