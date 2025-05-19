FROM node:18-alpine as deps

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine as builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . ./
RUN npm run build:api-orders

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist/apps/api-orders ./dist/apps/api-orders
COPY --from=builder /app/dist/libs ./dist/libs
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3001

CMD ["node", "./dist/apps/api-orders/src/main.js"]
