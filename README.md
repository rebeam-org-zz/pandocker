# pandocker

Docker container with pandoc and useful plugins

## WIP log

1. Command `Docker Image: Build Image...` to build from `Dockerfile`, accept default tag `pandocker:latest`
2. To process, use same style of command as for parent `pandoc/latex:2.6` image:

   ```shell
   docker run --rm --volume "`pwd`:/data" --user `id -u`:`id -g` pandocker:latest example.md --standalone --mathjax --lua-filter ./filters/graphviz.lua -o example.html
   ```

3. For a docx, use:

   ```shell
   docker run --rm --volume "`pwd`:/data" --user `id -u`:`id -g` pandocker:latest example.md --standalone --mathjax --lua-filter ./filters/graphviz.lua -o example.docx
   ```

3. To connect to the container to try things, use `docker run -it --entrypoint "/bin/bash" pandocker:latest`

## TODO

* Have a look at [mathjax-pandoc-filter](https://github.com/lierdakil/mathjax-pandoc-filter) for an alternative for maths - convert to SVG so we don't need mathjax.
* Add graphviz support, e.g. [this filter](https://github.com/Hakuyume/pandoc-filter-graphviz)

## References

* [This page has some nice formatting and a graphviz export script in python](http://nrstickley.com/pandoc/example.html)
