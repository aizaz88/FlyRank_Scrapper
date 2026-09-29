const { discoverBookUrls } = require("./catalogue");
const { fetchAndExtract } = require("./extractor");

async function main() {
  const stats = { pagesFetched: 0, cacheHits: 0, failedPages: [] };
  const bookUrls = await discoverBookUrls(stats);

  const rawRecords = [];
  for (const url of bookUrls) {
    const record = await fetchAndExtract(
      url,
      "https://books.toscrape.com/catalogue/page-1.html",
      stats,
    );
    rawRecords.push(record);
  }

  console.log(`detail_pages=${rawRecords.length}`);
  console.log(rawRecords[0]); // one complete raw record
}

main();
