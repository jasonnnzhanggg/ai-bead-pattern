import { createEmptyGrid } from "../../src/domain/grid";
import { createProject, type BeadProject } from "../../src/domain/project";
import {
  createAutoSave,
  createProjectRepository,
  isQuotaError
} from "../../src/persistence/projects";

function projectFixture(): BeadProject {
  const project = createProject("project-persist", 1_752_400_000_000);
  return {
    ...project,
    updatedAt: 1_752_400_005_000,
    grid: {
      ...createEmptyGrid(2, 2),
      cells: ["A1", "B2", null, "C3"]
    },
    ownedColorCodes: ["A1", "B2", "C3"],
    completedCellIndexes: [0, 3]
  };
}

it("restores grid, inventory and assembly progress", async () => {
  const repository = createProjectRepository();
  const project = projectFixture();

  await repository.save(project);

  expect(await repository.load(project.id)).toEqual(project);
});

it("autosaves once after 500ms of inactivity", async () => {
  vi.useFakeTimers();
  const repository = createProjectRepository();
  const saveSpy = vi.spyOn(repository, "save");
  const autosave = createAutoSave(repository, 500);
  const first = projectFixture();
  const second = { ...first, id: "project-latest", updatedAt: first.updatedAt + 1 };

  autosave.schedule(first);
  autosave.schedule(second);
  await vi.advanceTimersByTimeAsync(499);
  expect(saveSpy).not.toHaveBeenCalled();

  await vi.advanceTimersByTimeAsync(1);

  expect(saveSpy).toHaveBeenCalledTimes(1);
  expect(saveSpy).toHaveBeenCalledWith(second);
  vi.useRealTimers();
});

it("detects quota errors so the UI can offer immediate project export", () => {
  expect(isQuotaError(new DOMException("full", "QuotaExceededError"))).toBe(true);
  expect(isQuotaError(new Error("other"))).toBe(false);
});
