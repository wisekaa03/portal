#!/bin/sh

cat <<EOF > .env
# App
HOST="${HOST}"
PORT="${PORT}"

# DB
DATABASE_CONNECTION="${DATABASE_CONNECTION}"
DATABASE_HOST="${DATABASE_HOST}"
DATABASE_PORT="${DATABASE_PORT}"
DATABASE_USERNAME="${DATABASE_USERNAME}"
DATABASE_PASSWORD="${DATABASE_PASSWORD}"
DATABASE_DATABASE="${DATABASE_DATABASE}"
DATABASE_SCHEMA="${DATABASE_SCHEMA}"
DATABASE_SYNCHRONIZE="${DATABASE_SYNCHRONIZE}"
DATABASE_DROP_SCHEMA="${DATABASE_DROP_SCHEMA}"
DATABASE_MIGRATIONS_RUN="${DATABASE_MIGRATIONS_RUN}"
DATABASE_LOGGING=${DATABASE_LOGGING}
DATABASE_CACHE="${DATABASE_CACHE}"

# HTTP Redis
HTTP_REDIS_HOST="${HTTP_REDIS_HOST}"
HTTP_REDIS_PORT="${HTTP_REDIS_PORT}"
HTTP_REDIS_DB="${HTTP_REDIS_DB}"
HTTP_REDIS_PASSWORD="${HTTP_REDIS_PASSWORD}"
HTTP_REDIS_PREFIX="${HTTP_REDIS_PREFIX}"
HTTP_REDIS_TTL="${HTTP_REDIS_TTL}"
HTTP_REDIS_MAX_OBJECTS="${HTTP_REDIS_MAX_OBJECTS}"

# LDAP Redis
LDAP_REDIS_HOST="${LDAP_REDIS_HOST}"
LDAP_REDIS_PORT="${LDAP_REDIS_PORT}"
LDAP_REDIS_DB="${LDAP_REDIS_DB}"
LDAP_REDIS_PASSWORD="${LDAP_REDIS_PASSWORD}"
LDAP_REDIS_TTL="${LDAP_REDIS_TTL}"

# LDAP
LDAP_URL="${LDAP_URL}"
LDAP_BIND_DN="${LDAP_BIND_DN}"
LDAP_BIND_PW="${LDAP_BIND_PW}"
LDAP_SEARCH_BASE="${LDAP_SEARCH_BASE}"
LDAP_SEARCH_FILTER="${LDAP_SEARCH_FILTER}"
LDAP_SEARCH_BASE_ALL_USERS="${LDAP_SEARCH_BASE_ALL_USERS}"
LDAP_SEARCH_FILTER_ALL_USERS="${LDAP_SEARCH_FILTER_ALL_USERS}"
EOF

export NODE=`which node`

# TODO: https://github.com/typeorm/typeorm/blob/master/docs/migrations.md
# "Typically it is unsafe to use synchronize: true for schema synchronization on production
# once you get data in your database. Here is where migrations come to help."
TS_NODE_PROJECT="tsconfig.server.json" node_modules/.bin/ts-node ./node_modules/typeorm/cli.js schema:sync
# TS_NODE_PROJECT="tsconfig.server.json" ts-node ./node_modules/typeorm/cli.js migration:run

if [ -n "$*" -a "$1" = "test" ]; then
  export NODE_ENV=${NODE_ENV:=test}
  node_modules/.bin/jest $2 $3 $4 $5
elif [ -n "$*" -a "$1" = "start" ]; then
  export NODE_ENV=${NODE_ENV:=production}
  $NODE .nest/server/main.js
elif [ -n "$*" ]; then
  yarn dev
fi
