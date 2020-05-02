const puppeteer = require('puppeteer')
const { execSync } = require('child_process');

async function printPDF() {

  const html = execSync("pandoc --standalone --mathjax --lua-filter /filters/graphviz.lua --lua-filter /filters/rfc8174.lua -H /styles/default-styles-header.html /data/example.md -o /data/out/example.html");
  console.log(html.toString());

  const docx = execSync("pandoc --standalone --mathjax --lua-filter /filters/graphviz.lua --lua-filter /filters/rfc8174.lua -H /styles/default-styles-header.html /data/example.md -o /data/out/example.docx");
  console.log(docx.toString());

  // Note fix for restricted shm space by default in docker, see 
  // https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--disable-dev-shm-usage']
    });

  // See https://github.com/puppeteer/puppeteer/blob/v3.0.1/docs/api.md#pagepdfoptions for description of options
  // TODO get papersize from front matter? Would then change to override styles, allowing PDF and Docx to have the same page size if pandoc uses front matter for docx?
  const page = await browser.newPage();
  await page.goto('file:///data/out/example.html', {waitUntil: 'networkidle2'});
  await page.pdf({
    path: '/data/out/example.pdf', 
    format: 'A4', 
    preferCSSPageSize: true,
    margin: {
      top: "1.5cm", left: "1.5cm", right: "1.5cm", bottom: "1.5cm"
    }
  });
  await browser.close();
}

printPDF();