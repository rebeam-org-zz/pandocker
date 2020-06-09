const puppeteer = require('puppeteer')
const { execSync } = require('child_process');
const util = require('util');
const yargs = require('yargs');

function parseArgv() {
  return yargs
  .command(
    '$0 <input>', 'Process an input file through Pandoc into various formats, with additional filters and optional PDF export via puppeteer. Note that this defaults to applying all features and producing all formats of output. If at least one flag marked \"Feature:\" is specified, only the specified features are applied. If at least one flag marked \"Format:\" is specified, only the specified formats are output.', 
    (yargs) => {
      yargs.positional(
        'input', 
        {
          description: 'The input filename, generally a Markdown file. Must be relative to the current directory.',
          type: 'string',
        }
      )
    }
  )
  .option('output', {
    alias: 'o',
    description: 'The output base filename. Must be relative to the current directory. For each output, will have a the extension added, e.g. .html, .pdf etc. If omitted, will be the input filename with extension removed.',
    type: 'string',
  })
  .option('graphviz', {
    alias: 'g',
    description: 'Feature: Process graphviz blocks to svg/png',
    type: 'boolean',
    default: false
  })
  .option('rfc8174', {
    alias: 'r',
    description: 'Feature: Process RFC8174 phrases to add styling/classes. Note that in HTML, default styles or specific CSS for relevant classes are needed to see any difference.',
    type: 'boolean',
    default: false
  })
  .option('mathjax', {
    alias: 'm',
    description: 'Feature: Process maths to mathjax format in HTML - see pandoc docs for the corresponding flat',
    type: 'boolean',
    default: false
  })
  .option('styles', {
    alias: 's',
    description: 'Feature: Add default styles inline to HTML',
    type: 'boolean',
    default: false
  })
  .option('html', {
    alias: 'w',
    description: 'Format: Output HTML file',
    type: 'boolean',
    default: false
  })
  .option('docx', {
    alias: 'd',
    description: 'Format: Output DOCX file',
    type: 'boolean',
    default: false
  })
  .option('pdf', {
    alias: 'p',
    description: 'Format: Output PDF file via puppeteer',
    type: 'boolean',
    default: false
  })
  .option('footerText', {
    description: 'Additional text to add to footer in PDF format',
    type: 'string',
    default: ""
  })
  .option('displayHeaderFooter', {
    description: 'Enable display of header and footer in PDF format',
    type: 'boolean',
    default: false
  })
  .option('pandoc', {
    description: 'Additional arguments for pandoc, will be passed to all conversion commands, for example --pandoc="--number-sections"',
    type: 'string'
  })
  .demandOption(['input'], 'Please provide an input filename')
  .help()
  .alias('help', 'h')
  .epilog('https://github.com/rebeam-org/pandocker')
  .argv;
}

function pandoc(input, outputBase, format, argv) {
  var p = "pandoc --standalone";
  
  const allFeatures = !(argv.mathjax || argv.graphviz || argv.rfc8174 || argv.styles);

  if (argv.mathjax    || allFeatures) p += " --mathjax";
  if (argv.graphviz   || allFeatures) p += " --lua-filter /filters/graphviz.lua";
  if (argv.rfc8174    || allFeatures) p += " --lua-filter /filters/rfc8174.lua";
  if (argv.styles     || allFeatures) p += " -H /styles/default-styles-header.html";
  if (argv.pandoc)                    p+= " " + argv.pandoc;

  return util.format("%s %s -o %s.%s", p, input, outputBase, format);
}

function withoutExtension(s) {
  return s.replace(/\.[^/.]+$/, "");
}

function styleHeader(s) {
  return `<div style="width: 100%; padding: 0.5cm; text-align: center; color: #777; font-family: 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', 'Ubuntu', 'Droid Sans', sans-serif; font-size: 8px; line-height: 12px; word-wrap: break-word; display: block;">`
            + s +    
          `</div>`;
}

function styleFooter(s) {
  return `<div style="width: 100%; padding: 0.5cm; text-align: center; color: #777; font-family: 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe WPC', 'Segoe UI', 'Ubuntu', 'Droid Sans', sans-serif; font-size: 8px; line-height: 12px; word-wrap: break-word; display: block;">`
            + s +    
          `</div>`;
}

async function printPDF() {

  const argv = parseArgv();

  // console.log(argv);

  const footerText = argv.footerText;
  const displayHeaderFooter = argv.displayHeaderFooter;

  const relInput = argv.input;

  // TODO use input with extension stripped. Error if we attempt output that overwrites input?
  const relOutputBase = argv.output ? argv.output : withoutExtension(relInput);

  const input = util.format('/data/%s', relInput);
  const outputBase = util.format('/data/%s', relOutputBase);

  // TODO use a list of flag names?
  // If no formats are enabled by flags, enable them all
  if (!(argv.html || argv.docx || argv.pdf)) {
    argv.html = true;
    argv.docx = true;
    argv.pdf = true;  
  }

  // If we require html as a final output, use the specified output base for html, otherwise use a temp file
  const htmlOutputBase = argv.html ? outputBase : "/tmp/temphtml";

  // We will generate html if it is needed as a final output OR as an intermediate stage for PDF output
  if (argv.html || argv.pdf) {
    const htmlStdOut = execSync(pandoc(input, htmlOutputBase, "html", argv));
    console.log(htmlStdOut.toString());
  }

  if (argv.docx) {
    const docxStdOut = execSync(pandoc(input, outputBase, "docx", argv));
    console.log(docxStdOut.toString());
  }

  if (argv.pdf) {
    // Note fix for restricted shm space by default in docker, see 
    // https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--disable-dev-shm-usage']
      });

    // See https://github.com/puppeteer/puppeteer/blob/v3.0.1/docs/api.md#pagepdfoptions for description of options
    // TODO get papersize from front matter? Would then change to override styles, allowing PDF and Docx to have the same page size if pandoc uses front matter for docx?
    const page = await browser.newPage();
    await page.goto(util.format('file://%s.html', htmlOutputBase), {waitUntil: 'networkidle2'});
    await page.pdf({
      path: util.format('%s.pdf', outputBase), 
      format: 'A4', 
      preferCSSPageSize: false,
      margin: displayHeaderFooter ? {
        top: "2.5cm", left: "1.5cm", right: "1.5cm", bottom: "2.5cm"
      } : {
        top: "1.5cm", left: "1.5cm", right: "1.5cm", bottom: "1.5cm"
      },
      displayHeaderFooter: displayHeaderFooter,
      headerTemplate: styleHeader(`<span class="title"></span>`),
      footerTemplate: styleFooter(
        `<span>` + 
          footerText +            
        ` <span>
            Page <span class="pageNumber"></span>/<span class="totalPages"></span>
          </span>
        </span>`)
    });

    await browser.close();
  }

}

printPDF();