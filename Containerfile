FROM node:20-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm ci
COPY . .
RUN npm run build -w client
RUN npm run build -w server

FROM base AS final
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm ci --omit=dev
COPY --from=builder /app/server/build ./server/build
COPY --from=builder /app/client/dist ./public

EXPOSE 6969
USER node
CMD ["node", "server/build/server.js"]
