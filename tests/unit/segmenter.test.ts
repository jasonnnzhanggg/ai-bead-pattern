import { createManualMask } from "../../src/segmentation/manualMask";
import {
  createLocalAiSegmenter,
  type Segmenter
} from "../../src/segmentation/localAi";

it("returns a full-image manual mask when AI segmentation is unavailable", () => {
  const mask = createManualMask(3, 2);

  expect(mask.width).toBe(3);
  expect(mask.height).toBe(2);
  expect([...mask.data]).toEqual([255, 255, 255, 255, 255, 255]);
});

it("wraps local inference with progress and cancellation support", async () => {
  const progress: number[] = [];
  const segmenter = createLocalAiSegmenter({
    modelId: "local-test-model",
    modelVersion: "v1",
    load: async ({ signal, onProgress }) => {
      onProgress?.(0.4);
      return {
        segment: async (_image, innerSignal) => {
          expect(innerSignal).toBe(signal);
          onProgress?.(1);
          return createManualMask(1, 1);
        }
      };
    },
    onProgress: (value) => progress.push(value)
  });

  await expect(
    segmenter.segment({ width: 1, height: 1 } as ImageBitmap, new AbortController().signal)
  ).resolves.toMatchObject({ width: 1, height: 1 });
  expect(progress).toEqual([0.4, 1]);
});

it("preserves the original image path when the local model fails", async () => {
  const failingSegmenter: Segmenter = {
    metadata: { modelId: "missing", modelVersion: "v0" },
    segment: async () => {
      throw new Error("model unavailable");
    }
  };

  await expect(
    failingSegmenter.segment({ width: 1, height: 1 } as ImageBitmap, new AbortController().signal)
  ).rejects.toThrow("model unavailable");
});
