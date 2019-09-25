FROM node:12

WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY package.json /usr/src/app/
COPY yarn.lock /usr/src/app/
COPY .env /usr/src/app/
COPY jwt.private.pem /usr/src/app/
COPY jwt.public.pem /usr/src/app/
COPY node_modules/ /usr/src/app/
COPY .next/ /usr/src/app/
COPY .nest/ /usr/src/app/
# TODO: when production, turn off
# RUN yarn install

COPY . /usr/src/app
# RUN yarn build

EXPOSE 4000

CMD ["yarn", "start"]
