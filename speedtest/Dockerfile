FROM node:24.22.1-alpine3.23

ARG ENVIRONMENT
ENV ENVIRONMENT=${ENVIRONMENT}

WORKDIR /app

COPY . .

RUN NODE_ENV=development npm install

RUN NODE_ENV=${ENVIRONMENT} npm run build

EXPOSE 9999

CMD ["node", "./scripts/heroku-start.js"]

