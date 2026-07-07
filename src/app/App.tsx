import { useEffect, useState } from "react";
import type { BeadSizeId, BoardPresetId } from "../domain/boards";
import { ImportScreen } from "../screens/ImportScreen";
import { SetupScreen } from "../screens/SetupScreen";
import { VariantsScreen } from "../screens/VariantsScreen";
import { EditorScreen } from "../editor/EditorScreen";
import { AssemblyScreen } from "../assembly/AssemblyScreen";
import { createProject } from "../domain/project";
import { createEmptyGrid } from "../domain/grid";
import { resolveBoard } from "../domain/boards";
import mardPalette from "../data/mard-291.v1.json";

type AppStep = "import" | "setup" | "variants" | "editing" | "assembly";
const storageKey = "ai-bead-pattern.active-project.v1";

export interface ProjectSetup {
  beadSizeId: BeadSizeId;
  boardPresetId: BoardPresetId;
}

interface StoredAppState {
  step: AppStep;
  project: ReturnType<typeof createProject>;
}

function loadStoredAppState(): StoredAppState | null {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as StoredAppState) : null;
  } catch {
    return null;
  }
}

export function App() {
  const stored = loadStoredAppState();
  const [step, setStep] = useState<AppStep>(stored?.step ?? "import");
  const [image, setImage] = useState<File | null>(null);
  const [setup, setSetup] = useState<ProjectSetup>({
    beadSizeId: "standard-5",
    boardPresetId: "square-30"
  });
  const [project, setProject] = useState(() => stored?.project ?? createProject());

  useEffect(() => {
    if (step === "import") {
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify({ step, project }));
  }, [project, step]);

  if (step === "assembly") {
    return (
      <AssemblyScreen
        project={project}
        onProjectChange={setProject}
        onBack={() => setStep("editing")}
      />
    );
  }

  if (step === "editing") {
    return (
      <EditorScreen
        project={project}
        paletteCodes={mardPalette.map(({ code }) => code)}
        onStartAssembly={(nextProject) => {
          setProject(nextProject);
          setStep("assembly");
        }}
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
