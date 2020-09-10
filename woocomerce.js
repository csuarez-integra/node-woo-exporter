const scrapper = require('./images_scrapper'); //Scrapper de imagenes de google
const fs = require('fs');
const path = require('path')

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

//Agregando un produto
const addProduct = async (product, fileName) => {
    await scrapper.getProductImg(product.name, fileName);
    await WooCommerce.post('products', product)
        .then(response => console.log(response.data))
        .catch(error => console.log(error.response.data));
    return console.log('finish ', product.name)
};

//Agregando todos los productos
const addProducts = async products => {
    let log, i
    const path = './log.json'
    if (fs.existsSync(path)) log = require(path);
    if (log && log.product) {
        i = Number(log.product);
        fs.unlinkSync(path)
    } else {
        i = 0;
    }

    process.on("SIGINT", function () {
        fs.writeFileSync(path, JSON.stringify({ ...log, product: i }))
        process.exit(0);
    });
    process.on("exit", function () {
        fs.writeFileSync(path, JSON.stringify({ ...log, product: i }))
    });
    while (i < products.length) {
        sleep(6)
        await addProduct(products[i], i)
        i++
    }

    fs.unlinkSync(path)
    return scrapper.deleteProductImageAll();
}

//Agregando una categoría
const addCategory = async (category, fileName) => {
    await scrapper.getProductImg(category.name, `c${fileName}`)
    await WooCommerce.post('products/categories', category)
        .then(response => console.log(response.data))
        .catch(error => console.log(error.response.data));

    return console.log('finish ', category.name)
}

//Agregando todas las categorias
const addCategories = async categories => {
    let log, i
    const path = './log.json'
    if (fs.existsSync(path)) log = require(path);

    if (log && log.finCat) return

    if (log) {
        i = Number(log.category);
        fs.unlinkSync(path)
    } else {
        i = 0;
    }

    process.on("SIGINT", function () {
        fs.writeFileSync(path, JSON.stringify({ category: i }))
        process.exit(0);
    });

    while (i < categories.length) {
        sleep(6)
        await addCategory(categories[i], i);
        i++;
    }
    fs.writeFileSync(path, JSON.stringify({ ...log, finCat: true }))
    await listCategories();
    return scrapper.deleteProductImageAll();
}

const listCategories = async () => {
    if (fs.existsSync('./categories.json')) fs.unlinkSync('./categories.json');

    let isThereAreNextPage = true;
    let page = 1;
    let categories = []

    while (isThereAreNextPage) {
        await WooCommerce.get('products/categories', { page: page })
            .then(response => {
                const newCategories = response.data;
                console.log(response.data)
                if (newCategories.length <= 0) {
                    return isThereAreNextPage = false;
                }
                page++
                return categories = [...categories, ...newCategories];
            })
            .catch(error => console.log(error.response.data))
    }

    fs.writeFileSync('categories.json', JSON.stringify(categories))

}

const findCategoryID = (categoryID, categoriesList) => {
    if (!categoriesList) return
    const categories = categoriesList;
    const data = categories.filter((category => {
        return category.menu_order == categoryID
    }))

    if (data[0] != null) return data[0].id;

    return undefined;
}

function msleep(n) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
function sleep(n) {
    msleep(n * 1000);
}

module.exports.addProduct = addProduct;
module.exports.addProducts = addProducts;
module.exports.addCategory = addCategory;
module.exports.addCategories = addCategories;
module.exports.listCategories = listCategories;
module.exports.findCategoryID = findCategoryID;