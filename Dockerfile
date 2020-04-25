# If you want to export PDF via latex, use pandoc/latex:2.9.2.1
FROM pandoc/core:2.9.2.1

RUN apk --no-cache add \
        graphviz \
        fontconfig \
        ttf-liberation \
        font-noto \
        pngcrush
        
COPY filters /filters
COPY styles /styles
