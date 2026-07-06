import { render, screen } from "@testing-library/react";
import { App } from "../../src/app/App";

it("starts at image import", () => {
  render(<App />);

  expect(
    screen.getByRole("heading", { name: "把图片变成拼豆模板" })
  ).toBeVisible();
  expect(screen.getByLabelText("选择图片")).toBeEnabled();
});
