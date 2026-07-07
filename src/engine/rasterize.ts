import { createEmptyGrid, type BeadGrid } from "../domain/grid";
import type { PaletteColor } from "../domain/palette";
import { nearestMard } from "./color";

export interface PixelSource {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export interface TargetGridSize {
  columns: number;
  rows: number;
}

export interface ContainedRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RasterizeOptions extends TargetGridSize {
  palette: readonly PaletteColor[];
}

export function containRect(
  source: { width: number; height: number },
  target: TargetGridSize
): ContainedRect {
  if (source.width <= 0 || source.height <= 0) {
    throw new Error("Source dimensions must be positive");
  }

  const scale = Math.min(
    target.columns / source.width,
    target.rows / source.height
  );
  const width = source.width * scale;
  const height = source.height * scale;

  return {
    x: (target.columns - width) / 2,
    y: (target.rows - height) / 2,
    width,
    height
  };
}

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function rasterizePixels(
  source: PixelSource,
  options: RasterizeOptions
): BeadGrid {
  if (source.data.length !== source.width * source.height * 4) {
    throw new Error("Pixel buffer size does not match source dimensions");
  }

  const grid = createEmptyGrid(options.columns, options.rows);
  const placement = containRect(source, options);

  for (let row = 0; row < options.rows; row += 1) {
    for (let column = 0; column < options.columns; column += 1) {
      const centerX = column + 0.5;
      const centerY = row + 0.5;

      if (
        centerX < placement.x ||
        centerX >= placement.x + placement.width ||
        centerY < placement.y ||
        centerY >= placement.y + placement.height
      ) {
        continue;
      }

      const sourceX = Math.min(
        source.width - 1,
        Math.floor(((centerX - placement.x) / placement.width) * source.width)
      );
      const sourceY = Math.min(
        source.height - 1,
        Math.floor(((centerY - placement.y) / placement.height) * source.height)
      );
      const sourceIndex = (sourceY * source.width + sourceX) * 4;
      const alpha = source.data[sourceIndex + 3];

      if (alpha < 128) {
        continue;
      }

      const hex = rgbToHex(
        source.data[sourceIndex],
        source.data[sourceIndex + 1],
        source.data[sourceIndex + 2]
      );
      grid.cells[row * options.columns + column] = nearestMard(
        hex,
        options.palette
      ).color.code;
    }
  }

  return grid;
}
