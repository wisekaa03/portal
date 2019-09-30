FROM node:10
WORKDIR /kngk-portal/

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

LABEL maintainer="webmaster@kngk-group.ru"
LABEL "org.kngk.vendor"="KNGK"
LABEL version="4"

RUN apt-get update
RUN apt-get install -y telnet dnsutils nano

COPY . ./

EXPOSE 4000 9229

CMD ["yarn", "start"]
