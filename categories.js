require('dotenv').config();

const tiendecita = (item, index) => {
    const data = {
        name: item['NOMFAM,C,25'],
        image: {
            src: `${process.env.URL}/wp-content/uploads/productos/c${index}.png`
        },
    };

    return data;
}

module.exports.tiendecita = tiendecita;