const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/invoice", async (req, res) => {
    let browser;

    try {
        const url = req.query.url;

        browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage"
            ]
        });

        const page = await browser.newPage();

        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 60000
        });

        await page.waitForTimeout(5000);

        const data = await page.evaluate(() => {
            return {
                text: document.body.innerText
            };
        });

        await browser.close();

        res.json(data);

    } catch (e) {
        if (browser) await browser.close();
        res.json({ error: e.toString() });
    }
});

app.listen(10000, () => {
    console.log("Server running");
});