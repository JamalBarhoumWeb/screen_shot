const puppeteer = require("puppeteer");

const downloadPdf = async (req, res) => {
  let { url } = req.query;

  if (!url) {
    return res.status(400).send("URL is required");
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `http://${url}`;
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log(`Navigating to URL: ${url}`);
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("Page navigation successful. Checking for content...");

    // طرق متعددة لانتظار العنصر
    try {
      // الطريقة الأولى: الانتظار باستخدام معرف العنصر
      await page.waitForSelector("#billRow", { timeout: 60000 });
    } catch (err) {
      console.warn("Selector #billRow not found. Trying other methods...");
      // الطريقة الثانية: انتظار النص أو العنصر
      await page.waitForFunction(() => {
        return document.body.innerText.includes("مدفوع");
      }, { timeout: 60000 });
    }

    console.log("Dynamic content loaded. Capturing final screenshot...");
    await page.screenshot({ path: "debug_final.png", fullPage: true });

    console.log("Creating PDF...");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        bottom: "10mm",
        left: "10mm",
        right: "10mm",
      },
    });

    console.log(`PDF generated successfully for URL: ${url}`);

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="invoice.pdf"'
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generating PDF:", err.message);

    if (err.message.includes("ERR_NAME_NOT_RESOLVED")) {
      res.status(400).send("Invalid URL or cannot resolve the domain.");
    } else if (err.message.includes("Timeout")) {
      res.status(408).send("Request timed out. Please try again later.");
    } else {
      res.status(500).send("Error generating the PDF file");
    }
  }
};

module.exports = {
  downloadPdf,
};
