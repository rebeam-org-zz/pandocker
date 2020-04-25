FROM pandoc/latex:2.9.2.1

RUN apk --no-cache add \
        graphviz \
        fontconfig \
        ttf-liberation \
        font-noto \
        pngcrush \
        wget \
        tar
        
COPY filters filters

# RUN wget -O eisvogel.tar.gz https://github.com/Wandmalfarbe/pandoc-latex-template/releases/download/v1.4.0/Eisvogel-1.4.0.tar.gz && mkdir eisvogel && tar -xzf eisvogel.tar.gz -C eisvogel