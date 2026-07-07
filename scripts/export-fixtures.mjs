import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outDir = join(process.cwd(), "work", "export-fixtures");
await mkdir(outDir, { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" data-columns="3" data-rows="2" width="60" height="100" viewBox="0 0 60 100">
<rect data-cell="0" x="0" y="0" width="20" height="20" fill="#FAF4C8" stroke="#B8B1A4"/><text x="10" y="13" text-anchor="middle" font-size="7">A1</text>
<rect data-cell="1" x="20" y="0" width="20" height="20" fill="#FFFFFF" stroke="#B8B1A4"/><text x="30" y="13" text-anchor="middle" font-size="7">B2</text>
<rect data-cell="2" x="40" y="0" width="20" height="20" fill="#FAF4C8" stroke="#B8B1A4"/><text x="50" y="13" text-anchor="middle" font-size="7">A1</text>
<g data-palette-code="A1"><text x="0" y="60" font-size="12">A1 × 2</text></g>
<g data-palette-code="B2"><text x="0" y="78" font-size="12">B2 × 1</text></g>
</svg>`;

const pdf = `%PDF-1.3
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 72 >>
stream
BT /F1 12 Tf 40 780 Td (MARD bead pattern fixture - print at 100%) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f 
trailer
<< /Root 1 0 R /Size 5 >>
startxref
275
%%EOF`;

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64"
);

await writeFile(join(outDir, "sample.svg"), svg);
await writeFile(join(outDir, "sample.pdf"), pdf);
await writeFile(join(outDir, "sample.png"), png);
console.log(`Wrote export fixtures to ${outDir}`);
