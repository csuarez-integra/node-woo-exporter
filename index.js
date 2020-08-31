const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const workbook = XLSX.readFile(path.join(__dirname, 'inputs', 'articulos.xlsx'));

const workbookJSON = workbook => {
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];

    return sheetJSON = XLSX.utils.sheet_to_json(worksheet, {raw: true, defval:null});
}



// Setup:
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const WooCommerce = new WooCommerceRestApi({
  url: 'https://supermercadovidemasca.es/', // Your store URL
  consumerKey: 'ck_1a1d7c1c59d04169468d2391fcbf7ca029b3af10', // Your consumer key
  consumerSecret: 'cs_68fa64c3e0cfff0b45f3947be6a90424d789f663', // Your consumer secret
  version: 'wc/v3', // WooCommerce WP REST API version
  queryStringAuth: true //Server SSL config
});


const addProduct = (workbook, index) => {
    const data = {
        name: workbook[index].Descripcion,
        type: "simple",
        regular_price: workbook[index]['PVP 1'].toString(),
        categories: [
            {
              id: 1
            },
        ],
    }

    WooCommerce.post("products", data)
    .then((response) => {
        console.log(response.data);
    })
    .catch((error) => {
        console.log(error.response.data);
    });
}

const addProducts = async (workbook) => {

    const send = await Promise.all(
        workbook.map(element => {
            const data = {
                name: element.Descripcion,
                type: "simple",
                regular_price: element['PVP 1'].toString(),
                categories: [
                    {
                      id: 1
                    },
                ],
            }

            console.log(data)

            // WooCommerce.post("products", data)
            // .then((response) => {
            //     console.log(response.data);
            // })
            // .catch((error) => {
            //     console.log(error.response.data);
            // });
        })
    )

}

// addProduct(workbookJSON(workbook), 5);
await addProducts(workbookJSON(workbook))