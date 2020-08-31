const XLSX = require('xlsx');
const path = require('path');

var workbook = XLSX.readFile(path.join(__dirname, 'inputs', 'articulos.xlsx'));
