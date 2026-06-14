import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "out");
const SOURCE_PATH = path.join(OUT_DIR, "sitemap.xml");
const TARGET_PATH = path.join(OUT_DIR, "sitempa-new.xml");

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await copyFile(SOURCE_PATH, TARGET_PATH);

  console.log(`[sitemap] Generated ${TARGET_PATH} from ${SOURCE_PATH}`);
}

main().catch((error) => {
  console.error(`[sitemap] Failed to generate sitempa-new.xml: ${error.message}`);
  process.exit(1);
});
