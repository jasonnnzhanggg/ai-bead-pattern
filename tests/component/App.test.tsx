import { render, screen } from "@testing-library/react";
import { App } from "../../src/app/App";

it("starts at image import", () => {
  render(<App />);

  expect(
    screen.getByRole("heading", { name: "把图片变成拼豆模板" })
  ).toBeVisible();
  expect(screen.getByLabelText("选择图片")).toBeEnabled();
});

it("ignores invalid saved progress instead of rendering a blank page", () => {
  localStorage.setItem(
    "ai-bead-pattern.active-project.v1",
    JSON.stringify({
      step: "editing",
      project: {
        id: "broken-project",
        grid: { columns: 30, rows: 30 }
      }
    })
  );

  render(<App />);

  expect(
    screen.getByRole("heading", { name: "把图片变成拼豆模板" })
  ).toBeVisible();
  expect(localStorage.getItem("ai-bead-pattern.active-project.v1")).toBeNull();
});
