FROM node:14
WORKDIR /portal/

# LABELS
LABEL maintainer="webmaster@i-npz.ru"
LABEL vendor="INPZ"

ENV PORT=4000
ENV PORT_DEBUG=9229

# PREPARE DEVELOPMENT
#RUN apt-get update && apt-get install -y \
#  net-tools \ip
#  telnet \
#  dnsutils \
#  nano \
#  && rm -rf /var/lib/apt/lists/*

# FOR BUILD
# RUN set -ex; \
#   apt-get update \
#   && apt-get install -y openssl libpq-dev

RUN ln -fs /usr/share/zoneinfo/Europe/Moscow /etc/localtime
RUN dpkg-reconfigure -f noninteractive tzdata

# COPY
COPY . ./

# EXPOSE
EXPOSE ${PORT} ${PORT_DEBUG}

# YARN START
CMD [ "./entrypoint.sh", "start" ]
