require('dotenv').config();

const videma = (item, index) => {
    const data = {
        name: item['NOMFAM,C,25'],
        image: {
            src: `${process.env.URL}/wp-content/uploads/productos/c${index}.png`
        },
        menu_order: item['CLAFAM'],
    };

    return data;
}

const tiendecita = (item, index) => {
    const data = {
        name: item['NOMFAM,C,25'],
        image: {
            src: `${process.env.URL}/wp-content/uploads/productos/c${index}.png`
        },
        menu_order: item['CLAFAM'],
    };

    return data;
}

module.exports.tiendecita = tiendecita;