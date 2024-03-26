FROM node:18-alpine

ARG NODE_ENV=staging

WORKDIR /app

COPY . .

RUN NODE_ENV=${NODE_ENV} npm install

RUN NODE_ENV=${NODE_ENV} npm run build

EXPOSE 9999

CMD ["node", "./scripts/heroku-start.js"]

