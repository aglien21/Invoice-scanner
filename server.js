const express = require("express");
const puppeteer = require("puppeteer-core");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/invoice", async (req, res) => {
    try {
        const url = req.query.url;

        const browser = await puppeteer.launch({
            headless: true,
            executablePath: process.env.CHROME_PATH,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox"
            ]
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

        await page.waitForSelector("body");

        await new Promise(r => setTimeout(r, 5000));

        const data = await page.evaluate(() => {
            let text = document.body.innerText;
            return { raw: text };
        });

        await browser.close();

        res.json(data);

    } catch (e) {
        res.json({ error: e.toString() });
    }
});

app.listen(10000);