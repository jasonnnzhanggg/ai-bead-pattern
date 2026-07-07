import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../../src/app/App";
import type { BeadGrid } from "../../src/domain/grid";

it("moves from image upload to board setup and three candidates", async () => {
  const user = userEvent.setup();
  render(<App />);
  const image = new File(["image"], "cat.png", { type: "image/png" });

  await user.upload(screen.getByLabelText("选择图片"), image);
  expect(screen.getByText("cat.png")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "继续设置" }));

  expect(screen.getByRole("heading", { name: "选择制作规格" })).toBeVisible();
  await user.click(screen.getByLabelText("5mm普通豆"));
  await user.click(screen.getByLabelText("25×25格"));
  await user.click(screen.getByRole("button", { name: "生成模板" }));

  expect(screen.getByText("高还原版")).toBeVisible();
  expect(screen.getByText("推荐成品版")).toBeVisible();
  expect(screen.getByText("易拼版")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "选择推荐成品版" }));
  expect(screen.getByRole("heading", { name: "编辑拼豆模板" })).toBeVisible();
});

it("fills the editor grid from the uploaded image when a candidate is selected", async () => {
  const user = userEvent.setup();
  const convertedGrid: BeadGrid = {
    columns: 25,
    rows: 25,
    cells: Array<string | null>(25 * 25).fill("C7")
  };
  const imageToGrid = vi.fn().mockResolvedValue(convertedGrid);

  render(<App imageToGrid={imageToGrid} />);
  const image = new File(["image"], "cat.png", { type: "image/png" });

  await user.upload(screen.getByLabelText("选择图片"), image);
  await user.click(screen.getByRole("button", { name: "继续设置" }));
  await user.click(screen.getByLabelText("25×25格"));
  await user.click(screen.getByRole("button", { name: "生成模板" }));
  await user.click(screen.getByRole("button", { name: "选择推荐成品版" }));

  expect(imageToGrid).toHaveBeenCalledWith(
    image,
    expect.objectContaining({ columns: 25, rows: 25 })
  );
  expect(await screen.findByRole("heading", { name: "编辑拼豆模板" })).toBeVisible();
  expect(screen.getAllByRole("gridcell", { name: /C7/ })).toHaveLength(25 * 25);
});

it("can go back from the editor to choose another candidate", async () => {
  const user = userEvent.setup();
  const convertedGrid: BeadGrid = {
    columns: 25,
    rows: 25,
    cells: Array<string | null>(25 * 25).fill("C7")
  };

  render(<App imageToGrid={vi.fn().mockResolvedValue(convertedGrid)} />);
  const image = new File(["image"], "cat.png", { type: "image/png" });

  await user.upload(screen.getByLabelText("选择图片"), image);
  await user.click(screen.getByRole("button", { name: "继续设置" }));
  await user.click(screen.getByLabelText("25×25格"));
  await user.click(screen.getByRole("button", { name: "生成模板" }));
  await user.click(screen.getByRole("button", { name: "选择推荐成品版" }));

  expect(await screen.findByRole("heading", { name: "编辑拼豆模板" })).toBeVisible();
  await user.click(screen.getByRole("button", { name: "返回方案" }));

  expect(screen.getByRole("heading", { name: "选择一个成品方案" })).toBeVisible();
  expect(screen.getByText("cat.png")).toBeVisible();
});

it("keeps the upload screen when no image is selected", async () => {
  const user = userEvent.setup();
  render(<App />);

  expect(screen.getByRole("button", { name: "继续设置" })).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "继续设置" }));
  expect(screen.getByRole("heading", { name: "把图片变成拼豆模板" })).toBeVisible();
});
