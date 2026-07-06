# AI Bead Pattern Website MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive, local-first website that converts an image into an editable MARD bead grid, exports usable patterns, and tracks per-color assembly progress.

**Architecture:** Use a client-only React application so customer images and projects remain in the browser. Keep image segmentation, deterministic raster conversion, palette matching, editing, persistence, assembly mode, and export behind separate typed modules; the first runnable slice uses a manual/alpha subject mask, then adds local AI segmentation without changing the grid engine.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, Playwright, Zustand, Dexie/IndexedDB, Canvas 2D, culori, jsPDF, svg.js, Transformers.js/ONNX Runtime Web.

---

## Delivery phases

1. **Core MVP:** Project shell, board presets, palette data, deterministic conversion, editor, local saving, assembly mode, PNG/project export.
2. **Production pattern output:** PDF/SVG, split-board coordinates, print calibration, inventory replacement and risk reporting.
3. **Local AI enhancement:** Browser-local foreground segmentation and protected-feature masks. The deterministic grid remains the source of truth.

## Planned file structure

```text
src/
  app/App.tsx                     route-free application state machine
  app/useProjectStore.ts         active project and undo/redo orchestration
  domain/project.ts              versioned project schema
  domain/boards.ts               bead and board presets
  domain/palette.ts              palette types and inventory filtering
  domain/grid.ts                 immutable grid types and helpers
  data/mard-291.v1.json           versioned MARD palette snapshot
  engine/color.ts                Lab conversion and Delta E matching
  engine/rasterize.ts            deterministic image-to-grid sampling
  engine/outline.ts              mask metrics and 10% deviation checks
  engine/optimize.ts             noise, rare-color and connectivity analysis
  segmentation/segmenter.ts      segmentation interface
  segmentation/localAi.ts        local browser AI adapter
  persistence/projects.ts        IndexedDB repository and migrations
  editor/GridCanvas.tsx          shared zoomable canvas
  editor/EditorScreen.tsx        editing tools and overlays
  assembly/AssemblyScreen.tsx    color focus and completion progress
  export/png.ts                  PNG renderer
  export/svg.ts                  SVG renderer
  export/pdf.ts                  printable PDF and split-board pages
  screens/ImportScreen.tsx       upload and subject setup
  screens/SetupScreen.tsx        bead, board, direction and palette settings
  screens/VariantsScreen.tsx     three candidate comparison
tests/
  unit/                           domain and engine tests
  component/                      editor and assembly tests
  e2e/                            complete customer flows
```

### Task 1: Initialize the repository and testable web shell

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `tests/component/App.test.tsx`

- [ ] **Step 1: Initialize local version control**

Run: `git init && git branch -M main`

Expected: an empty local repository on branch `main`; this does not create or publish a GitHub repository.

- [ ] **Step 2: Write the shell test**

```tsx
import { render, screen } from "@testing-library/react";
import { App } from "../../src/app/App";

it("starts at image import", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: "把图片变成拼豆模板" })).toBeVisible();
  expect(screen.getByLabelText("选择图片")).toBeEnabled();
});
```

- [ ] **Step 3: Add Vite, React, Vitest and Playwright dependencies**

Run: `npm install react react-dom zustand dexie culori jspdf @svgdotjs/svg.js && npm install -D typescript vite @vitejs/plugin-react vitest jsdom @testing-library/react @testing-library/jest-dom @playwright/test`

Expected: dependencies install without audit-blocking errors and a lockfile is created.

- [ ] **Step 4: Run the test and verify the missing shell fails**

Run: `npm test -- --run tests/component/App.test.tsx`

Expected: FAIL because `src/app/App.tsx` does not exist.

- [ ] **Step 5: Implement the minimal import screen shell**

```tsx
export function App() {
  return (
    <main>
      <h1>把图片变成拼豆模板</h1>
      <label>
        选择图片
        <input aria-label="选择图片" type="file" accept="image/png,image/jpeg,image/webp" />
      </label>
    </main>
  );
}
```

- [ ] **Step 6: Run tests and commit**

Run: `npm test -- --run tests/component/App.test.tsx`

Expected: PASS.

Run: `git add . && git commit -m "chore: initialize bead pattern web app"`

### Task 2: Define versioned project, board and grid models

