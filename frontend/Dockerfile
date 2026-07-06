FROM node:22-alpine

WORKDIR /app

ENV npm_config_fetch_retries=5 \
  npm_config_fetch_retry_factor=10 \
  npm_config_fetch_retry_mintimeout=20000 \
  npm_config_fetch_retry_maxtimeout=120000 \
  npm_config_fetch_timeout=600000

COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund

COPY . .
ARG NEXT_PUBLIC_API_URL=http://10.0.0.4:5050
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

EXPOSE 5051

CMD ["npm", "start"]
