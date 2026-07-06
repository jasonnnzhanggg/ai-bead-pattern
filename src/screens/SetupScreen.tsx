import { beadSizes, boardPresets } from "../domain/boards";
import type { ProjectSetup } from "../app/App";

interface SetupScreenProps {
  value: ProjectSetup;
  onChange: (value: ProjectSetup) => void;
  onBack: () => void;
  onGenerate: () => void;
}

export function SetupScreen({
  value,
  onChange,
  onBack,
  onGenerate
}: SetupScreenProps) {
  return (
    <main>
      <button type="button" onClick={onBack}>
        返回上传
      </button>
      <h1>选择制作规格</h1>
      <fieldset>
        <legend>豆子规格</legend>
        {beadSizes.map((size) => (
          <label key={size.id}>
            <input
              type="radio"
              name="bead-size"
              checked={value.beadSizeId === size.id}
              onChange={() => onChange({ ...value, beadSizeId: size.id })}
            />
            {size.label}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>模板尺寸</legend>
        {boardPresets.map((board) => (
          <label key={board.id}>
            <input
              type="radio"
              name="board-preset"
              checked={value.boardPresetId === board.id}
              onChange={() => onChange({ ...value, boardPresetId: board.id })}
            />
            {board.label}
          </label>
        ))}
      </fieldset>
      <button type="button" onClick={onGenerate}>
        生成模板
      </button>
    </main>
  );
}
