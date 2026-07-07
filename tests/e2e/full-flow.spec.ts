import { expect, test } from "@playwright/test";
import { paintOneC7Cell, uploadAndOpenEditor } from "./helpers";

test("upload, edit, assemble, reload and export", async ({ page }) => {
  await uploadAndOpenEditor(page);
  await paintOneC7Cell(page);
  await page.getByRole("button", { name: "进入拼豆模式" }).click();
  await page.getByRole("button", { name: /C7/ }).click();
  await page.getByRole("gridcell", { name: "第1行第1列 C7" }).click();

  await page.reload();

  await expect(page.getByText(/已完成 1\//)).toBeVisible();
  await page.getByRole("button", { name: "导出PDF" }).click();
  await expect(page.getByRole("status")).toContainText("PDF已生成");
});
