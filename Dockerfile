FROM pandoc/latex:2.9.2.1

RUN apk --no-cache add \
        graphviz \
        fontconfig \
        ttf-liberation \
        font-noto \
        pngcrush
        
COPY filters filters
