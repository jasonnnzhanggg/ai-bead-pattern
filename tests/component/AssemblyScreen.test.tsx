import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { BeadProject } from "../../src/domain/project";
import { AssemblyScreen } from "../../src/assembly/AssemblyScreen";

const project: BeadProject = {
  id: "assembly-project",
  schemaVersion: 1,
  paletteVersion: "mard-291-v1",
  createdAt: 1,
  updatedAt: 1,
  beadSizeId: "standard-5",
  boardPresetId: "square-30",
  orientation: "portrait",
  grid: {
    columns: 3,
    rows: 2,
    cells: ["A1", "C7", "A1", "C7", null, "B2"]
  },
  ownedColorCodes: ["A1", "B2", "C7"],
  completedCellIndexes: []
};

function gridCellsFor(code: string) {
  return screen
    .getAllByRole("gridcell")
    .filter((cell) => cell.getAttribute("data-color") === code);
}

function gridCellsExcept(code: string) {
  return screen
    .getAllByRole("gridcell")
    .filter((cell) => cell.getAttribute("data-color") !== code);
}

it("shows every used color in the bottom palette", () => {
  render(<AssemblyScreen project={project} />);

  expect(screen.getByRole("navigation", { name: "所需色号" })).toBeVisible();
  expect(screen.getByRole("button", { name: "选择 C7 0/2" })).toBeVisible();
  expect(screen.queryByRole("button", { name: /空白/ })).not.toBeInTheDocument();
});

it("highlights the selected color and dims every other bead", async () => {
  const user = userEvent.setup();
  render(<AssemblyScreen project={project} />);

  await user.click(screen.getByRole("button", { name: "选择 C7 0/2" }));

  expect(gridCellsFor("C7").every((cell) => cell.dataset.focused === "true")).toBe(
    true
  );
  expect(gridCellsExcept("C7").every((cell) => cell.dataset.dimmed === "true")).toBe(
    true
  );
});

it("marks a focused cell complete without editing its color", async () => {
  const user = userEvent.setup();
  render(<AssemblyScreen project={project} />);

  await user.click(screen.getByRole("button", { name: "选择 C7 0/2" }));
  await user.click(screen.getByRole("gridcell", { name: "第1行第2列 C7" }));

  expect(screen.getByRole("gridcell", { name: "第1行第2列 C7 已完成" })).toHaveAttribute(
    "data-color",
    "C7"
  );
  expect(screen.getByRole("button", { name: "选择 C7 1/2" })).toBeVisible();
  expect(screen.getByRole("status")).toHaveTextContent("已完成 1/2");
});

it("reports completion changes so the project can resume after reload", async () => {
  const user = userEvent.setup();
  const onProjectChange = vi.fn();
  render(<AssemblyScreen project={project} onProjectChange={onProjectChange} />);

  await user.click(screen.getByRole("button", { name: "选择 C7 0/2" }));
  await user.click(screen.getByRole("gridcell", { name: "第1行第2列 C7" }));

  expect(onProjectChange).toHaveBeenCalledWith(
    expect.objectContaining({ completedCellIndexes: [1] })
  );
});

it("exports a PDF from assembly mode", async () => {
  const user = userEvent.setup();
  render(<AssemblyScreen project={project} />);

  await user.click(screen.getByRole("button", { name: "导出PDF" }));

  expect(screen.getByRole("status")).toHaveTextContent("PDF已生成");
});