**Files:**
- Create: `src/domain/project.ts`
- Create: `src/domain/boards.ts`
- Create: `src/domain/grid.ts`
- Create: `tests/unit/boards.test.ts`
- Create: `tests/unit/project.test.ts`

- [ ] **Step 1: Write board and project schema tests**

```ts
import { boardPresets, resolveBoard } from "../../src/domain/boards";

it("keeps bead size separate from board dimensions", () => {
  expect(resolveBoard("square-25", "mini-2.6").columns).toBe(25);
  expect(resolveBoard("square-25", "standard-5").columns).toBe(25);
});

it("defines the physical large format through pitch", () => {
  const board = resolveBoard("physical-26x20", "standard-5");
  expect(board.physicalWidthMm).toBeCloseTo(260, 0);
  expect(board.physicalHeightMm).toBeCloseTo(200, 0);
  expect(board.columns).toBeGreaterThan(0);
  expect(board.rows).toBeGreaterThan(0);
});
```

```ts
import { createProject } from "../../src/domain/project";

it("pins projects to schema and palette versions", () => {
  const project = createProject();
  expect(project.schemaVersion).toBe(1);
  expect(project.paletteVersion).toBe("mard-291-v1");
});
```

- [ ] **Step 2: Verify tests fail**

Run: `npm test -- --run tests/unit/boards.test.ts tests/unit/project.test.ts`

Expected: FAIL with missing domain modules.

- [ ] **Step 3: Implement explicit types and presets**

```ts
export type BeadSizeId = "mini-2.6" | "standard-5";
export type BoardPresetId = "square-25" | "square-29" | "square-30" | "square-50" | "physical-26x20";

export interface ResolvedBoard {
  columns: number;
  rows: number;
  pitchMm: number;
  physicalWidthMm: number;
  physicalHeightMm: number;
}
```

Store the actual pitch in each bead preset and calculate physical-format rows and columns with `Math.floor(targetMm / pitchMm)`. Do not infer pitch elsewhere.

- [ ] **Step 4: Run tests and commit**

Run: `npm test -- --run tests/unit/boards.test.ts tests/unit/project.test.ts`

Expected: PASS.

Run: `git add src/domain tests/unit && git commit -m "feat: define versioned bead project model"`

### Task 3: Import and validate the MARD 291 palette snapshot

**Files:**
- Create: `scripts/validate-palette.mjs`
- Create: `src/data/mard-291.v1.json`
- Create: `src/domain/palette.ts`
- Create: `tests/unit/palette.test.ts`

- [ ] **Step 1: Create validation tests before adding palette data**

```ts
import palette from "../../src/data/mard-291.v1.json";

it("contains 291 unique MARD codes and valid hex colors", () => {
  expect(palette).toHaveLength(291);
  expect(new Set(palette.map(x => x.code)).size).toBe(291);
  expect(palette.every(x => /^[A-Z][0-9]+$/.test(x.code))).toBe(true);
  expect(palette.every(x => /^#[0-9A-F]{6}$/i.test(x.hex))).toBe(true);
});
```

- [ ] **Step 2: Verify the test fails because the snapshot is absent**

Run: `npm test -- --run tests/unit/palette.test.ts`

Expected: FAIL with missing JSON module.

- [ ] **Step 3: Build a reviewed snapshot**

Create records with this exact schema:

```json
[{ "code": "A1", "hex": "#FAF4C8", "nameZh": "A1", "source": "pixel-beads-2026-07-06" }]
```

Populate all 291 records from the agreed reference, then run `node scripts/validate-palette.mjs`. The validator must reject duplicate codes, invalid hex values, and a count other than 291. Store the source date because the reference page can change.

- [ ] **Step 4: Add inventory filtering**

```ts
export function activePalette(all: PaletteColor[], ownedCodes?: Set<string>) {
  return ownedCodes ? all.filter(color => ownedCodes.has(color.code)) : all;
}
```

- [ ] **Step 5: Run tests and commit**

Run: `node scripts/validate-palette.mjs && npm test -- --run tests/unit/palette.test.ts`

Expected: validator prints `291 valid colors`; tests PASS.

Run: `git add scripts src/data src/domain/palette.ts tests/unit/palette.test.ts && git commit -m "feat: add versioned MARD 291 palette"`

### Task 4: Implement deterministic rasterization and Lab color matching

