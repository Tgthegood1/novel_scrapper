**Novel Scrapper** is a simple and powerful library that allows you to easily extract the content of novels from Webnovel or FanMTL websites and save it as a `.txt` file. This can be especially useful for readers who want to download chapters from their favorite online novels for offline reading or archiving.

## Installation
To get started, you can easily install the library via npm:

```
npm install novel_scrapper
```

```
// For Fanmtl
let { novelScrapper } = require('./src/novelScrapper.js');

// Define the link to the novel you want to scrape
const link = "www.example";

// Optional: Specify a path to save the .txt file
const savePath = "path/optional";
```


```
// For Webnovel
let { novelScrapper } = require('./src/novelScrapper.js');

// Define the link to the novel you want to scrape
const link = "www.example";

// Optional: Specify a path to save the .txt file
const savePath = "path/optional";

// Start scraping
novelScrapper("webnovel", link, savePath);
```
