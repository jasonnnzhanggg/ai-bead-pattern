import { expect, test } from "@playwright/test";
import { paintOneC7Cell, uploadAndOpenEditor } from "./helpers";

test("exports a PDF from the shared render model", async ({ page }) => {
  await uploadAndOpenEditor(page);
  await paintOneC7Cell(page);
  await page.getByRole("button", { name: "进入拼豆模式" }).click();

  await page.getByRole("button", { name: "导出PDF" }).click();

  await expect(page.getByRole("status")).toContainText("PDF已生成");
});
