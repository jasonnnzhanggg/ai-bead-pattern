import { useMemo, useState } from "react";
import type { BeadProject } from "../domain/project";
import { orderColors } from "./orderColors";

interface AssemblyScreenProps {
  project: BeadProject;
  onBack?: () => void;
}

export function AssemblyScreen({ project, onBack }: AssemblyScreenProps) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [completedCellIndexes, setCompletedCellIndexes] = useState(
    () => new Set(project.completedCellIndexes)
  );
  const colors = useMemo(
    () => orderColors(project.grid, [...completedCellIndexes]),
    [project.grid, completedCellIndexes]
  );
  const selectedColor = colors.find((color) => color.code === selectedCode);

  function toggleCell(index: number) {
    if (!selectedCode || project.grid.cells[index] !== selectedCode) {
      return;
    }
    setCompletedCellIndexes((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <main className="assembly-screen">
      <header className="editor-header">
        <div>
          <p>拼豆模式</p>
          <h1>按颜色完成拼豆</h1>
        </div>
        {onBack ? (
          <button type="button" onClick={onBack}>
            返回编辑
          </button>
        ) : null}
      </header>

      <p role="status" aria-live="polite">
        {selectedColor
          ? `已完成 ${selectedColor.completed}/${selectedColor.total}`
          : "请选择底部色号开始"}
      </p>

      <div className="grid-viewport">
        <div
          className="bead-grid"
          role="grid"
          aria-label="拼豆网格"
          style={{
            gridTemplateColumns: `repeat(${project.grid.columns}, minmax(20px, 1fr))`
          }}
        >
          {project.grid.cells.map((code, index) => {
            const row = Math.floor(index / project.grid.columns) + 1;
            const column = (index % project.grid.columns) + 1;
            const focused = selectedCode !== null && code === selectedCode;
            const dimmed = selectedCode !== null && code !== selectedCode;
            const completed = completedCellIndexes.has(index);
            const label = `第${row}行第${column}列 ${code ?? "空白"}${
              completed ? " 已完成" : ""
            }`;

            return (
              <button
                key={index}
                type="button"
                role="gridcell"
                aria-label={label}
                data-color={code ?? ""}
                data-focused={focused ? "true" : "false"}
                data-dimmed={dimmed ? "true" : "false"}
                data-completed={completed ? "true" : "false"}
                className="bead-cell"
                onClick={() => toggleCell(index)}
              >
                {code ?? ""}
              </button>
            );
          })}
        </div>
      </div>

      <nav className="assembly-palette" aria-label="所需色号">
        {colors.map((color) => (
          <button
            key={color.code}
            type="button"
            aria-label={`选择 ${color.code} ${color.completed}/${color.total}`}
            aria-pressed={selectedCode === color.code}
            onClick={() => setSelectedCode(color.code)}
          >
            <span className="palette-code">{color.code}</span>
            <span>
              {color.completed}/{color.total}
            </span>
          </button>
        ))}
      </nav>
    </main>
  );
}
