const { politeFetch } = require("./fetcher");

async function main() {
  const stats = { pagesFetched: 0, cacheHits: 0, failedPages: [] };
  const url = "https://books.toscrape.com/catalogue/page-1.html";
  await politeFetch(url, stats);
}

main();
