const fs = require("fs");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "..", "cache");
const USER_AGENT =
  "FlyRankInternshipA9/1.0 (+https://github.com/aizaz88/FlyRank_Scrapper)";
const TIMEOUT_MS = 8000;
const DELAY_MS = 500;

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

function cacheFileFor(url) {
  const safe = url.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9]/g, "_");
  return path.join(CACHE_DIR, `${safe}.html`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function politeFetch(url, stats) {
  const cacheFile = cacheFileFor(url);

  if (fs.existsSync(cacheFile)) {
    const html = fs.readFileSync(cacheFile, "utf-8");
    console.log(`CACHE HIT ${url} (${html.length} bytes)`);
    stats.cacheHits++;
    return { html, status: 200, fromCache: true };
  }

  let attempt = 0;
  while (attempt < 2) {
    attempt++;
    try {
      await sleep(DELAY_MS);
      const res = await fetchWithTimeout(url);

      if (res.status === 200) {
        const html = await res.text();
        fs.writeFileSync(cacheFile, html, "utf-8");
        console.log(`FETCH ${url} -> 200 (${html.length} bytes)`);
        stats.pagesFetched++;
        return { html, status: 200, fromCache: false };
      }

      if (res.status >= 500 && attempt < 2) {
        console.log(`FETCH ${url} -> ${res.status}, retrying once`);
        await sleep(1000);
        continue;
      }

      console.log(`FETCH ${url} -> ${res.status} (not retried)`);
      stats.failedPages.push({ url, reason: `status ${res.status}` });
      return { html: null, status: res.status, fromCache: false };
    } catch (err) {
      if (attempt < 2) {
        console.log(`FETCH ${url} -> error (${err.message}), retrying once`);
        await sleep(1000);
        continue;
      }
      console.log(`FETCH ${url} -> failed (${err.message})`);
      stats.failedPages.push({ url, reason: err.message });
      return { html: null, status: 0, fromCache: false };
    }
  }
}

module.exports = { politeFetch, USER_AGENT };
