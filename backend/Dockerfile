FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ \
  && ln -sf /usr/bin/python3 /usr/bin/python

ENV npm_config_fetch_retries=5 \
  npm_config_fetch_retry_factor=10 \
  npm_config_fetch_retry_mintimeout=20000 \
  npm_config_fetch_retry_maxtimeout=120000 \
  npm_config_fetch_timeout=600000

COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src
RUN npm run prisma:generate && npm run build

EXPOSE 5050

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
