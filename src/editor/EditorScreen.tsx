import { useState } from "react";
import { useStore } from "zustand";
import type { BeadProject } from "../domain/project";
import { createProjectEditorStore } from "../app/useProjectStore";
import { GridCanvas } from "./GridCanvas";

interface EditorScreenProps {
  project: BeadProject;
  paletteCodes: readonly string[];
  lockedCellIndexes?: readonly number[];
  onStartAssembly?: (project: BeadProject) => void;
}

export function EditorScreen({
  project,
  paletteCodes,
  lockedCellIndexes = [],
  onStartAssembly
}: EditorScreenProps) {
  const [store] = useState(() =>
    createProjectEditorStore(project, lockedCellIndexes)
  );
  const state = useStore(store);

  return (
    <main className="editor-screen">
      <header className="editor-header">
        <div>
          <p>逐格编辑</p>
          <h1>编辑拼豆模板</h1>
        </div>
        <button
          type="button"
          disabled={state.pastGrids.length === 0}
          onClick={state.undo}
        >
          撤销
        </button>
        {onStartAssembly ? (
          <button type="button" onClick={() => onStartAssembly(state.project)}>
            进入拼豆模式
          </button>
        ) : null}
      </header>
      <div className="palette-strip" aria-label="色号选择">
        {paletteCodes.map((code) => (
          <button
            key={code}
            type="button"
            aria-label={`选择色号${code}`}
            aria-pressed={state.selectedCode === code}
            onClick={() => state.selectCode(code)}
          >
            {code}
          </button>
        ))}
      </div>
      <p role="status" aria-live="polite">
        {state.message}
      </p>
      <div className="grid-viewport">
        <GridCanvas
          grid={state.project.grid}
          lockedCellIndexes={state.lockedCellIndexes}
          onCellClick={state.paintCell}
        />
      </div>
    </main>
  );
}
