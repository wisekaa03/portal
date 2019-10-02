FROM node:12
WORKDIR /portal/

# LABELS
LABEL maintainer="webmaster@kngk-group.ru"
LABEL vendor="KNGK"
LABEL version="4"

# APPLICATION PARAMETERS
ARG NODE_ENV=production
ENV NODE_ENV ${NODE_ENV}
ARG PORT=4000
ENV PORT ${PORT}
ARG PORT_DEBUGGER=9229
ENV PORT_DEBUGGER ${PORT_DEBUGGER}

# DB
ARG DATABASE_CONNECTION=postgres
ENV DATABASE_CONNECTION ${DATABASE_CONNECTION}
ARG DATABASE_HOST=localhost
ENV DATABASE_HOST ${DATABASE_HOST}
ARG DATABASE_PORT=5432
ENV DATABASE_PORT ${DATABASE_PORT}
ARG DATABASE_USERNAME=postgres
ENV DATABASE_USERNAME ${DATABASE_USERNAME}
ARG DATABASE_PASSWORD=1234567890
ENV DATABASE_PASSWORD ${DATABASE_PASSWORD}
ARG DATABASE_DATABASE=public
ENV DATABASE_DATABASE ${DATABASE_DATABASE}
ARG DATABASE_SCHEMA=public
ENV DATABASE_SCHEMA ${DATABASE_SCHEMA}
ARG DATABASE_SYNCHRONIZE=true
ENV DATABASE_SYNCHRONIZE ${DATABASE_SYNCHRONIZE}
ARG DATABASE_DROP_SCHEMA=true
ENV DATABASE_DROP_SCHEMA ${DATABASE_DROP_SCHEMA}
ARG DATABASE_MIGRATIONS_RUN=true
ENV DATABASE_MIGRATIONS_RUN ${DATABASE_MIGRATIONS_RUN}
ARG DATABASE_LOGGING=true
ENV DATABASE_LOGGING ${DATABASE_LOGGING}
ARG DATABASE_CACHE=true
ENV DATABASE_CACHE ${DATABASE_CACHE}

# Redis
ARG REDIS_HOST=localhost
ENV REDIS_HOST ${REDIS_HOST}
ARG REDIS_PORT=6379
ENV REDIS_PORT ${REDIS_PORT}
ARG REDIS_DB=0
ENV REDIS_DB ${REDIS_DB}
ARG REDIS_PASSWORD
ENV REDIS_PASSWORD ${REDIS_PASSWORD}
ARG REDIS_PREFIX
ENV REDIS_PREFIX ${REDIS_PREFIX}

# App
ARG SESSION_SECRET=supersecret
ENV SESSION_SECRET ${SESSION_SECRET}

# LDAP
ARG LDAP_URL=ldap://pdc:389
ENV LDAP_URL ${LDAP_URL}
ARG LDAP_BIND_DN=CN=user,DC=example,DC=local
ENV LDAP_BIND_DN ${LDAP_BIND_DN}
ARG LDAP_BIND_PW=1234567890
ENV LDAP_BIND_PW ${LDAP_BIND_PW}
ARG LDAP_SEARCH_BASE=DC=example,DC=local
ENV LDAP_SEARCH_BASE ${LDAP_SEARCH_BASE}
ARG LDAP_SEARCH_FILTER=(sAMAccountName={{username}})
ENV LDAP_SEARCH_FILTER ${LDAP_SEARCH_FILTER}

# PREPARE
RUN apt-get update && apt-get install -y \
  telnet \
  dnsutils \
  nano \
  && rm -rf /var/lib/apt/lists/*

# COPY
COPY . ./

# EXPOSE
EXPOSE ${PORT} ${PORT_DEBUGGER}

# YARN START
CMD [ "./entrypoint.sh" ]
