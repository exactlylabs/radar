FROM node:18-alpine

ARG ENVIRONMENT
ENV NODE_ENV=${ENVIRONMENT}

WORKDIR /app

COPY package.json package-lock.json ./

RUN NODE_ENV=${NODE_ENV} npm ci

COPY ./src ./public ./webpack ./static.json ./tsconfig.json ./

RUN NODE_ENV=${NODE_ENV} npm run build

FROM nginx:1.27-alpine

EXPOSE 80

COPY --from=0 /app/dist /usr/share/nginx/html

COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
