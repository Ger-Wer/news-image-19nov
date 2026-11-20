// main.ts — entry program for news-image-20261119.
// Copies the pre-rendered entry.png into the output directory.
import { copyFileSync, mkdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "out";
mkdirSync(outDir, { recursive: true });
const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "entry.png");
const dst = join(outDir, "entry.png");
copyFileSync(src, dst);
const { size } = statSync(dst);
console.log(`copied entry.png (${size} bytes) to ${dst}`);
