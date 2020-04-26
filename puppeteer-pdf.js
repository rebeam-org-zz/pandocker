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
  const page = await browser.newPage();
  await page.goto('https://example.com', {waitUntil: 'networkidle0'});
  await page.pdf({path: 'out.pdf', format: 'A4'});
  await browser.close();
}

printPDF();