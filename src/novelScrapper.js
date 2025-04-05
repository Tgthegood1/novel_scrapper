const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require('path');

function webnovelScrapper(link, novelPath){
    if (!link.startsWith("https://www.webnovel")) {
        console.log("Please use a Webnovel link");
        return;
    } 

    //is basically a promise to wait a while, it can be considered an alternative to “Wait”.
    function timeDead(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    //this is the scroll of the page, it stops automatically after reaching the end of the page
    async function scroll(page, content) {
        let count = 0;
        let frag = true;
        let timeSaved = Date.now();
    
        while (frag) {
            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight);
            });
    
            await timeDead(200);
    
            if ((Date.now() - timeSaved) >= 50000) {
                let paragraphs = await page.evaluate((content) => {
                    return document.querySelectorAll(content).length;
                }, content);
    
                if (paragraphs == count) {
                    frag = false;
                } else {
                    count = paragraphs;
                }
    
                timeSaved = Date.now();
            }
        }
        return false;
    }
    
    //Starts the main function
    try {
        async function main() {
            console.log("Starting the process...")
            console.log("Attempting to obtain the book's content...")
    
            let browser = await puppeteer.launch({ headless: true });
            let newPage = await browser.newPage();
        
            await newPage.goto(link, { waitUntil: 'domcontentloaded' });
        
            let selector = '.cha-page-in p:not(.creators-thought)';
        
            await scroll(newPage, selector);
        
            let [ bookContent, title ] = await newPage.evaluate(() => {
                let nameTitle = document.querySelector(".cha-page-in h2")?.textContent || "Title was not Found";
                nameTitle = nameTitle.replace(/[^a-zA-Z\s]/g, '');
        
                let content = "";
                let textSelector = document.querySelector('.cha-page-in');
        
                if (textSelector) {
                    textSelector.querySelectorAll('h1, p:not(.creators-thought)').forEach(element => {
                        let contentText = element.textContent.trim();
                        content += contentText + "\n";
                    });
                }
        
                return [ content, nameTitle ];
            });
    
            let filePath;
            if (novelPath){
                filePath = path.join(novelPath, `${title}.txt`)
            } else{
                filePath = path.join(__dirname, `${title}.txt`);
            }

    
            fs.writeFile(filePath, bookContent, { encoding: 'utf8' }, (err) => {
                if (err) {
                    throw new Error("Error writing the file. Please check the link. Links must be for chapter 1, not the book.");
                } else {
                    console.log("File was written to: ", filePath);
                }
            });
    
            await browser.close();
    
            console.log("Reminder, if you have not obtained the content of the book, try copying the link to Chapter 1 of the book, not the link to the book.")
        }
        main();
    } catch (error) {
        console.log(error.message)
    }   
}

function fanMtlScrapper(link, novelPath){
    if (!link.startsWith("https://www.fanmtl")) {
        console.log("Please use a fanmtl link");
        return;
    }

    (async () => {
        let browser = await puppeteer.launch({ headless : true });
        let page = await browser.newPage();
        let novelName = "Title was not found"

        try {
            await page.goto(link, { waitUntil: 'networkidle2', timeout: 600000});
            let bookContent = '';

            console.log("Starting the process...")
            console.log("Attempting to obtain the book's content...")

            let title = await page.$(".titles h1 a[title]")
            if(title){
                novelName = await page.evaluate(el => el.getAttribute('title'), title);
                novelName = novelName.replace(/[^a-zA-Z0-9 ]/g, '');
                console.log("Loading the Book: " + novelName)
            }

            while (true) {
                let contenido = await page.$(".chapter-content");
            
                if (!contenido) break;
            
                const texto = await page.evaluate(contenido => {
                    let elementosAEliminar = contenido.querySelectorAll("script, div, iframe, .ob-smartfeed-wrapper");
                    elementosAEliminar.forEach(el => el.remove());
            
                    let elementos = Array.from(contenido.querySelectorAll("p"));
                    let elementosConTexto = elementos.filter(el => el.textContent.trim().length > 0);
            
                    if (elementosConTexto.length > 0) {
                        let textoSet = new Set(elementosConTexto.map(el => el.textContent.trim()));
                        return Array.from(textoSet).join("\n");
                    } else {
                        return contenido.innerHTML.replace(/<br\s*\/?>/gi, '\n').trim();
                    }
                }, contenido);
            
                let jsTitle = await page.$(".titles h2");
                let title = await page.evaluate(el => el.textContent, jsTitle);
                bookContent += (title + '\n' + texto + '\n');
            
                let button = await page.$(".nextchap");
            
                if (!button) break;
            
                // Este bloque debe reiniciarse en cada vuelta
                let navigationSuccess = false;
            
                let isButtonDisabled = await page.$eval(".nextchap", buttonEl => {
                    return buttonEl.classList.contains("isDisabled");
                }).catch(() => false);
            
                if (isButtonDisabled) {
                    break;
                }
            
                for (let i = 0; i < 3; i++) {
                    try {
                        await Promise.all([
                            button.click(),
                            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 })
                        ]);
                        navigationSuccess = true;
                        break;
                    } catch (err) {
                        console.warn(`Try ${i + 1}`);
                    }
                }
            
                if (!navigationSuccess) {
                    console.log("Fail with the Navigation");
                    break;
                }
            }            

            let filePath;
            if (bookContent.trim().length > 0) {
                if (novelPath){
                    filePath = path.join(novelPath, `${novelName}.txt`)
                } else{
                    filePath = path.join(__dirname, `${novelName}.txt`);
                }

                fs.writeFile(filePath, bookContent, { encoding: 'utf8' }, (err) => {
                    if (err) {
                        throw new Error("Error writing the file. Please check the link. Links must be for chapter 1, not the book.");
                    } else {
                        console.log("File was written to: ", filePath);
                    }
                });
            }            

        } catch (error) {
            console.error("Fail to load the Scrapping:", error);
        } finally {
            await browser.close();
        }
    })();
}

function validateAndNormalizePath(inputPath) {
    if (!path.isAbsolute(inputPath)) {
        console.log('The path will not work, only paths with the format of “/” are supported, the file will be written to the base path');
        return false;
    }

    if (!fs.existsSync(inputPath)) {
        console.log("The path does not exist, the file will be written to the base path");
        return false;
    }

    return inputPath;
}

async function novelScrapper(call, link, pathNovel = null) {
    if (typeof call !== "string") {
        console.log("The first argument must be a string");
        return;
    }
    let pathNovelResolve = validateAndNormalizePath(pathNovel);

    let callLower = call.toLowerCase().trim();
    if (callLower == "webnovel") {
        webnovelScrapper(link, pathNovelResolve);
    } else if (callLower == "fanmtl") {
        fanMtlScrapper(link, pathNovelResolve);
    } else {
        console.error("Function not recognized:", call);
    }
}

module.exports = { novelScrapper };