**Files:**
- Create: `src/engine/color.ts`
- Create: `src/engine/rasterize.ts`
- Create: `tests/unit/color.test.ts`
- Create: `tests/unit/rasterize.test.ts`

- [ ] **Step 1: Write exact matching and aspect-ratio tests**

```ts
it("selects the perceptually nearest allowed color", () => {
  const result = nearestMard("#FAF5C9", [
    { code: "A1", hex: "#FAF4C8" },
    { code: "H7", hex: "#000000" }
  ]);
  expect(result.code).toBe("A1");
});

it("letterboxes rather than stretching the source", () => {
  const placement = containRect({ width: 400, height: 200 }, { columns: 25, rows: 25 });
  expect(placement.width / placement.height).toBe(2);
  expect(placement.height).toBeLessThan(25);
});
```

- [ ] **Step 2: Verify tests fail**

Run: `npm test -- --run tests/unit/color.test.ts tests/unit/rasterize.test.ts`

Expected: FAIL with missing engine modules.

- [ ] **Step 3: Implement deterministic conversion**

Use `culori` to convert sRGB to Lab and compute Delta E. Sample each target cell from a fixed source rectangle, ignore pixels outside the foreground mask, and break equal-distance ties by MARD code so output is deterministic.

```ts
export interface RasterizeOptions {
  columns: number;
  rows: number;
  palette: readonly PaletteColor[];
  mask?: ImageData;
  mode: "fidelity" | "balanced" | "easy";
}
```

- [ ] **Step 4: Run tests twice to confirm determinism and commit**

Run: `npm test -- --run tests/unit/color.test.ts tests/unit/rasterize.test.ts && npm test -- --run tests/unit/rasterize.test.ts`

Expected: both runs PASS with identical snapshots.

Run: `git add src/engine tests/unit && git commit -m "feat: add deterministic image to bead conversion"`

### Task 5: Add outline deviation and buildability analysis

**Files:**
- Create: `src/engine/outline.ts`
- Create: `src/engine/optimize.ts`
- Create: `tests/unit/outline.test.ts`
- Create: `tests/unit/optimize.test.ts`

- [ ] **Step 1: Write tests for the 10% guard and isolated cells**

```ts
it("rejects automatic outline changes over ten percent", () => {
  const report = compareMasks(originalMask, changedMask);
  expect(report.areaChangeRatio).toBeGreaterThan(0.10);
  expect(report.withinAutomaticLimit).toBe(false);
});

it("reports but does not silently remove a one-cell island", () => {
  const report = analyzeBuildability(gridWithIsland);
  expect(report.issues).toContainEqual(expect.objectContaining({ type: "isolated-cell" }));
  expect(report.grid).toEqual(gridWithIsland);
});
```

- [ ] **Step 2: Verify tests fail**

Run: `npm test -- --run tests/unit/outline.test.ts tests/unit/optimize.test.ts`

Expected: FAIL with missing analysis modules.

- [ ] **Step 3: Implement metrics and non-destructive suggestions**

Compute area change, intersection-over-union, normalized edge distance and connected components. Return suggested patches separately from the grid; applying a patch is an explicit undoable project action.

- [ ] **Step 4: Run tests and commit**

Run: `npm test -- --run tests/unit/outline.test.ts tests/unit/optimize.test.ts`

Expected: PASS.

Run: `git add src/engine tests/unit && git commit -m "feat: validate outline and bead buildability"`

### Task 6: Build import, setup and three-variant comparison

**Files:**
- Create: `src/screens/ImportScreen.tsx`
- Create: `src/screens/SetupScreen.tsx`
- Create: `src/screens/VariantsScreen.tsx`
- Modify: `src/app/App.tsx`
- Create: `tests/component/ConversionFlow.test.tsx`

- [ ] **Step 1: Write the customer flow test**

```tsx
it("produces three labeled candidates", async () => {
  render(<App />);
  await uploadFixture("simple-cat.png");
  await userEvent.click(screen.getByLabelText("5mm普通豆"));
  await userEvent.click(screen.getByLabelText("25×25格"));
  await userEvent.click(screen.getByRole("button", { name: "生成模板" }));
  expect(await screen.findByText("高还原版")).toBeVisible();
  expect(screen.getByText("推荐成品版")).toBeVisible();
  expect(screen.getByText("易拼版")).toBeVisible();
});
```

- [ ] **Step 2: Verify the flow fails**

