const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

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

const products = workbookJSON.map(item => {
    const data = {
        name: item.Descripcion,
        type: 'simple',
        regular_price: item['PVP 1'].toString(),
        categories: [
          {
            id: 1,
          },
        ],
      };

    return data;
})

// Setup:
const WooCommerceRestApi = require('@woocommerce/woocommerce-rest-api').default;

const WooCommerce = new WooCommerceRestApi({
  url: 'https://supermercadovidemasca.es/', // Your store URL
  consumerKey: 'ck_1a1d7c1c59d04169468d2391fcbf7ca029b3af10', // Your consumer key
  consumerSecret: 'cs_68fa64c3e0cfff0b45f3947be6a90424d789f663', // Your consumer secret
  version: 'wc/v3', // WooCommerce WP REST API version
  queryStringAuth: true, //Server SSL config
});

const addProduct = (product) => {
    return new Promise((resolve, reject) => {
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

const returnData = workbook => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(workbook);
      console.log('Getting the data');
    }, 2000);
  });
};

products.reduce(
    (p, x) =>
        p.then(_ => addProduct(x)),
    Promise.resolve()
    )
