const puppeteer = require('puppeteer')
 
async function printPDF() {

  // Note fix for restricted shm space by default in docker, see 
  // https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--disable-dev-shm-usage']
    });

  // TODO use generated html file as input
  // TODO more formatting, e.g. margins?  
  // TODO use options from https://github.com/puppeteer/puppeteer/blob/v3.0.1/docs/api.md#pagepdfoptions
  // TODO get papersize from front matter
  const page = await browser.newPage();
  await page.goto('https://example.com', {waitUntil: 'networkidle2'});
  await page.pdf({path: 'out.pdf', format: 'A4'});
  await browser.close();
}

printPDF();