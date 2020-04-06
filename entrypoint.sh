#!/bin/sh

cat <<EOF > .env
# App
PORT="${PORT}"

# Database
DATABASE_URI="${DATABASE_URI}"
DATABASE_URI_RD="${DATABASE_URI_RD}"
DATABASE_SCHEMA="${DATABASE_SCHEMA}"
DATABASE_SYNCHRONIZE=${DATABASE_SYNCHRONIZE}
DATABASE_DROP_SCHEMA=${DATABASE_DROP_SCHEMA}
DATABASE_MIGRATIONS_RUN=${DATABASE_MIGRATIONS_RUN}
DATABASE_LOGGING=${DATABASE_LOGGING}
# Database Redis
DATABASE_REDIS_URI="${DATABASE_REDIS_URI}"
DATABASE_REDIS_TTL="${DATABASE_REDIS_TTL}"

# HTTP Redis
HTTP_REDIS_URI="${HTTP_REDIS_URI}"
HTTP_REDIS_TTL="${HTTP_REDIS_TTL}"
HTTP_REDIS_MAX_OBJECTS="${HTTP_REDIS_MAX_OBJECTS}"

# Session Redis
SESSION_NAME="${SESSION_NAME}"
SESSION_REDIS_URI="${SESSION_REDIS_URI}"
SESSION_COOKIE_TTL="${SESSION_COOKIE_TTL}"
SESSION_SECRET="${SESSION_SECRET}"

# LDAP
LDAP_URL="${LDAP_URL}"
LDAP_BIND_DN="${LDAP_BIND_DN}"
LDAP_BIND_PW="${LDAP_BIND_PW}"
LDAP_SEARCH_BASE="${LDAP_SEARCH_BASE}"
LDAP_SEARCH_FILTER="${LDAP_SEARCH_FILTER}"
LDAP_SEARCH_GROUP="${LDAP_SEARCH_GROUP}"
LDAP_SEARCH_BASE_ALL_USERS="${LDAP_SEARCH_BASE_ALL_USERS}"
LDAP_SEARCH_FILTER_ALL_USERS="${LDAP_SEARCH_FILTER_ALL_USERS}"

# LDAP Redis
LDAP_REDIS_URI="${LDAP_REDIS_URI}"
LDAP_REDIS_TTL="${LDAP_REDIS_TTL}"

# MICROSERVICE
MICROSERVICE_URL="${MICROSERVICE_URL}"

# SOAP
SOAP_URL="${SOAP_URL}"
SOAP_USER="${SOAP_USER}"
SOAP_PASS="${SOAP_PASS}"
SOAP_DOMAIN="${SOAP_DOMAIN}"

# NEWS
NEWS_URL="${NEWS_URL}"
NEWS_API_URL="${NEWS_API_URL}"

# MAIL
MAIL_URL="${MAIL_URL}"
MAIL_LOGIN_URL="${MAIL_LOGIN_URL}"

# MEETING
MEETING_URL="${MEETING_URL}"
EOF

export NODE=`which node`
export TSNODE="./node_modules/.bin/ts-node"
export NODE_OPTIONS=--max_old_space_size=1024
export NODE_PG_FORCE_NATIVE=true
export NODE_ENV=${NODE_ENV:=production}

# FIX: https://github.com/typeorm/typeorm/blob/master/docs/migrations.md
# "Typically it is unsafe to use synchronize: true for schema synchronization on production
# once you get data in your database. Here is where migrations come to help."

if [ -n "$*" -a "$1" = "test" ]; then
  NODE_ENV=test
  $TSNODE -P ./tsconfig.ormconfig.json -r tsconfig-paths/register ./node_modules/typeorm/cli.js schema:sync
  node_modules/.bin/jest $2 $3 $4 $5

elif [ -n "$*" -a "$1" = "start" ]; then
  $NODE .next/nest/main.js

elif [ -n "$*" -a "$1" = "start:sync" ]; then
  $TSNODE -P ./tsconfig.ormconfig.json -r tsconfig-paths/register ./node_modules/typeorm/cli.js schema:sync
  $NODE dist/apps/sync/main.js

elif [ -n "$*" -a "$1" = "start:syncJob" ]; then
  $TSNODE -P ./tsconfig.ormconfig.json -r tsconfig-paths/register ./node_modules/typeorm/cli.js schema:sync
  $NODE dist/apps/sync-job/main.js

elif [ -n "$*" ]; then
  NODE_ENV=development
  yarn dev

fi
