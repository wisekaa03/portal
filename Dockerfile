FROM node:12
WORKDIR /kngk-portal/

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

LABEL maintainer="webmaster@kngk-group.ru"
LABEL "org.kngk.vendor"="KNGK"
LABEL version="4"

COPY package.json ./
COPY yarn.lock ./
COPY .env ./
COPY jwt.private.pem ./
COPY jwt.public.pem ./
RUN ls -la
COPY node_modules/ ./
COPY .next/ ./
COPY .nest/ ./
COPY . ./

# TODO: when production, turn off
# RUN yarn install
# RUN yarn build

EXPOSE 4000

CMD ["yarn", "start"]
