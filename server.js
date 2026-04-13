const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/invoice", async (req, res) => {
    try {
        const url = req.query.url;

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2" });

        await page.waitForSelector("table");

        const data = await page.evaluate(() => {
            let items = [];

            document.querySelectorAll("table tbody tr").forEach(row => {
                let cols = row.querySelectorAll("td");

                if (cols.length >= 4) {
                    items.push({
                        name: cols[0].innerText,
                        qty: cols[1].innerText,
                        price: cols[2].innerText,
                        total: cols[3].innerText
                    });
                }
            });

            return items;
        });

        await browser.close();
        res.json(data);

    } catch (e) {
        res.json({ error: e.toString() });
    }
});

app.listen(10000, () => console.log("Server running"));