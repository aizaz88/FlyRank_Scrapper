const fs = require("fs");
const path = require("path");

function writeReport(stats, startTime) {
  const report = {
    started_at: new Date(startTime).toISOString(),
    duration_ms: Date.now() - startTime,
    pages_fetched: stats.pagesFetched,
    cache_hits: stats.cacheHits,
    valid_records: stats.validRecords,
    invalid_records: stats.invalidRecords,
    failed_pages: stats.failedPages.length,
    failed_page_details: stats.failedPages,
  };

  const outDir = path.join(__dirname, "..", "output");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "run-report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log("Run report:", report);
}

module.exports = { writeReport };
