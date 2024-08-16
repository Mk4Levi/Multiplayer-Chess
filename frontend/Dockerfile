ARG NODE_VERSION=18.17.0

# Stage 1: Build
FROM node:${NODE_VERSION}-slim AS build

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm ci

COPY . .

RUN npm run build


# Stage 2: Development image
FROM node:${NODE_VERSION}-slim as development

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm ci

COPY . .

ENV PORT 8080

EXPOSE $PORT

CMD [ "npm", "run", "dev"]


# Stage 3: Production image
