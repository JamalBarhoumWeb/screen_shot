const puppeteer = require("puppeteer");
const fs = require("fs");

const downloadImage = async (req, res) => {
  let { url } = req.query;

  if (!url) {
    return res.status(400).send("URL is required");
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `http://${url}`;
  }

  try {
    // التحقق من وجود Chrome في المسار المحدد
    const chromePath = "/opt/render/.cache/puppeteer/chrome";
    if (!fs.existsSync(chromePath)) {
      console.error("Chrome not found at", chromePath);
      return res.status(500).send("Chrome not installed in the expected path.");
    }

    // إطلاق Puppeteer مع المسار الصحيح
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: chromePath,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log(`Navigating to URL: ${url}`);
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("Page navigation successful. Capturing screenshot...");

    // التقاط لقطة الشاشة كـ Buffer
    const screenshotBuffer = await page.screenshot({ fullPage: true });

    console.log("Screenshot captured successfully.");
    await browser.close();

    // إرسال الصورة كاستجابة
    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="invoice.png"'
    );
    res.send(screenshotBuffer);
  } catch (err) {
    console.error("Error generating image:", err.stack || err.message);

    if (err.message.includes("ERR_NAME_NOT_RESOLVED")) {
      res.status(400).send("Invalid URL or cannot resolve the domain.");
    } else if (err.message.includes("Timeout")) {
      res.status(408).send("Request timed out. Please try again later.");
    } else if (err.message.includes("executablePath")) {
      res.status(500).send("Browser was not found at the configured executablePath.");
    } else {
      res.status(500).send("Error generating the image file");
    }
  }
};

module.exports = {
  downloadImage,
};
