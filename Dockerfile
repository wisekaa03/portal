FROM node:12

WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY package.json yarn.lock .env jwt.private.pem jwt.public.pem /usr/src/app/

# TODO: when production, turn off
RUN yarn install --production=true

COPY . /usr/src/app

RUN yarn build

EXPOSE 4000

CMD ["yarn", "start"]
