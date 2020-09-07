const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const getProductImg = async (query, imageName) => {
  try {
    const imgDir = path.join(__dirname, 'images');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(
      `https://www.google.com/search?q=${query}&hl=en&sxsrf=ALeKk02bVoXgYpZoi0ufsHCm1g-7WFcBww:1599386737122&source=lnms&tbm=isch&sa=X&ved=2ahUKEwjX_Mvyo9TrAhXjA2MBHZCaC54Q_AUoAXoECBwQAw&biw=1536&bih=722`,
    );
    await page.waitForSelector('.rg_i');

    const img = await page.evaluate(() => {
      return document.querySelector('.rg_i').src;
    });

    var source = await page.goto(img);

    fs.mkdirSync(imgDir, { recursive: true });

    fs.writeFile(`./images/${imageName.toString()}.png`, await source.buffer(), err => {
      if (err) return console.log(err);
    });

    await browser.close();

    console.log('finished');
  } catch (error) {
    console.log(error);
  }
};

module.exports.getProductImg = getProductImg;