Run: `npm test -- --run tests/component/ConversionFlow.test.tsx`

Expected: FAIL because the screens and state transitions are absent.

- [ ] **Step 3: Implement the screens and explicit state machine**

Use these application states: `import`, `setup`, `generating`, `variants`, `editing`, `assembly`. Keep the original image blob and generated variants in project state. Generation failure returns to setup without discarding the upload.

- [ ] **Step 4: Run tests and commit**

Run: `npm test -- --run tests/component/ConversionFlow.test.tsx`

Expected: PASS.

Run: `git add src/app src/screens tests/component && git commit -m "feat: add image conversion workflow"`

### Task 7: Implement the responsive grid editor and undo history

**Files:**
- Create: `src/app/useProjectStore.ts`
- Create: `src/editor/GridCanvas.tsx`
- Create: `src/editor/EditorScreen.tsx`
- Create: `tests/component/EditorScreen.test.tsx`
- Create: `tests/e2e/mobile-editor.spec.ts`

- [ ] **Step 1: Test editing, outline locking and undo**

```tsx
it("edits one cell and restores it with undo", async () => {
  render(<EditorScreen project={projectFixture} />);
  await selectColor("C7");
  await clickGridCell(4, 6);
  expect(readGridCell(4, 6)).toBe("C7");
  await userEvent.click(screen.getByRole("button", { name: "撤销" }));
  expect(readGridCell(4, 6)).toBe(projectFixture.grid[6][4]);
});
```

- [ ] **Step 2: Verify the editor test fails**

Run: `npm test -- --run tests/component/EditorScreen.test.tsx`

Expected: FAIL with missing editor modules.

- [ ] **Step 3: Implement immutable grid commands**

Define commands `paintCells`, `eraseCells`, `replaceColor`, `applySuggestion` and `setPlacement`. Each command stores its inverse. Locked outline cells reject paint/erase commands and return a visible reason.

- [ ] **Step 4: Implement pointer behavior**

Canvas uses Pointer Events. Mouse drag paints only while a tool is selected; touch uses two fingers to pan/zoom and requires an explicit paint mode for single-finger editing. Provide keyboard undo/redo on desktop and visible buttons everywhere.

- [ ] **Step 5: Run component and mobile tests, then commit**

Run: `npm test -- --run tests/component/EditorScreen.test.tsx && npx playwright test tests/e2e/mobile-editor.spec.ts --project=chromium`

Expected: PASS; mobile viewport can zoom without accidental paint.

Run: `git add src/app src/editor tests && git commit -m "feat: add responsive bead grid editor"`

### Task 8: Add local project persistence and portable project files

**Files:**
- Create: `src/persistence/projects.ts`
- Create: `src/persistence/projectFile.ts`
- Create: `tests/unit/persistence.test.ts`
- Create: `tests/unit/projectFile.test.ts`

- [ ] **Step 1: Test save/restore and corrupt imports**

```ts
it("restores grid, inventory and assembly progress", async () => {
  await repository.save(projectFixture);
  expect(await repository.load(projectFixture.id)).toEqual(projectFixture);
});

it("does not overwrite the current project with a corrupt file", async () => {
  await expect(importProject(new Blob(["not json"]))).rejects.toThrow("项目文件无效");
  expect(store.getState().project.id).toBe(currentProject.id);
});
```

- [ ] **Step 2: Verify tests fail**

Run: `npm test -- --run tests/unit/persistence.test.ts tests/unit/projectFile.test.ts`

Expected: FAIL with missing persistence modules.

- [ ] **Step 3: Implement IndexedDB and schema migration**

Use Dexie tables `projects`, `images`, and `settings`. Autosave after 500ms of inactivity. Catch quota errors and offer immediate project export. Validate imported JSON before modifying the store.

- [ ] **Step 4: Run tests and commit**

Run: `npm test -- --run tests/unit/persistence.test.ts tests/unit/projectFile.test.ts`

Expected: PASS.

Run: `git add src/persistence tests/unit && git commit -m "feat: save bead projects locally"`

### Task 9: Build assembly mode with bottom palette and progress

**Files:**
- Create: `src/assembly/orderColors.ts`
- Create: `src/assembly/AssemblyScreen.tsx`
- Create: `tests/unit/orderColors.test.ts`
- Create: `tests/component/AssemblyScreen.test.tsx`

- [ ] **Step 1: Test color focus, ordering and progress**

