import type { BeadGrid } from "../domain/grid";

interface GridCanvasProps {
  grid: BeadGrid;
  lockedCellIndexes: ReadonlySet<number>;
  onCellClick: (cellIndex: number) => void;
}

export function GridCanvas({
  grid,
  lockedCellIndexes,
  onCellClick
}: GridCanvasProps) {
  return (
    <div
      className="bead-grid"
      role="grid"
      aria-label="拼豆网格"
      style={{ gridTemplateColumns: `repeat(${grid.columns}, minmax(20px, 1fr))` }}
    >
      {grid.cells.map((code, index) => {
        const row = Math.floor(index / grid.columns) + 1;
        const column = (index % grid.columns) + 1;
        const locked = lockedCellIndexes.has(index);
        const label = `第${row}行第${column}列 ${code ?? "空白"}${
          locked ? " 已锁定" : ""
        }`;

        return (
          <button
            key={index}
            type="button"
            role="gridcell"
            aria-label={label}
            data-color={code ?? ""}
            data-cell={index}
            className={locked ? "bead-cell is-locked" : "bead-cell"}
            onClick={() => onCellClick(index)}
          >
            {code ?? ""}
          </button>
        );
      })}
    </div>
  );
}
