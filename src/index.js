const { discoverBookUrls } = require("./catalogue");

async function main() {
  const stats = { pagesFetched: 0, cacheHits: 0, failedPages: [] };
  const bookUrls = await discoverBookUrls(stats);
  console.log(bookUrls.slice(0, 3)); // sanity peek
}

main();
