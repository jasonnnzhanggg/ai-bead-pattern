export interface SegmentationMetadata {
  modelId: string;
  modelVersion: string;
}

export interface Segmenter {
  metadata: SegmentationMetadata;
  segment(image: ImageBitmap, signal: AbortSignal): Promise<ImageData>;
}

export type SegmentationStatus = "idle" | "running" | "ready" | "failed" | "manual";
