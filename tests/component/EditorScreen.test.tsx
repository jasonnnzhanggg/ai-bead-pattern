import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { BeadProject } from "../../src/domain/project";
import { EditorScreen } from "../../src/editor/EditorScreen";

const project: BeadProject = {
  id: "editor-project",
  schemaVersion: 1,
  paletteVersion: "mard-291-v1",
  createdAt: 1,
  updatedAt: 1,
  beadSizeId: "standard-5",
  boardPresetId: "square-30",
  orientation: "portrait",
  grid: { columns: 2, rows: 2, cells: ["A1", null, null, null] },
  ownedColorCodes: [],
  completedCellIndexes: []
};

it("paints one cell and restores it with undo", async () => {
  const user = userEvent.setup();
  render(<EditorScreen project={project} paletteCodes={["A1", "C7"]} />);

  await user.click(screen.getByRole("button", { name: "选择色号C7" }));
  await user.click(screen.getByRole("gridcell", { name: "第1行第2列 空白" }));
  expect(screen.getByRole("gridcell", { name: "第1行第2列 C7" })).toHaveAttribute(
    "data-color",
    "C7"
  );

  await user.click(screen.getByRole("button", { name: "撤销" }));
  expect(screen.getByRole("gridcell", { name: "第1行第2列 空白" })).toBeVisible();
});

it("does not change a locked outline cell", async () => {
  const user = userEvent.setup();
  render(
    <EditorScreen
      project={project}
      paletteCodes={["A1", "C7"]}
      lockedCellIndexes={[0]}
    />
  );

  await user.click(screen.getByRole("button", { name: "选择色号C7" }));
  await user.click(screen.getByRole("gridcell", { name: "第1行第1列 A1 已锁定" }));

  expect(screen.getByRole("gridcell", { name: "第1行第1列 A1 已锁定" })).toHaveAttribute(
    "data-color",
    "A1"
  );
  expect(screen.getByRole("status")).toHaveTextContent("轮廓格已锁定");
});

it("shows a back button when an editor back action is provided", async () => {
  const user = userEvent.setup();
  const onBack = vi.fn();

  render(
    <EditorScreen
      project={project}
      paletteCodes={["A1", "C7"]}
      onBack={onBack}
    />
  );

  await user.click(screen.getByRole("button", { name: "返回方案" }));

  expect(onBack).toHaveBeenCalledOnce();
});
