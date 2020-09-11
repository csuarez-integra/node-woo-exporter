const puppeteer = require('puppeteer'); //Herramienta para hacer Scrapping
const fs = require('fs');
const path = require('path');

//Variables de entorno
require('dotenv').config();

//sftp connect
let Client = require('ssh2-sftp-client');
let sftp = new Client();

const getProductImg = async (query, imageName) => {
  try {
    const imgDir = path.join(__dirname, 'images');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const defaultImg = 'https://latiendecitadelparque.es/wp-content/uploads/2020/09/36-2.jpg'
    await page.setDefaultNavigationTimeout(0);
    await page.goto(
      `https://www.google.com/search?q=${query}&hl=en&sxsrf=ALeKk02bVoXgYpZoi0ufsHCm1g-7WFcBww:1599386737122&source=lnms&tbm=isch&sa=X&ved=2ahUKEwjX_Mvyo9TrAhXjA2MBHZCaC54Q_AUoAXoECBwQAw&biw=1536&bih=722`,
      { waitUntil: 'domcontentloaded' });

    const img = await page.evaluate(() => {
      if (document.querySelector('.rg_i'))
        return document.querySelector('.rg_i').src;
    });

    var source = await page.goto(img ? img : defaultImg);

    //Conexion con el servidor
    await sftp.connect({
      host: process.env.SFTPHOST,
      port: process.env.SFTPPORT,
      username: process.env.SFTPUSER,
      password: process.env.SFTPPASSWORD
    }).then(async () => {
      const path = `/clickandbuilds/${process.env.SFTPPATH}/wp-content/uploads/productos`;
      const file = `./images/${imageName.toString()}.png`

      //Crea la carpeta y la imagen en local
      fs.mkdirSync(imgDir, { recursive: true });
      fs.writeFileSync(file, await source.buffer(), err => {
        if (err) return console.log(err);
      });

      //Envía la imagen al servidor
      if (await !sftp.exists(path)) await sftp.mkdir(path);
      await sftp.put(file, `${path}/${imageName.toString()}.png`);

      //Elimina la imagen de la carpeta local
      fs.unlinkSync(file, err => {
        if (err) throw err;
      });

      //Retorna solo para registro
      return file;
    }).then((data) => {
      console.log(data);
    }).catch((err) => {
      console.log(err, 'catch error');
    });

    sftp.end();

    await browser.close();

    console.log('finished');
  } catch (error) {
    console.log(error);
    return
  }
};

const deleteProductImageAll = async () => {

  //Conexion con el servidor
  await sftp.connect({
    host: process.env.SFTPHOST,
    port: process.env.SFTPPORT,
    username: process.env.SFTPUSER,
    password: process.env.SFTPPASSWORD
  }).then(async () => {
    const path = `/clickandbuilds/${process.env.SFTPPATH}/wp-content/uploads/productos`;

    //Elimina el directorio entero con sus archivos
    return sftp.rmdir(path, true);
  }).then((data) => {
    console.log(data);
  }).catch((err) => {
    console.log(err, 'catch error');
  });

  sftp.end();
}

module.exports.getProductImg = getProductImg;
module.exports.deleteProductImageAll = deleteProductImageAll;
