FROM pandoc/latex:2.6

RUN apk --no-cache add \
        graphviz \
        graphviz-dev \
        py-pip \
        build-base \
        python-dev \
        python \
        fontconfig \
        ttf-liberation \
        font-noto \
        bash \
        pngcrush
        
RUN pip install dot2tex pandocfilters pygraphviz

COPY filters filters

# RUN cabal update && cabal install utf8-string && cabal install SHA && cabal install pandoc

# RUN cd ./filters/pandoc-filter-graphviz-master && ghc --make Main.hs -o pandoc-filter-graphviz

# FROM haskell:8.0

# # install latex packages
# RUN apt-get update -y \
#   && apt-get install -y -o Acquire::Retries=10 --no-install-recommends \
#     texlive-latex-base \
#     texlive-xetex latex-xcolor \
#     texlive-math-extra \
#     texlive-latex-extra \
#     texlive-fonts-extra \
#     texlive-bibtex-extra \
#     fontconfig \
#     lmodern \
#     pandoc \
#     graphviz \
#     dot2tex \
#     ghc \
#     libghc-utf8-string-dev \
#     libghc-sha-dev \
#     libghc-pandoc-dev 

# WORKDIR /source

# COPY filters filters

# RUN cd ./filters/pandoc-filter-graphviz-master && ghc -v --make Main.hs -o pandoc-filter-graphviz

# ENTRYPOINT [ "pandoc" ]
