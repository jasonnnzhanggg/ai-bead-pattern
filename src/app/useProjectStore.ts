import { createStore } from "zustand/vanilla";
import type { BeadGrid } from "../domain/grid";
import type { BeadProject } from "../domain/project";

interface ProjectEditorState {
  project: BeadProject;
  selectedCode: string | null;
  lockedCellIndexes: Set<number>;
  pastGrids: BeadGrid[];
  message: string;
  selectCode: (code: string) => void;
  paintCell: (cellIndex: number) => void;
  undo: () => void;
}

function copyGrid(grid: BeadGrid): BeadGrid {
  return { ...grid, cells: [...grid.cells] };
}

export function createProjectEditorStore(
  project: BeadProject,
  lockedCellIndexes: readonly number[] = []
) {
  return createStore<ProjectEditorState>((set, get) => ({
    project: { ...project, grid: copyGrid(project.grid) },
    selectedCode: null,
    lockedCellIndexes: new Set(lockedCellIndexes),
    pastGrids: [],
    message: "",
    selectCode: (selectedCode) => set({ selectedCode, message: "" }),
    paintCell: (cellIndex) => {
      const state = get();
      if (state.lockedCellIndexes.has(cellIndex)) {
        set({ message: "轮廓格已锁定" });
        return;
      }
      if (!state.selectedCode) {
        set({ message: "请先选择色号" });
        return;
      }
      if (state.project.grid.cells[cellIndex] === state.selectedCode) {
        return;
      }

      const previousGrid = copyGrid(state.project.grid);
      const nextGrid = copyGrid(state.project.grid);
      nextGrid.cells[cellIndex] = state.selectedCode;
      set({
        project: { ...state.project, grid: nextGrid, updatedAt: Date.now() },
        pastGrids: [...state.pastGrids, previousGrid],
        message: ""
      });
    },
    undo: () => {
      const state = get();
      const previousGrid = state.pastGrids.at(-1);
      if (!previousGrid) {
        return;
      }
      set({
        project: {
          ...state.project,
          grid: copyGrid(previousGrid),
          updatedAt: Date.now()
        },
        pastGrids: state.pastGrids.slice(0, -1),
        message: ""
      });
    }
  }));
}
