# pandocker

Docker container with pandoc and useful plugins, based on [pandoc/latex](https://hub.docker.com/r/pandoc/latex)

## Getting started

1. To build the image, run `docker build --pull --rm -f "Dockerfile" -t pandocker:latest "."`.

2. Alternatively, in VS Code, you can use the command `Docker Image: Build Image...` to build from `Dockerfile`, then accept default tag `pandocker:latest`.

3. To process a markdown file, use the same style of command as for the parent `pandoc/latex:2.6` image:

   ```shell
   docker run --rm --volume "`pwd`:/data" --user `id -u`:`id -g` pandocker:latest --standalone --mathjax --lua-filter /filters/graphviz.lua  -H /styles/default-styles-header.html example.md -o out/example.html
   ```

4. For other formats, change the extension of the output file from `.html` to e.g. `.pdf` or `.docx`. Note that docx uses the default pandoc styling in the output, which is quite reasonable. PDF uses latex, and is therefore very latexy - see Caveats below.

5. To connect to the container if needed for debug, use `docker run -it --volume "`pwd`:/data" --entrypoint "/bin/sh" pandocker:latest`

## Explanation of command line arguments

The `docker` command line given above has two sections - the first arguments go to docker:

1. ``run --rm`` runs the docker container, and removes the contained when it exits, since we are performing a single task.

2. ``--volume "`pwd`:/data"`` - mount the current director `pwd` to the `/data` directory in the container, allowing it to access files in host's current directory to process (for input and output).

3. ``--user `id -u`:`id -g` `` - run as the same user in the container as the host.

4. `pandocker:latest`

The remaining arguments go to to `pandoc` running in the container:

1. `--standalone` - generate a full file (e.g. for html it includes the header).

2. `--mathjax` - use mathjax to display maths in html.

3. `--lua-filter /filters/graphviz.lua` - use a LUA filter in the container that provides graphviz diagrams as SVG in html files, embedded PDF in latex (e.g. when producing PDF files), and 300-dpi PNG images in other formats (e.g. docx).

4. `-H /styles/default-styles-header.html` - include the default CSS styles built into the container in html output, where they are embedded as a script tag. Note that this means this css is included in the html, but note that if you use mathjax the html will still contain external links to a CDN.

5. Finally, `example.md` should be replaced with your input Markdown file, and `out/example.html` with your output file. Here we use the `out` directory, which is ignored by git.

## TODO

1. Have a look at [mathjax-pandoc-filter](https://github.com/lierdakil/mathjax-pandoc-filter) for an alternative for maths - convert to SVG so we don't need mathjax. This would also allow using a completely self-contained html output with `--self-contained` argument to pandoc.

2. Add [puppeteer](https://developers.google.com/web/tools/puppeteer) to the container to allow export of PDF from HTML. This would remove the need to battle latex, and allow use of one set of styling for HTML and PDF.

## Graphviz filter

The `graphviz.lua` filter is based on [Hakuyume/pandoc-filter-graphviz](https://github.com/Hakuyume/pandoc-filter-graphviz), with the following changes:

1. ported to LUA - this is much lighter-weight than having to install the requirements for the original filter. I had trouble compiling it even after installing them.
2. PNG files are generated at 300dpi, and then compressed and labelled as 300dpi using `pngcrush`. This makes them look much better in e.g. docx format.
3. We use pdf output for latex rather than dot2tex, again avoiding a dependency on python and more libraries. This seems to work quite well, but may have disadvantages. 

## References

* [This page has some nice formatting and a graphviz export script in python](http://nrstickley.com/pandoc/example.html)

## Caveats

1. In theory it is possible to style the PDF output via latex, e.g. with [eisvogel](https://github.com/Wandmalfarbe/pandoc-latex-template), but to do this you would need to battle texlive - the container is based on [pandoc/latex](https://hub.docker.com/r/pandoc/latex), which is awkward to update because it is set up with the 2019 texlive and points at a repository that appears to have corrupt/mismatched packages that won't install. Otherwise we would be able to use `tlmgr` to install the packages needed for eisvogel to work.
