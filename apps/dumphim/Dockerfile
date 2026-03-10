FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm install -g pnpm && pnpm install

FROM node:20-alpine AS production-dependencies-env
COPY ./package.json /app/
WORKDIR /app
RUN npm install -g pnpm && pnpm install --prod

FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm install -g pnpm && pnpm run build

FROM node:20-alpine
COPY ./package.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY ./start.sh /app/start.sh
WORKDIR /app
RUN npm install -g pnpm && chmod +x start.sh
CMD ["./start.sh"]