FROM node:18.20.3-alpine3.20

ARG WORKDIR=/app
ARG API_URL

ENV HOME=${WORKDIR} \
    LANG=C.UTF-8 \
    TZ=Asia/Tokyo \
    HOST=0.0.0.0 \
    API_URL=${API_URL}

WORKDIR ${HOME}

# パッケージをコピーしてインストール
COPY package.json yarn.lock ./
RUN yarn install

# アプリケーションのソースコードをコピー
COPY . .

# デフォルトのコマンド
CMD ["yarn", "dev"]
