const XLSX = require('xlsx'); //Lector de excel
const path = require('path');
const schemas = require('./schemas');
const categoriesSchema = require('./categories');
const wooClient = require('./woocomerce');


//Variables de entorno
require('dotenv').config();

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

//Esquema para exportar a Woocommerce
const products = workbookToJSON(workbook).map(schemas.tiendecita)
const categories = workbookToJSON(workbookCategories).map(categoriesSchema.tiendecita)

//Ejemplo de un solo producto
// addProduct(products[558], 558);

//Ejemplo de todos los productos
// addProducts(products);

//Ejemplo de una sola categoria

//Ejemplo de todas las categorias
// addCategories(categories)

const init = async () => {
  await wooClient.addCategories(categories)
  await wooClient.addProducts(products)
  return
}

init()

// wooClient.addProducts(products)

