#!/usr/bin/env node
/**
 * Ekstrak teks dari PDF materi kuliah, dikelompokkan per halaman.
 *
 * Pemakaian:
 *   node tools/extract-pdf.mjs materi.pdf
 *   node tools/extract-pdf.mjs materi.pdf hasil.txt
 *
 * Persiapan:
 *   npm --prefix tools install
 */

import fs from "node:fs";
import path from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath) {
  console.error("Pemakaian: node tools/extract-pdf.mjs <file.pdf> [keluaran.txt]");
  process.exit(1);
}

const absoluteInput = path.resolve(inputPath);

if (!fs.existsSync(absoluteInput)) {
  console.error(`Berkas tidak ditemukan: ${absoluteInput}`);
  process.exit(1);
}

const data = new Uint8Array(fs.readFileSync(absoluteInput));
const doc = await getDocument({ data, useSystemFonts: true }).promise;

let result = "";

for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
  const page = await doc.getPage(pageNumber);
  const content = await page.getTextContent();

  let lastY = null;
  let line = "";
  const lines = [];

  for (const item of content.items) {
    if (!("str" in item)) continue;

    const y = item.transform[5];

    if (lastY !== null && Math.abs(y - lastY) > 2) {
      lines.push(line);
      line = "";
    }

    line += item.str;
    lastY = y;
  }

  lines.push(line);

  result += `\n=== PAGE ${pageNumber} ===\n`;
  result += lines.filter((entry) => entry.trim()).join("\n");
  result += "\n";
}

if (outputPath) {
  fs.writeFileSync(path.resolve(outputPath), result, "utf8");
  console.log(`Tersimpan: ${path.resolve(outputPath)} (${doc.numPages} halaman)`);
} else {
  console.log(`Halaman: ${doc.numPages}`);
  console.log(result);
}
