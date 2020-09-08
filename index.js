const XLSX = require('xlsx'); //Lector de excel
const path = require('path');
const scrapper = require('./images_scrapper'); //Scrapper de imagenes de google
const schemas = require('./schemas')


//Variables de entorno
require('dotenv').config();

// Setup de la API de Woocommerce
const WooCommerceRestApi = require('@woocommerce/woocommerce-rest-api').default;

const WooCommerce = new WooCommerceRestApi({
  url: process.env.URL, // Your store URL
  consumerKey: process.env.CONSUMERKEY, // Your consumer key
  consumerSecret: process.env.CONSUMERSECRET, // Your consumer secret
  version: 'wc/v3', // WooCommerce WP REST API version
  queryStringAuth: true, //Server SSL config
});

//Lee el archivo .xlsx
const workbook = XLSX.readFile(
  path.join(__dirname, 'inputs', 'articulos.xls'),
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

//Esquema para exportar a Woocommerce
const products = workbookJSON.map(schemas.tiendecita)

//Agregando un produto
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

//Agregando todos los productos
const addProducts = products => {
  products.reduce(
    (promise, product, index) =>
      promise.then(_ => addProduct(product, index)),
    Promise.resolve()
  )
  scrapper.deleteProductImageAll();
}

//Ejemplo de un solo producto
addProduct(products[558], 558);

//Ejemplo de todos los productos
// addProducts(products);