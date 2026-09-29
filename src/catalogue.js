const cheerio = require("cheerio");
const { politeFetch } = require("./fetcher");

const START_URL = "https://books.toscrape.com/catalogue/page-1.html";
const MAX_PAGES = 3;

async function discoverBookUrls(stats) {
  const bookUrls = new Set();
  let pageUrl = START_URL;
  let pageCount = 0;

  while (pageUrl && pageCount < MAX_PAGES) {
    const { html, status } = await politeFetch(pageUrl, stats);
    pageCount++;

    if (status !== 200 || !html) {
      stats.failedPages.push({
        url: pageUrl,
        reason: `catalogue page status ${status}`,
      });
      break;
    }

    const $ = cheerio.load(html);
    $("h3 a").each((_, el) => {
      const href = $(el).attr("href");
      if (href) bookUrls.add(new URL(href, pageUrl).toString());
    });

    const nextHref = $("li.next a").attr("href");
    pageUrl = nextHref ? new URL(nextHref, pageUrl).toString() : null;
  }

  console.log(
    `catalogue_pages=${pageCount} discovered=${bookUrls.size} unique_urls=${bookUrls.size}`,
  );
  return Array.from(bookUrls);
}

module.exports = { discoverBookUrls };
