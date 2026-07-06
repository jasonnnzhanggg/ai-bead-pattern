import { mkdir, readFile, writeFile } from "node:fs/promises";

const inputPath = new URL("../work/mard-color-chart.html", import.meta.url);
const outputPath = new URL("../src/data/mard-291.v1.json", import.meta.url);
const html = await readFile(inputPath, "utf8");
const cardPattern =
  /style="background-color:(#[0-9A-Fa-f]{6})"[\s\S]{0,900}?">#<!-- -->([A-Z]+[0-9]+)<\/div>/g;

const colors = [...html.matchAll(cardPattern)].map((match) => ({
  code: match[2],
  hex: match[1].toUpperCase(),
  nameZh: match[2],
  source: "pixel-beads-2026-07-06"
}));

if (colors.length !== 291) {
  throw new Error(`Expected 291 palette records, found ${colors.length}`);
}

if (new Set(colors.map(({ code }) => code)).size !== colors.length) {
  throw new Error("Palette contains duplicate MARD codes");
}

await mkdir(new URL("../src/data/", import.meta.url), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(colors, null, 2)}\n`, "utf8");
console.log(`Imported ${colors.length} MARD colors`);
