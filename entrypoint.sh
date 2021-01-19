#!/bin/sh

export NODE=`which node`
export NODE_OPTIONS=--max_old_space_size=1024
export NODE_PG_FORCE_NATIVE=true
export NODE_ENV=${NODE_ENV:=production}

# FIX: https://github.com/typeorm/typeorm/blob/master/docs/migrations.md
# "Typically it is unsafe to use synchronize: true for schema synchronization on production
# once you get data in your database. Here is where migrations come to help."

if [ -n "$*" -a "$1" = "test" ]; then
  NODE_ENV=test
  node_modules/.bin/jest $2 $3 $4 $5

elif [ -n "$*" -a "$1" = "schema" ]; then
  $NODE ./node_modules/typeorm/cli.js -f .next/typeorm/ormconfig.js schema:sync

elif [ -n "$*" -a "$1" = "start" ]; then
  $NODE .next/nest/main.js

elif [ -n "$*" -a "$1" = "start:sync" ]; then
  $NODE ./node_modules/typeorm/cli.js -f .next/typeorm/ormconfig.js schema:sync
  $NODE dist/apps/sync/main.js

elif [ -n "$*" -a "$1" = "start:syncJob" ]; then
  $NODE ./node_modules/typeorm/cli.js -f .next/typeorm/ormconfig.js schema:sync
  $NODE dist/apps/sync-job/main.js

elif [ -n "$*" -a "$1" = "build" ]; then
mkdir -p .local
cat <<EOF > .local/.env
# App
PORT="${PORT}"
# PORT_DEBUG="${PORT_DEBUG}"
DOMAIN="${DOMAIN}"
DEVELOPMENT="${DEVELOPMENT}"

# Logging
LOG_LEVEL="${LOG_LEVEL}"
LOG_SERVER="${LOG_SERVER}"

# Database
DATABASE_URI="${DATABASE_URI}"
DATABASE_URI_RD="${DATABASE_URI_RD}"
DATABASE_SCHEMA="${DATABASE_SCHEMA}"
DATABASE_SYNCHRONIZE="${DATABASE_SYNCHRONIZE}"
DATABASE_DROP_SCHEMA="${DATABASE_DROP_SCHEMA}"
DATABASE_MIGRATIONS_RUN="${DATABASE_MIGRATIONS_RUN}"
DATABASE_LOGGING="${DATABASE_LOGGING}"
# Database Redis
DATABASE_REDIS_URI="${DATABASE_REDIS_URI}"
DATABASE_REDIS_TTL="${DATABASE_REDIS_TTL}"

# GraphQL Redis
GRAPHQL_REDIS_URI="${GRAPHQL_REDIS_URI}"
GRAPHQL_REDIS_TTL="${GRAPHQL_REDIS_TTL}"

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
LDAP="${LDAP}"

# LDAP Redis
LDAP_REDIS_URI="${LDAP_REDIS_URI}"
LDAP_REDIS_TTL="${LDAP_REDIS_TTL}"

# MICROSERVICE
MICROSERVICE_URL="${MICROSERVICE_URL}"

# SOAP
TICKETS_URL="${TICKETS_URL}"
REPORTS_URL="${REPORTS_URL}"
DOCFLOW_URL="${DOCFLOW_URL}"

TICKETS_REDIS_URI="${TICKETS_REDIS_URI}"
TICKETS_REDIS_TTL="${TICKETS_REDIS_TTL}"
REPORTS_REDIS_URI="${REPORTS_REDIS_URI}"
REPORTS_REDIS_TTL="${REPORTS_REDIS_TTL}"
DOCFLOW_REDIS_URI="${DOCFLOW_REDIS_URI}"
DOCFLOW_REDIS_TTL="${DOCFLOW_REDIS_TTL}"

# OSTICKET
OSTICKET_URL="${OSTICKET_URL}"

# NEXTCLOUD
NEXTCLOUD_URL="${NEXTCLOUD_URL}"
NEXTCLOUD_REDIS_URI="${NEXTCLOUD_REDIS_URI}"
NEXTCLOUD_REDIS_TTL="${NEXTCLOUD_REDIS_TTL}"
MAX_FILE_SIZE="${MAX_FILE_SIZE}"

# NEWS
NEWS_URL="${NEWS_URL}"
NEWS_API_URL="${NEWS_API_URL}"

# MAIL
MAIL_URL="${MAIL_URL}"
MAIL_LOGIN_URL="${MAIL_LOGIN_URL}"

# MEETING
MEETING_URL="${MEETING_URL}"
EOF

fi
