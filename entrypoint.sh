#!/bin/sh

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
  node_modules/.bin/jest $2 $3 $4 $5

elif [ -n "$*" -a "$1" = "schema" ]; then
  $TSNODE -P ./tsconfig.ormconfig.json -r tsconfig-paths/register ./node_modules/typeorm/cli.js schema:sync

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
