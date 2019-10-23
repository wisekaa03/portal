# Portal

[Nest.js](https://nestjs.com), [TypeORM](https://typeorm.io), [GraphQL](https://graphql.org/), LDAP Service, [Passport JWT](https://github.com/mikenicholson/passport-jwt), [Next.js (v9)](https://nextjs.org), [React.js](https://reactjs.org/), [Material UI (v4)](https://material-ui.com)

[![pipeline status](https://git.kngk.org/Project/portal/badges/master/pipeline.svg)](https://git.kngk.org/Project/portal/commits/master)

## Features

- [x] Cross platform - Mac, Linux and Windows
- [x] API server - powered by [Nest](https://nestjs.com)
- [x] Environment variables using [dotenv](https://github.com/motdotla/dotenv)
- [x] Server Side Rendering - powered by [Next.js](https://nextjs.org)
- [x] [Material UI](https://material-ui.com) design
- [x] [TypeORM](https://typeorm.io)
- [x] [GraphQL](https://graphql.org/)
- [x] [React.js](https://reactjs.org/)
- [x] User authentication - powered by [Passport](http://www.passportjs.org)
- [x] LDAP through custom NestJS LDAPService
- [ ] [WebSockets](https://www.apollographql.com/docs/link/links/ws/)
- [ ] Admin page

## Technologies

- Hot reloading for the developer experience
  - [nodemon](https://nodemon.io) - Monitor for any changes in your node.js application and automatically restart the server
  - [Next.js](https://nextjs.org) - The React Framework
- Lang
  - [TypeScript](https://www.typescriptlang.org) - Javascript that scales
- Linters
  - [ESLint](https://eslint.org/) - A fully pluggable tool for identifying and reporting on patterns in JavaScript
- Tests
  - [Jest](https://jestjs.io/) - Delightful JavaScript Testing
  - [Enzyme](https://airbnb.io/enzyme/) - JavaScript Testing utilities for React
  - [@material-ui/core/test-utils](https://material-ui.com/guides/testing/)
  - [@nestjs/testing](https://docs.nestjs.com/fundamentals/testing) - unit testing, e2e testing
  - [Supertest](https://github.com/visionmedia/supertest) - for e2e testing
- Server
  - [nest](https://nestjs.com) - A progressive Node.js framework for building efficient, reliable and scalable server-side applications
    - internally using [Express](https://expressjs.com) - Fast, unopinionated, minimalist web framework for Node.js
    - [Nest.JS WebSockets](https://github.com/nestjs/nest/tree/master/packages/platform-ws)
  - [Next.js](https://nextjs.org) - The React Framework
- Environment variables
  - [dotenv](https://github.com/motdotla/dotenv) - Loads environment variables from .env for nodejs projects
  - [dotenv-webpack](https://github.com/mrsteele/dotenv-webpack) - A secure webpack plugin that supports dotenv and other environment variables and only exposes what you choose and use.
- Database
  - [PostgreSQL](https://www.postgresql.org) - The World's Most Advanced Open Source Relational Database
  - [GraphQL](https://github.com/graphql/express-graphql) - Create a GraphQL HTTP server with Express.
- User authentication
  - [LDAP] - Custom NestJS LDAPService, internally using [ldapjs](http://ldapjs.org/)
  - [Passport](http://www.passportjs.org) - Simple, unobtrusive authentication for Node.js
  - [Passport JWT](https://github.com/mikenicholson/passport-jwt) - Passport authentication using JSON Web Tokens
- UI framework
  - [Next.js](https://nextjs.org) - The React Framework
  - [React](https://reactjs.org) - A JavaScript library for building user interfaces
  - [Apollo GraphQL](https://www.apollographql.com/client/) - A fully-featured, production ready caching GraphQL client for every UI framework and GraphQL server
  - [Material UI](https://material-ui.com) - React components that implement Google's Material Design.
- WebSockets
  - subscription

## Setup

### Database Setup

Portal uses [PostgreSQL](https://www.postgresql.org).

#### For Mac Users

```bash
# install postgresql
$ brew install postgresql

# if you want to start postgresql in startup, try do this
$ brew services start postgresql

# [MUST] create user "portal"
$ createuser -P -l portal

# [MUST] create database "portal" owened by "portal"
$ createdb portal -O portaldb
```

#### For Windows Users

##### Python

Because Portal uses [node.bcrypt.js](https://github.com/kelektiv/node.bcrypt.js), we need a Python:

- Download an installer at <https://www.python.org/downloads/windows>
- Install with "Add Python 3.X to PATH" checked

##### [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools)

- Run `npm install --global --production windows-build-tools` from an elevated PowerShell or CMD.exe **as Administrator**

##### PostgreSQL

- Download an installer at <https://www.postgresql.org/download/windows>
- Run the installer with a flag `--install_runtimes 0` like this:

```cmd
> postgresql-11.2-1-windows-x64.exe --install_runtimes 0
```

##### pgAdmin

- Download a latest installer at <https://www.pgadmin.org/download>
- Run the pgAdmin and login with a root user
- Right click `Login/Group Roles` and `Create > Login/Group Role`
  - `General` Panel:
    - `Name`: `portal`
  - `Definition` Panel:
    - `Password`: `portalpwd`
- Right click `Databases` and `Create > Database`
  - `General` Tab:
    - `Database`: `portaldb`
    - `Owner`: `portal`

### Application Setup

```bash
# prepare `.env` and edit it for your own environments
$ cp .env.example .env

# install dependencies
$ yarn

# development mode
$ yarn dev

# production mode
$ yarn build
$ yarn start
```

The `.env` file is like this:

```bash
# App
HOST=0.0.0.0
PORT=4000
PORT_DEBUGGER=9229

# DB
DATABASE_CONNECTION="postgres"
DATABASE_HOST="localhost"
DATABASE_PORT="5432"
DATABASE_USERNAME="portal"
DATABASE_PASSWORD="portalpwd"
DATABASE_DATABASE="portaldb"
DATABASE_SCHEMA="public"
DATABASE_SYNCHRONIZE="false"
DATABASE_DROP_SCHEMA="false"
DATABASE_MIGRATIONS_RUN="true"
DATABASE_LOGGING="true"
DATABASE_CACHE="true"
DATABASE_REDIS_CACHE_DB="0"

# HTTP Redis
HTTP_REDIS_HOST="localhost"
HTTP_REDIS_PORT="6379"
HTTP_REDIS_DB="0"
HTTP_REDIS_PASSWORD=""
HTTP_REDIS_PREFIX=""
HTTP_REDIS_TTL="300"
HTTP_REDIS_MAX_OBJECTS="10000"

# LDAP
LDAP_URL="ldap://pdc.example.local:389"
LDAP_BIND_DN="CN=Administrator,DC=example,DC=local"
LDAP_BIND_PW="PaSsWoRd123"
LDAP_SEARCH_BASE="DC=example,DC=local"
LDAP_SEARCH_FILTER="(sAMAccountName={{username}})"
LDAP_SEARCH_BASE_ALL_USERS="DC=example,DC=local"
LDAP_SEARCH_FILTER_ALL_USERS="(&(&(|(&(objectClass=user)(objectCategory=person))(&(objectClass=contact)(objectCategory=person)))))"
# LDAP Redis
LDAP_REDIS_HOST="localhost"
LDAP_REDIS_PORT="6379"
LDAP_REDIS_DB="1"
LDAP_REDIS_PASSWORD=""
LDAP_REDIS_TTL="300"
```

## Production Deployment

With production usages, please use [pm2](https://github.com/Unitech/pm2) for Node.js process managements.

```bash
# install pm2
$ npm install --global pm2

# run the app "Portal" with the config `ecosystem.config.js`
$ pm2 start
```

The example `ecosystem.config.js`:

```js
module.exports = {
  apps: [
    {
      name: 'Portal',
      script: '.next/server/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

## Roadmaps

- [x] Support: Mac, Linux and Windows
- [x] Support: production usages
- [x] Security: environment variables both server and client
- [x] Security: production ready session store
- [x] Security: custom auth guards
- [x] Server: integration between [Nest](https://nestjs.com) and [Next.js](https://nextjs.org)
- [x] UI: integration between [Next.js](https://nextjs.org) and [Material UI](https://material-ui.com)
- [x] Authentication with LDAP
- [-] Test: unit tests
- [-] Test: e2e tests
- [ ] [Nest.JS WebSockets](https://github.com/nestjs/nest/tree/master/packages/platform-ws)
- [ ] [Apollo Link WebSockets](https://www.apollographql.com/docs/link/links/ws/)

## Trouble Shootings

### Node.js v10 vs v12

We use Node.js **v12**, so if you use v10, please `rm -f yarn.lock`:

(Because Node.js v10 and v12 are incompatible in terms of no coexistence. APIs are compatible.)

```bash
# remove incompatible dependencies
$ rm -rf node_modules yarn.lock

# use your compatible dependencies
$ yarn
```
