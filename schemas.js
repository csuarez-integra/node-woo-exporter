const wooClient = require('./woocomerce');
const fs = require('fs');
const path = require('path');
let categoriesList
if (fs.existsSync('./categories.json')) categoriesList = require('./categories.json')

require('dotenv').config();

const videma = (item, index) => {
    const data = {
        name: item.Descripcion,
        type: 'simple',
        regular_price: item['PVP 1'].toString(),
        categories: [
            {
                id: wooClient.findCategoryID(item['Familia'], categoriesList),
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
}

const tiendecita = (item, index) => {
    const data = {
        name: item['NOMBRE,C,40'],
        type: 'simple',
        regular_price: item['PVP1IVA'].toString(),
        categories: [
            {
                id: wooClient.findCategoryID(item['CLAFAM'], categoriesList),
            },
        ],
        images: [
            {
                src: `${process.env.URL}/wp-content/uploads/productos/${index}.png`
            }
        ],
        manage_stock: true,
        stock_quantity: item['EXMIN'].toString(),
    };

    return data;
}

module.exports.videma = videma;
module.exports.tiendecita = tiendecita;