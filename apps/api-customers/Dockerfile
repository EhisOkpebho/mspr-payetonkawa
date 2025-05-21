FROM node:20-alpine as deps

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine as builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . ./
RUN npm run build:api-customers

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist/apps/api-customers ./dist/apps/api-customers
COPY --from=builder /app/dist/libs ./dist/libs
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

CMD ["node", "./dist/apps/api-customers/src/main.js"]
