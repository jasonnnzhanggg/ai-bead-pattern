import { readFile } from "node:fs/promises";

const palettePath = new URL("../src/data/mard-291.v1.json", import.meta.url);
const palette = JSON.parse(await readFile(palettePath, "utf8"));

if (!Array.isArray(palette) || palette.length !== 291) {
  throw new Error("Palette must contain exactly 291 records");
}

const uniqueCodes = new Set();

for (const color of palette) {
  if (!/^[A-Z]+[0-9]+$/.test(color.code)) {
    throw new Error(`Invalid MARD code: ${color.code}`);
  }
  if (!/^#[0-9A-F]{6}$/.test(color.hex)) {
    throw new Error(`Invalid HEX value for ${color.code}: ${color.hex}`);
  }
  if (uniqueCodes.has(color.code)) {
    throw new Error(`Duplicate MARD code: ${color.code}`);
  }
  uniqueCodes.add(color.code);
}

console.log("291 valid colors");
