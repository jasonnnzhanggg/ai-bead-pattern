import { useState } from "react";
import type { BeadSizeId, BoardPresetId } from "../domain/boards";
import { ImportScreen } from "../screens/ImportScreen";
import { SetupScreen } from "../screens/SetupScreen";
import { VariantsScreen } from "../screens/VariantsScreen";
import { EditorScreen } from "../editor/EditorScreen";
import { createProject } from "../domain/project";
import { createEmptyGrid } from "../domain/grid";
import { resolveBoard } from "../domain/boards";
import mardPalette from "../data/mard-291.v1.json";

type AppStep = "import" | "setup" | "variants" | "editing";

export interface ProjectSetup {
  beadSizeId: BeadSizeId;
  boardPresetId: BoardPresetId;
}

export function App() {
  const [step, setStep] = useState<AppStep>("import");
  const [image, setImage] = useState<File | null>(null);
  const [setup, setSetup] = useState<ProjectSetup>({
    beadSizeId: "standard-5",
    boardPresetId: "square-30"
  });
  const [project, setProject] = useState(() => createProject());

  if (step === "editing") {
    return (
      <EditorScreen
        project={project}
        paletteCodes={mardPalette.map(({ code }) => code)}
      />
    );
  }

  if (step === "setup") {
    return (
      <SetupScreen
        value={setup}
        onChange={setSetup}
        onBack={() => setStep("import")}
        onGenerate={() => setStep("variants")}
      />
    );
  }

  if (step === "variants") {
    return (
      <VariantsScreen
        imageName={image?.name ?? "图片"}
        setup={setup}
        onBack={() => setStep("setup")}
        onSelect={() => {
          const board = resolveBoard(setup.boardPresetId, setup.beadSizeId);
          setProject({
            ...createProject(),
            beadSizeId: setup.beadSizeId,
            boardPresetId: setup.boardPresetId,
            grid: createEmptyGrid(board.columns, board.rows)
          });
          setStep("editing");
        }}
      />
    );
  }

  return (
    <ImportScreen
      image={image}
      onImageChange={setImage}
      onContinue={() => setStep("setup")}
    />
  );
}