```tsx
it("highlights the selected color and dims every other bead", async () => {
  render(<AssemblyScreen project={projectFixture} />);
  await userEvent.click(screen.getByRole("button", { name: /C7/ }));
  expect(gridCellsFor("C7").every(cell => cell.dataset.focused === "true")).toBe(true);
  expect(gridCellsExcept("C7").every(cell => cell.dataset.dimmed === "true")).toBe(true);
});

it("marks a focused cell complete without editing its color", async () => {
  const before = projectFixture.grid[2][3];
  await clickGridCell(3, 2);
  expect(readGridCell(3, 2)).toBe(before);
  expect(screen.getByText(/已完成 1\//)).toBeVisible();
});
```

- [ ] **Step 2: Verify tests fail**

Run: `npm test -- --run tests/component/AssemblyScreen.test.tsx tests/unit/orderColors.test.ts`

Expected: FAIL with missing assembly modules.

- [ ] **Step 3: Implement recommended ordering**

Classify colors by their cells: outline/connector colors first, then descending connected-area size, internal colors, highlights/shadows, and finally colors with very low counts. Use MARD code as a deterministic tie-breaker. Also expose code order and quantity order.

- [ ] **Step 4: Implement the fixed bottom palette**

Render only used colors. Each button shows swatch, code, total count and completion count. Selected cells remain fully opaque; non-selected cells render at 10% opacity while grid, coordinates and split lines remain opaque. On mobile, the bar scrolls horizontally; on desktop it can wrap.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- --run tests/component/AssemblyScreen.test.tsx tests/unit/orderColors.test.ts`

Expected: PASS.

Run: `git add src/assembly tests && git commit -m "feat: add guided bead assembly mode"`

### Task 10: Export PNG, SVG, PDF and inventory lists

**Files:**
- Create: `src/export/renderModel.ts`
- Create: `src/export/png.ts`
- Create: `src/export/svg.ts`
- Create: `src/export/pdf.ts`
- Create: `tests/unit/export.test.ts`

- [ ] **Step 1: Test all exports against one render model**

```ts
it("uses identical dimensions and counts in every export", async () => {
  const model = createRenderModel(projectFixture);
  expect(model.columns).toBe(projectFixture.board.columns);
  expect(sumCounts(model.palette)).toBe(countOccupied(projectFixture.grid));
  expect(await inspectSvg(exportSvg(model))).toMatchObject({ columns: model.columns, rows: model.rows });
  expect(await inspectPdf(exportPdf(model))).toMatchObject({ paletteCount: model.palette.length });
});
```

- [ ] **Step 2: Verify tests fail**

Run: `npm test -- --run tests/unit/export.test.ts`

Expected: FAIL with missing export modules.

- [ ] **Step 3: Implement shared render model and formats**

The render model contains grid, coordinates, split lines, palette counts and physical pitch. PNG is a preview. SVG includes grid and code labels. PDF includes a 100mm calibration ruler, print-at-100% instruction, overview page, per-board pages and color inventory. Never derive counts separately inside exporters.

- [ ] **Step 4: Run tests and manually inspect samples**

Run: `npm test -- --run tests/unit/export.test.ts && npm run export:fixtures`

Expected: PASS and sample files appear under `work/export-fixtures/` with matching counts and legible coordinates.

- [ ] **Step 5: Commit**

Run: `git add src/export tests/unit package.json && git commit -m "feat: export printable bead patterns"`

### Task 11: Add browser-local AI foreground segmentation

**Files:**
- Create: `src/segmentation/segmenter.ts`
- Create: `src/segmentation/localAi.ts`
- Create: `src/segmentation/manualMask.ts`
- Modify: `src/screens/ImportScreen.tsx`
- Create: `tests/unit/segmenter.test.ts`
- Create: `tests/e2e/segmentation-fallback.spec.ts`

- [ ] **Step 1: Define the adapter contract and fallback tests**

```ts
export interface Segmenter {
  segment(image: ImageBitmap, signal: AbortSignal): Promise<ImageData>;
}

