A set of functions which are called in the following way


let { novelScrapper } = require('./src/novelScrapper.js');
const link = "www.example";
novelScrapper("fanmtl", link, "path\optional");

or

let { novelScrapper } = require('./src/novelScrapper.js');
const link = "www.example";
novelScrapper("webnovel", link, "path\optional");
