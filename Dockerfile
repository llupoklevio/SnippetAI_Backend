FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm ci

COPY ./src ./src

RUN npm run build

RUN npm prune --omit=dev

FROM node:24-alpine AS runtime

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

CMD ["node", "dist/server.js"]