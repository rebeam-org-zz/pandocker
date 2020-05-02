#!/bin/bash
docker run -it --volume "`pwd`:/data" --cap-add=SYS_ADMIN pandocker:latest node /pptr/pptr.js "$@"