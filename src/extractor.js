const cheerio = require("cheerio");
const { politeFetch } = require("./fetcher");

function extractRawRecord(html, url, sourcePage) {
  const $ = cheerio.load(html);
  const main = $(".product_main");

  const title = main.find("h1").text().trim();
  const price_text = main.find("p.price_color").first().text().trim();
  const availability_text = main
    .find("p.availability")
    .text()
    .replace(/\s+/g, " ")
    .trim();

  const ratingClass = main.find("p.star-rating").attr("class") || "";
  const rating_text = ratingClass.replace("star-rating", "").trim() || null;

  const descEl = $("#product_description").next("p");
  const description = descEl.length ? descEl.text().trim() : null;

  return {
    title,
    product_url: url,
    price_text,
    availability_text,
    rating_text,
    description,
    source_page: sourcePage,
    fetched_at: new Date().toISOString(),
  };
}

async function fetchAndExtract(url, sourcePage, stats) {
  const { html, status } = await politeFetch(url, stats);
  if (status !== 200 || !html) {
    return { error: `detail page status ${status}`, url };
  }
  return extractRawRecord(html, url, sourcePage);
}

module.exports = { fetchAndExtract };
