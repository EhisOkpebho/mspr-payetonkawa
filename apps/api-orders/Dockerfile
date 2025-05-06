FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

COPY apps/api-orders ./apps/api-orders
COPY libs ./libs

RUN npm install --legacy-peer-deps

RUN npx nest build apps/api-orders

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/dist ./dist

RUN npm install --only=production --legacy-peer-deps

EXPOSE 3000

CMD ["sh", "-c", "node dist/apps/api-orders/src/main.js"]
