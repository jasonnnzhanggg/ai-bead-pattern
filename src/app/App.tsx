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
import {
  browserImageToGrid,
  type ImageToGrid
} from "../engine/imageToGrid";
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

interface AppProps {
  imageToGrid?: ImageToGrid;
}

function loadStoredAppState(): StoredAppState | null {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as StoredAppState) : null;
  } catch {
    return null;
  }
}

export function App({ imageToGrid = browserImageToGrid }: AppProps = {}) {
  const stored = loadStoredAppState();
  const [step, setStep] = useState<AppStep>(stored?.step ?? "import");
  const [image, setImage] = useState<File | null>(null);
  const [generationMessage, setGenerationMessage] = useState<string | null>(null);
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
        generationMessage={generationMessage}
        onBack={() => setStep("setup")}
        onSelect={async () => {
          const board = resolveBoard(setup.boardPresetId, setup.beadSizeId);
          let grid = createEmptyGrid(board.columns, board.rows);

          if (image) {
            setGenerationMessage("正在把图片转换成 MARD 拼豆模板…");
            try {
              grid = await imageToGrid(image, {
                columns: board.columns,
                rows: board.rows,
                palette: mardPalette
              });
              setGenerationMessage(null);
            } catch {
              setGenerationMessage(
                "图片自动转换失败，已进入空白模板，可手动编辑"
              );
            }
          }

          setProject({
            ...createProject(),
            beadSizeId: setup.beadSizeId,
            boardPresetId: setup.boardPresetId,
            grid
          });
          setStep("editing");
        }}
      />
    );
  }

  return (
    <ImportScreen
      image={image}
      onImageChange={(nextImage) => {
        setImage(nextImage);
        setGenerationMessage(null);
      }}
      onContinue={() => setStep("setup")}
    />
  );
}
