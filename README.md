# pandocker

Docker container with pandoc and useful plugins

## WIP log

1. Command `Docker Image: Build Image...` to build from `Dockerfile`, accept default tag `pandocker:latest`

2. To process, use same style of command as for parent `pandoc/latex:2.6` image:

   ```shell
   docker run --rm --volume "`pwd`:/data" --user `id -u`:`id -g` pandocker:latest example.md --standalone --mathjax --lua-filter ./filters/graphviz.lua -o out/example.html
   ```

3. For other formats, change the extension of the output file from `.html` to e.g. `.pdf` or `.docx`

4. To connect to the container to try things, use `docker run -it --volume "`pwd`:/data" --entrypoint "/bin/sh" pandocker:latest`

5. To build image, use `docker build --pull --rm -f "Dockerfile" -t pandocker:latest "."`

## TODO

* Have a look at [mathjax-pandoc-filter](https://github.com/lierdakil/mathjax-pandoc-filter) for an alternative for maths - convert to SVG so we don't need mathjax. This would also allow using a self-contained html output.

## References

* [This page has some nice formatting and a graphviz export script in python](http://nrstickley.com/pandoc/example.html)
