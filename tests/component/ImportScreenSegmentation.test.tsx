import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImportScreen } from "../../src/screens/ImportScreen";
import type { Segmenter } from "../../src/segmentation/segmenter";

it("keeps the image and offers manual selection when local AI fails", async () => {
  const user = userEvent.setup();
  const onImageChange = vi.fn();
  const fakeSegmenter: Segmenter = {
    metadata: { modelId: "test", modelVersion: "v1" },
    segment: vi.fn(async () => {
      throw new Error("model unavailable");
    })
  };
  const image = new File(["image"], "cat.png", { type: "image/png" });

  render(
    <ImportScreen
      image={null}
      onImageChange={onImageChange}
      onContinue={vi.fn()}
      segmenter={fakeSegmenter}
    />
  );

  await user.upload(screen.getByLabelText("选择图片"), image);

  expect(onImageChange).toHaveBeenCalledWith(image);
  expect(await screen.findByText("自动去背景失败，图片仍已保留")).toBeVisible();
  expect(screen.getByRole("button", { name: "手动选择主体" })).toBeEnabled();
  await waitFor(() => expect(fakeSegmenter.segment).toHaveBeenCalled());
});
