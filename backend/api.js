const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const router = express.Router();

router.get('/preview', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Missing url parameter' });

    if(url.match('x.com') || url.match('twitter.com')) {
        return res.status(400).json({ error: 'Twitter unable to parse' });
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
        console.error(`Error scraping URL: (${url})`, err.message);
        const errStatus = err.message.match(/status code (\d{3})/);
        const errCode = errStatus ? parseInt(errStatus[1], 10) : 500;
        res.status(errCode).json({ error: 'Failed to fetch link preview', status: errCode });
    }
})

module.exports = router;