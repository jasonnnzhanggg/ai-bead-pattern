import { expect, test } from "@playwright/test";
import { paintOneC7Cell, uploadAndOpenEditor } from "./helpers";

test("reload resumes the current bead project locally", async ({ page }) => {
  await uploadAndOpenEditor(page);
  await paintOneC7Cell(page);
  await page.getByRole("button", { name: "进入拼豆模式" }).click();
  await page.getByRole("button", { name: /C7/ }).click();
  await page.getByRole("gridcell", { name: "第1行第1列 C7" }).click();

  await page.reload();

  await expect(page.getByRole("heading", { name: "按颜色完成拼豆" })).toBeVisible();
  await expect(page.getByRole("gridcell", { name: "第1行第1列 C7 已完成" })).toBeVisible();
});
