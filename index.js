const XLSX = require('xlsx'); //Lector de excel
const path = require('path');
const scrapper = require('./images_scrapper'); //Scrapper de imagenes de google
const schemas = require('./schemas');
const categoriesSchema = require('./categories');


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

const workbookCategories = XLSX.readFile(
  path.join(__dirname, 'inputs', 'categorias.xls'),
);

const workbookToJSON = workbook => {
  const firstSheet = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheet];

  return (sheetJSON = XLSX.utils.sheet_to_json(worksheet, {
    raw: true,
    defval: null,
  }));
};

const productsJSON = workbookToJSON(workbook);
const categoriesJSON = workbookToJSON(workbookCategories);

//Esquema para exportar a Woocommerce
const products = productsJSON.map(schemas.tiendecita)
const categories = categoriesJSON.map(categoriesSchema.tiendecita)

//Agregando un produto
const addProduct = async (product, fileName) => {
  await scrapper.getProductImg(product.name, fileName);
  await WooCommerce.post('products', product)
    .then(data => console.log(response.data))
    .catch(error => console.log(error.response.data));
  return console.log('finish ', product.name)
};

//Agregando todos los productos
const addProducts = async products => {
  for (let i = 0; i < products.length; i++) {
    await addProduct(products[i], i)
  }
  return scrapper.deleteProductImageAll();
}

const addCategory = async (category, fileName) => {
  await scrapper.getProductImg(category.name, `c${fileName}`)
  await WooCommerce.post('products/categories', category)
    .then(data => console.log(response.data))
    .catch(error => console.log(error.response.data));

  return console.log('finish ', category.name)
}

const addCategories = async categories => {
  for (let i = 0; i < categories.length; i++) {
    await addCategory(categories[i], i);
  }

  return scrapper.deleteProductImageAll();
}

//Ejemplo de un solo producto
// addProduct(products[558], 558);

//Ejemplo de todos los productos
// addProducts(products);

// addCategory(categories[0], 0)

addCategories(categories);