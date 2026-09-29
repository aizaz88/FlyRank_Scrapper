function normalize(raw) {
  const priceMatch = raw.price_text ? raw.price_text.match(/[\d.]+/) : null;
  const price_gbp = priceMatch ? parseFloat(priceMatch[0]) : null;

  const ratingWords = { One: 1, Two: 2, Three: 3, Four: 4, Five: 5 };
  const rating = raw.rating_text
    ? (ratingWords[raw.rating_text] ?? null)
    : null;

  return {
    title: raw.title,
    product_url: raw.product_url,
    price_gbp,
    price_text: raw.price_text,
    availability_text: raw.availability_text,
    rating,
    rating_text: raw.rating_text,
    description: raw.description,
    source_page: raw.source_page,
    fetched_at: raw.fetched_at,
  };
}

module.exports = { normalize };
