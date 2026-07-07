import type { StoreApi } from "zustand/vanilla";
import type { BeadProject } from "../domain/project";

interface ProjectSetterState {
  project: BeadProject;
  setProject: (project: BeadProject) => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.every((item) => Number.isInteger(item) && item >= 0)
  );
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function assertValidProject(value: unknown): asserts value is BeadProject {
  if (!isRecord(value)) {
    throw new Error("项目文件无效");
  }

  const grid = value.grid;
  if (!isRecord(grid)) {
    throw new Error("项目文件无效");
  }

  const cells = grid.cells;
  if (
    typeof value.id !== "string" ||
    value.schemaVersion !== 1 ||
    value.paletteVersion !== "mard-291-v1" ||
    typeof value.createdAt !== "number" ||
    typeof value.updatedAt !== "number" ||
    typeof value.beadSizeId !== "string" ||
    typeof value.boardPresetId !== "string" ||
    (value.orientation !== "portrait" && value.orientation !== "landscape") ||
    !isPositiveInteger(grid.columns) ||
    !isPositiveInteger(grid.rows) ||
    !Array.isArray(cells) ||
    cells.length !== grid.columns * grid.rows ||
    !cells.every((cell) => cell === null || typeof cell === "string") ||
    !isStringArray(value.ownedColorCodes) ||
    !isNumberArray(value.completedCellIndexes)
  ) {
    throw new Error("项目文件无效");
  }
}

export function exportProjectFile(project: BeadProject): Blob {
  return new Blob([JSON.stringify(project, null, 2)], {
    type: "application/json"
  });
}

function readBlobText(file: Blob): Promise<string> {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("读取项目文件失败"));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsText(file);
  });
}

export async function parseProjectFile(file: Blob): Promise<BeadProject> {
  try {
    const parsed: unknown = JSON.parse(await readBlobText(file));
    assertValidProject(parsed);
    return parsed;
  } catch (error) {
    if (error instanceof Error && error.message === "项目文件无效") {
      throw error;
    }
    throw new Error("项目文件无效");
  }
}

export async function importProject(
  file: Blob,
  store: StoreApi<ProjectSetterState>
): Promise<BeadProject> {
  const project = await parseProjectFile(file);
  store.getState().setProject(project);
  return project;
}
