**Novel Scrapper** is a library that allows you to easily extract the content of novels from Webnovel or FanMTL websites and save it as a `.txt` file. This can be especially useful for readers who want to download chapters from their favorite online novels for offline reading or archiving.

## Installation
To get started, you can easily install the library via npm:

**WARNING: the Link provided must always be to chapter 1 of the novel you want, not the book.**

```
npm install novel_scrapper
```

```
// For Fanmtl
let { novelScrapper } = require('novel_scrapper');

// Define the link to the novel you want to scrape
const link = "www.example";

// Optional: Specify a path to save the .txt file
const savePath = "path/optional";

// Start scraping
novelScrapper("fanmtl", link, savePath);
```


```
// For Webnovel
let { novelScrapper } = require('novel_scrapper');

// Define the link to the novel you want to scrape
const link = "www.example";

// Optional: Specify a path to save the .txt file
const savePath = "path/optional";

// Start scraping
novelScrapper("webnovel", link, savePath);
```
