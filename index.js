const XLSX = require('xlsx');
const path = require('path');
const scrapper = require('./images_scrapper');

//Env vars
require('dotenv').config();

//sftp connect
let Client = require('ssh2-sftp-client');
let sftp = new Client();
sftp.connect({
  host: process.env.SFTPHOST,
  port: process.env.SFTPPORT,
  username: process.env.SFTPUSER,
  password: process.env.SFTPPASSWORD
}).then(() => {
  return sftp.list('/clickandbuilds/');
}).then((data) => {
  console.log(data, 'the data info');
}).catch((err) => {
  console.log(err, 'catch error');
});

// Setup:
const WooCommerceRestApi = require('@woocommerce/woocommerce-rest-api').default;

const WooCommerce = new WooCommerceRestApi({
  url: process.env.URL, // Your store URL
  consumerKey: process.env.CONSUMERKEY, // Your consumer key
  consumerSecret: process.env.CONSUMERSECRET, // Your consumer secret
  version: 'wc/v3', // WooCommerce WP REST API version
  queryStringAuth: true, //Server SSL config
});

const workbook = XLSX.readFile(
  path.join(__dirname, 'inputs', 'articulos.xlsx'),
);

const workbookToJSON = workbook => {
  const firstSheet = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheet];

  return (sheetJSON = XLSX.utils.sheet_to_json(worksheet, {
    raw: true,
    defval: null,
  }));
};

const workbookJSON = workbookToJSON(workbook);

const products = workbookJSON.map((item, index) => {
  const data = {
    name: item.Descripcion,
    type: 'simple',
    regular_price: item['PVP 1'].toString(),
    categories: [
      {
        id: 1,
      },
    ],
    images: [
      {
        src: `${process.env.URL}/wp-content/uploads/productos/${index}.png`
      }
    ],
    manage_stock: true,
    stock_quantity: item['Stock'].toString(),
  };

  return data;
})

const addProduct = (product, fileName) => {
  return new Promise(async (resolve, reject) => {
    await scrapper.getProductImg(product.name, fileName);
    resolve(
      WooCommerce.post('products', product)
        .then(response => {
          console.log(response.data);
        })
        .catch(error => {
          console.log(error.response.data);
        })
    )
  })

};

const addProducts = products => {
  products.reduce(
    (promise, product, index) =>
      promise.then(_ => addProduct(product, index)),
    Promise.resolve()
  )
}

const getProductImgAll = async products => {
  for (let i = 0; i < products.length; i++) {
    await scrapper.getProductImg(products[i].name, i)
  }
}
