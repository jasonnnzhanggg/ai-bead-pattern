import { useRef, useState } from "react";
import { createManualMask } from "../segmentation/manualMask";
import { createLocalAiSegmenter } from "../segmentation/localAi";
import type { Segmenter, SegmentationStatus } from "../segmentation/segmenter";

interface ImportScreenProps {
  image: File | null;
  onImageChange: (image: File | null) => void;
  onContinue: () => void;
  segmenter?: Segmenter;
}

export function ImportScreen({
  image,
  onImageChange,
  onContinue,
  segmenter = createLocalAiSegmenter()
}: ImportScreenProps) {
  const abortController = useRef<AbortController | null>(null);
  const [status, setStatus] = useState<SegmentationStatus>("idle");
  const [manualMask, setManualMask] = useState<ImageData | null>(null);

  async function imageBitmapFromFile(file: File): Promise<ImageBitmap> {
    if (typeof createImageBitmap === "function") {
      return createImageBitmap(file);
    }
    return { width: 1, height: 1 } as ImageBitmap;
  }

  async function runSegmentation(file: File) {
    abortController.current?.abort();
    const controller = new AbortController();
    abortController.current = controller;
    setStatus("running");
    setManualMask(null);

    try {
      const imageBitmap = await imageBitmapFromFile(file);
      await segmenter.segment(imageBitmap, controller.signal);
      setStatus("ready");
    } catch {
      setStatus("failed");
    }
  }

  function startManualSelection() {
    setManualMask(createManualMask(1, 1));
    setStatus("manual");
  }

  return (
    <main>
      <p>本地处理 · 图片不会用于自由重绘</p>
      <h1>把图片变成拼豆模板</h1>
      <p>上传主体清晰的图片，系统会保持比例并匹配 MARD 色号。</p>
      <label className="upload-control">
        选择图片
        <input
          aria-label="选择图片"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            const nextImage = event.target.files?.[0] ?? null;
            onImageChange(nextImage);
            if (nextImage) {
              void runSegmentation(nextImage);
            }
          }}
        />
      </label>
      {image ? <p aria-live="polite">{image.name}</p> : null}
      {status === "running" ? <p role="status">正在本地识别主体</p> : null}
      {status === "failed" ? (
        <section aria-label="前景识别回退">
          <p>自动去背景失败，图片仍已保留</p>
          <button type="button" onClick={startManualSelection}>
            手动选择主体
          </button>
        </section>
      ) : null}
      {status === "manual" && manualMask ? (
        <p role="status">已启用手动主体选择</p>
      ) : null}
      <button type="button" disabled={!image} onClick={onContinue}>
        继续设置
      </button>
    </main>
  );
}
