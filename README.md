# pandocker

Docker container with pandoc and useful plugins, based on [pandoc/core](https://hub.docker.com/r/pandoc/core)

## Getting started

1. To build the image, run `docker build --pull --rm -f "Dockerfile" -t pandocker:latest "."`.

2. Alternatively, in VS Code, you can use the command `Docker Image: Build Image...` to build from `Dockerfile`, then accept default tag `pandocker:latest`.

3. Run the script `pandocker.sh`.

4. `pandocker.sh -h` will show help on options.

5. `pandocker.sh example.md -o out/example` will process the `example.md` file in this project to a set of output files in the `out` directory, named `example.xyz` where `xyz` is the extension for the format.

6. Note that input and output filenames are relative to the current directory, which is made available to the docker container - files outside the current directory cannot be used for input or output, attempting to do this will result in an error since the files will be looked for in the container itself.

## Lower-level commands

The `pandocker.sh` script just runs docker with the `pandocker` image, and uses the container's installation of `pandoc`, `puppeteer` and associated scripts to process input in the current directory of the host. We can also use `pandoc` directly, or directly use the `pptr.js` node script that is called by the `pandocker.sh` script. These commands should help show how pandocker works.

1. To process a markdown file using pandoc directly, use the same style of command as for the parent `pandoc/core:2.9.2.1` image:

   ```shell
   docker run --rm --volume "`pwd`:/data" --user `id -u`:`id -g` --cap-add=SYS_ADMIN pandocker:latest pandoc --standalone --mathjax --lua-filter /filters/graphviz.lua --lua-filter /filters/rfc8174.lua -H /styles/default-styles-header.html example.md -o out/example.html
   ```

2. For other formats, change the extension of the output file from `.html` to e.g. `.docx`. Note that docx uses the default pandoc styling in the output, which is quite reasonable.

3. To process using the `pptr.js` node script, which provides an easier syntax and PDF export, use the following, replacing `example.md` with your markdown, this will produce `outputBaseName.pdf`, `outputBaseName.docx` and `outputBaseName.html` files. Try using `-h` for more information on options:

   ```shell
   docker run -it --volume "`pwd`:/data" --cap-add=SYS_ADMIN pandocker:latest node /pptr/pptr.js example.md -o outputBaseName
   ```

4. To connect to the container if needed for debug:

   ```shell
   docker run -it --volume "`pwd`:/data" --cap-add=SYS_ADMIN pandocker:latest /bin/sh
   ```

## Explanation of docker + pandoc command line arguments

The `docker` command line given above has two sections - the first arguments go to docker:

1. ``run --rm`` runs the docker container, and removes the contained when it exits, since we are performing a single task.

2. ``--volume "`pwd`:/data"`` - mount the current director `pwd` to the `/data` directory in the container, allowing it to access files in host's current directory to process (for input and output).

3. ``--user `id -u`:`id -g` `` - run as the same user in the container as the host.

4. `--cap-add=SYS_ADMIN` is to allow enough permissions for puppeteer to run. This isn't required for pandoc.

5. `pandocker:latest` to select the image.

The remaining arguments go to the container:

1. `pandoc` to run the pandoc tool. Since we support both pandoc and puppeteer for converting html to pdf we need to specify the command rather than having a fixed entrypoint.

2. `--standalone` - generate a full file (e.g. for html it includes the header).

3. `--mathjax` - use mathjax to display maths in html.

4. `--lua-filter /filters/graphviz.lua` - use the graphviz filter (described later)

5. `--lua-filter /filters/rfc8174.lua` -  use the RFC8174 filter (described later)

6. `-H /styles/default-styles-header.html` - include the default CSS styles built into the container in html output

7. Finally, `example.md` should be replaced with your input Markdown file, and `out/example.html` with your output file. Here we use the `out` directory, which is ignored by git.

## Provided pandoc filters

The `filters` directory contains LUA filters that can be run by pandoc directly. These could also be used outside the container, provided the necessary command-line tools are available - see the script source for details.

### Graphviz filter

The `graphviz.lua` filter is based on [Hakuyume/pandoc-filter-graphviz](https://github.com/Hakuyume/pandoc-filter-graphviz), with the following changes:

1. ported to LUA - this is much lighter-weight than having to install the requirements for the original filter. I had trouble compiling it even after installing them.
2. PNG files are generated at 300dpi, and then compressed and labelled as 300dpi using `pngcrush`. This makes them look much better in e.g. docx format.
3. We use pdf output for latex rather than dot2tex, again avoiding a dependency on python and more libraries. This seems to work quite well, but may have disadvantages.

### RFC8174 filter

This processes [RFC8174](https://tools.ietf.org/html/rfc8174) phrases to add styling - see `example.md` for a description and examples.

## Styles

The default styles provided in the `styles` directory are based on VS Code markdown export, and need some work.

The format is as a `<style>` tag, which pandoc can insert directly into the HTML `<head>` element. Note that this means this css is included in the html, but note that if you use mathjax the html will still contain external links to a CDN. See [this page](https://devilgate.org/blog/2012/07/02/tip-using-pandoc-to-create-truly-standalone-html-files/) for more details.

Note that to get good results when printing HTML to a PDF, you should specify page size and margins in an `@page` block in CSS; this is shown in the default styles. If not, page size should default to A4, and margins should be 1.5cm (although chromium appears to be slightly inconsistent on this, so it may be best to ensure you specify margins in CSS).

## References

* [This page has some nice formatting and a graphviz export script in python](http://nrstickley.com/pandoc/example.html)

## Caveats

1. To reduce the size of the Docker image, we now use [pandoc/core](https://hub.docker.com/r/pandoc/core) rather than [pandoc/latex](https://hub.docker.com/r/pandoc/latex). If you want to generate PDF files with latex, you need to change the `Dockerfile` back - there is a commented line with correct image name. The PDF export provided by `pandocker.sh` uses puppeteer to export the generated HTML.
2. In theory it is possible to style the PDF output via latex, e.g. with [eisvogel](https://github.com/Wandmalfarbe/pandoc-latex-template), but to do this you would need to battle texlive - the container is based on [pandoc/latex](https://hub.docker.com/r/pandoc/latex), which is awkward to update because it is set up with the 2019 texlive and points at a repository that appears to have corrupt/mismatched packages that won't install. Otherwise we would be able to use `tlmgr` to install the packages needed for eisvogel to work.

## TODO

 [] Have a look at [mathjax-pandoc-filter](https://github.com/lierdakil/mathjax-pandoc-filter) for an alternative for maths - convert to SVG so we don't need mathjax. This would also allow using a completely self-contained html output with `--self-contained` argument to pandoc.

 [] Look at different ways of including SVG from graphviz - would be nice to have `<img>` tags we can style, some approaches [here](https://css-tricks.com/using-svg/).

 [] Look at using bootstrap for styling - this would require either a modified bootstrap (e.g. by using LESS to include `.table` styles in `table`), or adding `.table` to output tables - this is hard in pandoc at the moment, but should be possible when attributes are added to table according to [this issue](https://github.com/jgm/pandoc/issues/1024) - looks like the change was merged mid-April 2020 so might not be too long. There's an existing approach [here](https://github.com/htdebeer/paru/blob/master/examples/filters/add_css_class_to_tables.rb), but it uses an odd approach and needs Ruby.
