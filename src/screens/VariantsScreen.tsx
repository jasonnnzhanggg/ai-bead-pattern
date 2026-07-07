import type { ProjectSetup } from "../app/App";

interface VariantsScreenProps {
  imageName: string;
  setup: ProjectSetup;
  generationMessage?: string | null;
  onBack: () => void;
  onSelect: (variantId: "fidelity" | "balanced" | "easy") => void | Promise<void>;
}

const variants = [
  { id: "fidelity", title: "高还原版", detail: "优先保留轮廓和细节" },
  { id: "balanced", title: "推荐成品版", detail: "平衡还原度、色数与可拼性" },
  { id: "easy", title: "易拼版", detail: "减少颜色与零散豆" }
] as const;

export function VariantsScreen({
  imageName,
  setup,
  generationMessage,
  onBack,
  onSelect
}: VariantsScreenProps) {
  return (
    <main>
      <button type="button" onClick={onBack}>
        返回设置
      </button>
      <h1>选择一个成品方案</h1>
      <p>{imageName}</p>
      <p>
        {setup.beadSizeId} · {setup.boardPresetId}
      </p>
      {generationMessage ? (
        <p role="status" aria-live="polite">
          {generationMessage}
        </p>
      ) : null}
      <section className="variant-grid" aria-label="模板方案">
        {variants.map((variant) => (
          <article key={variant.id}>
            <h2>{variant.title}</h2>
            <p>{variant.detail}</p>
            <button type="button" onClick={() => onSelect(variant.id)}>
              选择{variant.title}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
