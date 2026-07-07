import type { Page } from "@playwright/test";

export const simplePng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64"
);

export async function uploadAndOpenEditor(page: Page) {
  await page.goto("/");
  await page.getByLabel("选择图片").setInputFiles({
    name: "simple-cat.png",
    mimeType: "image/png",
    buffer: simplePng
  });
  await page.getByRole("button", { name: "继续设置" }).click();
  await page.getByLabel("5mm普通豆").check();
  await page.getByLabel("25×25格").check();
  await page.getByRole("button", { name: "生成模板" }).click();
  await page.getByRole("button", { name: "选择推荐成品版" }).click();
}

export async function paintOneC7Cell(page: Page) {
  await page.getByRole("button", { name: "选择色号C7" }).click();
  await page.getByRole("gridcell", { name: "第1行第1列 空白" }).click();
}
