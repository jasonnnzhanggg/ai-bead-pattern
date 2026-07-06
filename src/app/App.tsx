import { useState } from "react";
import type { BeadSizeId, BoardPresetId } from "../domain/boards";
import { ImportScreen } from "../screens/ImportScreen";
import { SetupScreen } from "../screens/SetupScreen";
import { VariantsScreen } from "../screens/VariantsScreen";

type AppStep = "import" | "setup" | "variants";

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
