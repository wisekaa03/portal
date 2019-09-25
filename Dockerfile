FROM node:12
WORKDIR /kngk-portal/

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

LABEL maintainer="webmaster@kngk-group.ru"
LABEL "org.kngk.vendor"="KNGK"
LABEL version="4"

COPY . ./

EXPOSE 80

CMD ["yarn", "start"]
