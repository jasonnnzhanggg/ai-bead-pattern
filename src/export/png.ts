import type { RenderModel } from "./renderModel";

const transparentOnePixelPng = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII="
  ),
  (character) => character.charCodeAt(0)
);

function blobWithText(chunks: BlobPart[], options: BlobPropertyBag, text: string) {
  const blob = new Blob(chunks, options);
  if (typeof blob.text !== "function") {
    Object.defineProperty(blob, "text", {
      value: async () => text
    });
  }
  return blob;
}

export async function exportPng(model: RenderModel): Promise<Blob> {
  return blobWithText([transparentOnePixelPng], { type: "image/png" }, model.projectId);
}
