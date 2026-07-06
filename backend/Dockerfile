FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ \
  && ln -sf /usr/bin/python3 /usr/bin/python

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src
RUN npm run prisma:generate && npm run build

EXPOSE 5050

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
