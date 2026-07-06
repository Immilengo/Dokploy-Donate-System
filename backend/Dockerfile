FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src
RUN npm run prisma:generate && npm run build

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
