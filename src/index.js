const fs = require("fs");
const path = require("path");
const { discoverBookUrls } = require("./catalogue");
const { fetchAndExtract } = require("./extractor");
const { normalize } = require("./normalize");
const { BookSchema } = require("./schema");
const { writeReport } = require("./report");
const DEBUG_BAD_URL = process.env.INJECT_FAKE_URL === "1";
const OUTPUT_DIR = path.join(__dirname, "..", "output");

async function main() {
  const stats = { pagesFetched: 0, cacheHits: 0, failedPages: [] };
  const bookUrls = await discoverBookUrls(stats);
  if (DEBUG_BAD_URL) {
    bookUrls.push(
      "https://books.toscrape.com/catalogue/this-book-does-not-exist_1/index.html",
    );
    console.log("Injected one fake URL to test failure handling");
  }
  const validRecords = [];
  const invalidRecords = [];
  const seenUrls = new Set();

  for (const url of bookUrls) {
    const raw = await fetchAndExtract(
      url,
      "https://books.toscrape.com/catalogue/page-1.html",
      stats,
    );

    if (raw.error) {
      invalidRecords.push({ url, reason: raw.error });
      continue;
    }

    const clean = normalize(raw);
    const result = BookSchema.safeParse(clean);

    if (!result.success) {
      invalidRecords.push({
        url,
        reason: result.error.issues.map((i) => i.message).join("; "),
      });
      continue;
    }

    if (seenUrls.has(clean.product_url)) continue; // idempotent
    seenUrls.add(clean.product_url);
    validRecords.push(result.data);
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "books.json"),
    JSON.stringify(validRecords, null, 2),
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "errors.json"),
    JSON.stringify(invalidRecords, null, 2),
  );

  console.log(
    `detail_pages=${bookUrls.length} valid=${validRecords.length} invalid=${invalidRecords.length}`,
  );
  stats.validRecords = validRecords.length;
  stats.invalidRecords = invalidRecords.length;
  writeReport(stats, startTime);
}

const startTime = Date.now();
main();
