import {
  resolveBoard,
  type BeadSizeId,
  type BoardPresetId
} from "./boards";
import { createEmptyGrid, type BeadGrid } from "./grid";

export type Orientation = "portrait" | "landscape";

export interface BeadProject {
  id: string;
  schemaVersion: 1;
  paletteVersion: "mard-291-v1";
  createdAt: number;
  updatedAt: number;
  beadSizeId: BeadSizeId;
  boardPresetId: BoardPresetId;
  orientation: Orientation;
  grid: BeadGrid;
  ownedColorCodes: string[];
  completedCellIndexes: number[];
}

export function createProject(
  id: string = crypto.randomUUID(),
  timestamp: number = Date.now()
): BeadProject {
  const beadSizeId: BeadSizeId = "standard-5";
  const boardPresetId: BoardPresetId = "square-30";
  const board = resolveBoard(boardPresetId, beadSizeId);

  return {
    id,
    schemaVersion: 1,
    paletteVersion: "mard-291-v1",
    createdAt: timestamp,
    updatedAt: timestamp,
    beadSizeId,
    boardPresetId,
    orientation: "portrait",
    grid: createEmptyGrid(board.columns, board.rows),
    ownedColorCodes: [],
    completedCellIndexes: []
  };
}
