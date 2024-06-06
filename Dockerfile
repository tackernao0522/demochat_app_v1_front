FROM node:18.20.3-alpine3.20

ARG WORKDIR

ENV HOME=/${WORKDIR} \
    LANG=C.UTF-8 \
    TZ=Asia/Tokyo \
    HOST=0.0.0.0

WORKDIR ${HOME}
