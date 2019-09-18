FROM node:12-alpine

WORKDIR /app

COPY . ./

RUN yarn
RUN yarn jwt:cert
RUN yarn build

EXPOSE 4000

CMD ["yarn", "start"]
