#!/bin/sh

cat <<EOF > .env
# App
HOST="${HOST}"
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
# HTTP_REDIS_PORT="${HTTP_REDIS_PORT}"
# HTTP_REDIS_DB="${HTTP_REDIS_DB}"
# HTTP_REDIS_PASSWORD="${HTTP_REDIS_PASSWORD}"
# HTTP_REDIS_PREFIX="${HTTP_REDIS_PREFIX}"
HTTP_REDIS_TTL="${HTTP_REDIS_TTL}"
HTTP_REDIS_MAX_OBJECTS="${HTTP_REDIS_MAX_OBJECTS}"

# Session Redis
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
# LDAP_REDIS_PORT="${LDAP_REDIS_PORT}"
# LDAP_REDIS_DB="${LDAP_REDIS_DB}"
# LDAP_REDIS_PASSWORD="${LDAP_REDIS_PASSWORD}"
LDAP_REDIS_TTL="${LDAP_REDIS_TTL}"

# MICROSERVICE
MICROSERVICE_URL="${MICROSERVICE_URL}"
MICROSERVICE_USER="${MICROSERVICE_USER}"
MICROSERVICE_PASS="${MICROSERVICE_PASS}"

# SOAP
SOAP_URL="${SOAP_URL}"
SOAP_USER="${SOAP_USER}"
SOAP_PASS="${SOAP_PASS}"

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
export NODE_OPTIONS=--max_old_space_size=4096
export NODE_PG_FORCE_NATIVE=true

# TODO: https://github.com/typeorm/typeorm/blob/master/docs/migrations.md
# "Typically it is unsafe to use synchronize: true for schema synchronization on production
# once you get data in your database. Here is where migrations come to help."

if [ -n "$*" -a "$1" = "test" ]; then
  yarn nest:ormconfig
  $NODE ./node_modules/typeorm/cli.js schema:sync
  export NODE_ENV=${NODE_ENV:=test}
  node_modules/.bin/jest $2 $3 $4 $5

elif [ -n "$*" -a "$1" = "start" ]; then
  $NODE ./node_modules/typeorm/cli.js schema:sync
  export NODE_OPTIONS=--max_old_space_size=4096
  export NODE_ENV=${NODE_ENV:=production}
  $NODE .next/nest/main.js

elif [ -n "$*" -a "$1" = "start:synch" ]; then
  $NODE ./node_modules/typeorm/cli.js schema:sync
  export NODE_OPTIONS=--max_old_space_size=4096
  export NODE_ENV=${NODE_ENV:=production}
  $NODE dist/apps/synch/main.js

elif [ -n "$*" -a "$1" = "start:jobSynch" ]; then
  $NODE ./node_modules/typeorm/cli.js schema:sync
  export NODE_ENV=${NODE_ENV:=production}
  $NODE dist/apps/job-synch/main.js

elif [ -n "$*" -a "$1" = "start:soap1c" ]; then
  $NODE ./node_modules/typeorm/cli.js schema:sync
  export NODE_OPTIONS=--max_old_space_size=4096
  export NODE_ENV=${NODE_ENV:=production}
  $NODE dist/apps/soap1c/main.js

elif [ -n "$*" ]; then
  yarn dev

fi
