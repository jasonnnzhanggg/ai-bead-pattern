import { createStore } from "zustand/vanilla";
import { createEmptyGrid } from "../../src/domain/grid";
import { createProject, type BeadProject } from "../../src/domain/project";
import {
  exportProjectFile,
  importProject,
  parseProjectFile
} from "../../src/persistence/projectFile";

interface ProjectState {
  project: BeadProject;
  setProject: (project: BeadProject) => void;
}

function fixtureProject(): BeadProject {
  const project = createProject("project-file", 1_752_400_000_000);
  return {
    ...project,
    grid: {
      ...createEmptyGrid(2, 2),
      cells: ["A1", null, "B2", "B2"]
    },
    ownedColorCodes: ["A1", "B2"],
    completedCellIndexes: [2]
  };
}

it("exports and imports a portable project file", async () => {
  const project = fixtureProject();
  const blob = exportProjectFile(project);

  expect(blob.type).toBe("application/json");
  await expect(parseProjectFile(blob)).resolves.toEqual(project);
});

it("does not overwrite the current project with a corrupt file", async () => {
  const currentProject = fixtureProject();
  const store = createStore<ProjectState>((set) => ({
    project: currentProject,
    setProject: (project) => set({ project })
  }));

  await expect(importProject(new Blob(["not json"]), store)).rejects.toThrow(
    "项目文件无效"
  );

  expect(store.getState().project.id).toBe(currentProject.id);
});

it("rejects project files with invalid grid dimensions", async () => {
  const project = fixtureProject();
  const invalid = {
    ...project,
    grid: { ...project.grid, cells: project.grid.cells.slice(0, -1) }
  };

  await expect(
    parseProjectFile(new Blob([JSON.stringify(invalid)]))
  ).rejects.toThrow("项目文件无效");
});