it("keeps the image and offers manual selection when local AI fails", async () => {
  fakeSegmenter.segment.mockRejectedValue(new Error("model unavailable"));
  await uploadFixture("cat.png");
  expect(await screen.findByText("自动去背景失败，图片仍已保留")).toBeVisible();
  expect(screen.getByRole("button", { name: "手动选择主体" })).toBeEnabled();
});
```

- [ ] **Step 2: Verify tests fail**

Run: `npm test -- --run tests/unit/segmenter.test.ts && npx playwright test tests/e2e/segmentation-fallback.spec.ts`

Expected: FAIL with missing segmentation adapter.

- [ ] **Step 3: Implement local-only inference**

Use a browser-compatible foreground segmentation ONNX model through Transformers.js or ONNX Runtime Web. Load model assets from the application origin, cache them with the service worker, and never upload image pixels. Expose progress, cancellation and a manual-mask fallback. Record model id/version in project metadata, but store the resulting mask so reopening a project does not rerun inference.

- [ ] **Step 4: Add protected-feature masks conservatively**

Treat feature detection as advisory. Mark detected face/eye/text areas as protected during noise cleanup; if detection is uncertain, retain cells instead of deleting them. The AI output may constrain optimization but may not directly assign final MARD codes.

- [ ] **Step 5: Run tests with network disabled after first model cache**

Run: `npm test -- --run tests/unit/segmenter.test.ts && npx playwright test tests/e2e/segmentation-fallback.spec.ts`

Expected: PASS; cached segmentation works offline and fallback keeps the original image.

- [ ] **Step 6: Commit**

Run: `git add src/segmentation src/screens tests && git commit -m "feat: add local AI subject segmentation"`

### Task 12: Complete responsive, accessibility and end-to-end verification

**Files:**
- Create: `tests/e2e/full-flow.spec.ts`
- Create: `tests/e2e/project-resume.spec.ts`
- Create: `tests/e2e/export.spec.ts`
- Modify: `src/**/*.css`
- Modify: `README.md`

- [ ] **Step 1: Write one complete customer journey**

```ts
test("upload, edit, assemble, reload and export", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("选择图片").setInputFiles("tests/fixtures/simple-cat.png");
  await page.getByLabel("5mm普通豆").check();
  await page.getByLabel("25×25格").check();
  await page.getByRole("button", { name: "生成模板" }).click();
  await page.getByText("推荐成品版").click();
  await page.getByRole("button", { name: "进入拼豆模式" }).click();
  await page.getByRole("button", { name: /C7/ }).click();
  await page.locator("[data-cell='3,2']").click();
  await page.reload();
  await expect(page.getByText(/已完成 1\//)).toBeVisible();
  await page.getByRole("button", { name: "导出PDF" }).click();
});
```

- [ ] **Step 2: Verify the new end-to-end tests expose remaining gaps**

Run: `npx playwright test tests/e2e/full-flow.spec.ts tests/e2e/project-resume.spec.ts tests/e2e/export.spec.ts`

Expected: FAIL only at behaviors not yet connected end-to-end; record each failure before changing code.

- [ ] **Step 3: Finish responsive and accessible behavior**

Use 44px minimum touch targets, visible focus states, text labels in addition to swatches, keyboard-accessible palette selection, screen-reader progress announcements and reduced-motion support. Ensure the fixed mobile palette does not cover the active grid cell.

- [ ] **Step 4: Run the full quality gate**

Run: `npm test -- --run && npm run build && npx playwright test`

Expected: all unit/component tests PASS, TypeScript production build succeeds, and end-to-end tests pass on desktop and mobile Chromium viewports.

- [ ] **Step 5: Document local operation and commit**

README must state supported formats, local storage behavior, project backup procedure, MARD palette snapshot date, physical-size caveat, AI model caching, and exact commands `npm install`, `npm run dev`, `npm test`, and `npm run build`.

Run: `git add README.md src tests && git commit -m "test: verify complete bead pattern workflow"`

## Final release verification

- [ ] Run `npm test -- --run` and record the passing test count.
- [ ] Run `npm run build` and confirm there are no TypeScript or bundler errors.
- [ ] Run `npx playwright test` at desktop and mobile viewports.
- [ ] Generate one 25×25, one 50×50 and one 26×20cm split-board sample.
- [ ] Verify every sample's occupied-cell count equals its inventory total.
- [ ] Print the PDF calibration page at 100% and measure the 100mm ruler.
- [ ] Disconnect the network and verify an already-cached project, editor, assembly mode and cached AI model still work.
- [ ] Export a project, clear site storage, import it, and confirm grid, palette, inventory and completion progress are restored.

