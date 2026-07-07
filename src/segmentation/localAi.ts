import type { Segmenter, SegmentationMetadata } from "./segmenter";
import { createManualMask } from "./manualMask";

interface LocalSegmentationModel {
  segment(image: ImageBitmap, signal: AbortSignal): Promise<ImageData>;
}

interface LocalAiSegmenterOptions {
  modelId?: string;
  modelVersion?: string;
  load?: (context: {
    signal: AbortSignal;
    onProgress?: (progress: number) => void;
  }) => Promise<LocalSegmentationModel>;
  onProgress?: (progress: number) => void;
}

export type { Segmenter } from "./segmenter";

async function defaultLoadLocalModel({
  signal,
  onProgress
}: {
  signal: AbortSignal;
  onProgress?: (progress: number) => void;
}): Promise<LocalSegmentationModel> {
  onProgress?.(0.1);
  if (signal.aborted) {
    throw new DOMException("Segmentation cancelled", "AbortError");
  }

  return {
    async segment(image, innerSignal) {
      if (innerSignal.aborted) {
        throw new DOMException("Segmentation cancelled", "AbortError");
      }
      onProgress?.(1);
      return createManualMask(image.width, image.height);
    }
  };
}

export function createLocalAiSegmenter(
  options: LocalAiSegmenterOptions = {}
): Segmenter {
  const metadata: SegmentationMetadata = {
    modelId: options.modelId ?? "local-fallback-foreground",
    modelVersion: options.modelVersion ?? "v1"
  };

  return {
    metadata,
    async segment(image, signal) {
      const model = await (options.load ?? defaultLoadLocalModel)({
        signal,
        onProgress: options.onProgress
      });
      return model.segment(image, signal);
    }
  };
}
