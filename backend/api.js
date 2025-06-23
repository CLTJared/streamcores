const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const router = express.Router();

const failedURLCache = new Map();
const badgeImageCache = new Map();

const CACHE_TTL = 1000 * 60 * 30; 
// 30 minute cache time for any URL that failed
// This is so we do not re-try to get a preview again took soon

const isURLCachedAsFailed = (url) => {
  const timestamp = failedURLCache.get(url);
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_TTL;
}

const cacheFailedURL = (url) => {
  failedURLCache.set(url, Date.now());
}

const setBadgeCache = (key, data) => {
    console.log('[Set Cache Key]', key);
    badgeImageCache.set(key, { data, expiry: Date.now() + CACHE_TTL, });
}

const getBadgeCache = (key) => {
    const cached = badgeImageCache.get(key);
    console.log("[Get Cache Key]:", key)

    if (!cached) return null;

    if (Date.now() > cached.expiry) {
        badgeImageCache.delete(key);
        return null;
    }

    return cached.data;
}

router.get('/img-proxy', async (req, res) => {
    const imageUrl = req.query.url;
    const normalizedUrl = imageUrl.replace(/([^:]\/)\/+/g, '$1');

  if (!imageUrl) {
    return res.status(400).send("Missing image URL");
  }

  const cached = getBadgeCache(normalizedUrl)

  if(cached) {
    res.setHeader("Content-Type", cached.contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(cached.buffer);
  }

  try {
    const response = await fetch(imageUrl);
    const contentType = response.headers.get("content-type");

    if (!response.ok || (!contentType?.startsWith("image/") && contentType !== "binary/octet-stream")) {
        console.log('[FETCH INVALID]', normalizedUrl, response.status, contentType);
        return res.status(400).send("Invalid image");
    }

    console.log('[FETCH OK]', response.status, contentType);

    const buffer = Buffer.from(await response.arrayBuffer());
    // Cache
    setBadgeCache(normalizedUrl, { buffer, contentType });

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(buffer);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Image fetch failed");
  }
})

router.get('/preview', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Missing url parameter' });

    if(url.match('x.com') || url.match('twitter.com')) {
        return res.status(400).json({ error: 'Twitter unable to parse' });
    }

    if (isURLCachedAsFailed(url)) {
        return res.status(410).json({ error: "URL preview previously failed" });
    }

    try {
        const response = await axios.get(url, { timeout: 10000 });
        const html = response.data;
        const $ = cheerio.load(html);

        const getMetaTag = (name) =>
        $(`meta[property='${name}']`).attr('content') ||
        $(`meta[name='${name}']`).attr('content');

        const previewData = {
        title: getMetaTag('og:title') || $('title').text(),
        description: getMetaTag('og:description') || $('meta[name="description"]').attr('content'),
        image: getMetaTag('og:image'),
        url: getMetaTag('og:url') || url
        };

        res.json(previewData);
    } catch (err) {
        cacheFailedURL(url);
        console.error(`Error scraping URL: (${url})`, err.message);
        const errStatus = err.message.match(/status code (\d{3})/);
        const errCode = errStatus ? parseInt(errStatus[1], 10) : 500;
        res.status(errCode).json({ error: 'Failed to fetch link preview', status: errCode });
    }
})

module.exports = router;