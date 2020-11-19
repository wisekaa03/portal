# Portal

[Nest.js](https://nestjs.com), [TypeORM](https://typeorm.io), [GraphQL](https://graphql.org/), [LDAP Service](https://github.com/wisekaa03/nestjs-ldap), [Passport](http://www.passportjs.org/), [Next.js (v9)](https://nextjs.org), [React.js](https://reactjs.org/), [Material UI (v4)](https://material-ui.com)

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
- [x] [WebSockets](https://www.apollographql.com/docs/link/links/ws/)

## Technologies

- Hot reloading for the developer experience
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
- Database
  - [PostgreSQL](https://www.postgresql.org) - The World's Most Advanced Open Source Relational Database
  - [TypeORM](https://typeorm.io/) - TypeORM is an ORM that can run in NodeJS, Browser, Cordova, PhoneGap, Ionic, React Native, NativeScript, Expo, and Electron platforms and can be used with TypeScript and JavaScript (ES5, ES6, ES7, ES8)
  - [GraphQL](https://github.com/graphql/express-graphql) - Create a GraphQL HTTP server with Express
- User authentication
  - [LDAP](https://github.com/wisekaa03/nestjs-ldap) - NestJS LDAP Service, internally using [ldapjs](http://ldapjs.org/)
  - [Passport](http://www.passportjs.org) - Simple, unobtrusive authentication for Node.js
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

#### For Windows Users

1. Install PostgreSQL 10 to your system.
2. Add the bin directory of your postgresql installation to your PATH system environment variable. Warning! It must be system env, not user env!
3. Make sure you have the latest npm installed.
4. Start a new elevated shell (cmd.exe or powershell). E.g. "run as administrator". If you did not restart your system after step 2, then make sure that you can run the "pg_config" program from that shell.
run the commands below, in this order, in the same terminal. do not close and reopen the terminal between two commands!

```bash
npm install --global --production windows-build-tools
npm install -g node-gyp
npm install -g pg-native
```

Please note that installing node-gyp requires admin rights, so you must install it globally as admin, even if you only need it for one project. (I might be wrong, but this was my experience.)

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

#### PostgreSQL

- Download an installer at <https://www.postgresql.org/download/windows>
- Run the installer with a flag `--install_runtimes 0` like this:

```cmd
> postgresql-11.2-1-windows-x64.exe --install_runtimes 0
```

#### pgAdmin

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
PORT=4000
DOMAIN="example.com"
DEVELOPMENT="true"

# Logging
LOG_LEVEL="debug"
LOG_SERVER="gelf://graylog-udp.monitoring:12201?facility=local0&bufferSize=1400&deflate=optimal"

# DB
DATABASE_URI="postgres://postgres:1234567890@postgresql.database:5432/postgres"
DATABASE_URI_RD="postgres://postgres:1234567890@postgresql-read.database:5432/postgres"
DATABASE_SCHEMA="public"
DATABASE_SYNCHRONIZE="false"
DATABASE_DROP_SCHEMA="false"
DATABASE_MIGRATIONS_RUN="true"
DATABASE_LOGGING=["error"]
DATABASE_REDIS_URI="redis://redis-master.production.svc.cluster.local:6379/0"
# time in milliseconds, 3000 ms = 3 seconds
DATABASE_REDIS_TTL="3000"

# HTTP Redis
HTTP_REDIS_URI="redis://localhost:6379/1"
# time in milliseconds, 600000 ms = 1000 * 60 * 10 minutes
HTTP_REDIS_TTL="300"
HTTP_REDIS_MAX_OBJECTS="10000"

# Session Redis
SESSION_REDIS_URI="redis://redis-master.production.svc.cluster.local:6379/2"
# time in milliseconds, 1200000 ms = 1000 * 60 * 20 minutes
SESSION_COOKIE_TTL="1200000"
SESSION_SECRET="supersecret"

# LDAP
LDAP={"example.com": {"url":"ldaps://pdc.example.local:389", "bindDn":"CN=Administrator,DC=example,DC=local", "bindPw":"PaSsWoRd123", "searchBase":"DC=example,DC=local", "searchUser":, "searchGroup":"(&(objectClass=group)(member={{dn}}))", "searchAllUsers":"(&(&(|(&(objectClass=user)(objectCategory=person))(&(objectClass=contact)(objectCategory=person)))))", "searchAllGroups":"objectClass=group", "newBase":"OU=User,DC=example,DC=local"}}

# LDAP Redis
LDAP_REDIS_URI="redis://localhost:6379/3"
# time in milliseconds, 600000 ms = 1000 * 60 * 10 minutes
LDAP_REDIS_TTL="300"

# MICROSERVICE
MICROSERVICE_URL="redis://localhost:6379"

# SOAP
TICKETS_URL="https://server1c"
TICKETS_REDIS_URI="redis://localhost:6379/5"
TICKETS_REDIS_TTL="60"
REPORTS_URL="https://server1c"
REPORTS_REDIS_URI="redis://localhost:6379/6"
REPORTS_REDIS_TTL="60"
DOCFLOW_URL="https://server1c"
DOCFLOW_REDIS_URI="redis://localhost:6379/7"
DOCFLOW_REDIS_TTL="60"

# OSTICKET
OSTICKET_URL={"auditors": "https://auditors-ticket.example.com/au/portal/ajax.php", "media": "https://media-ticket.example.com/mp/portal/ajax.php"}

# NEXTCLOUD
NEXTCLOUD_URL="https://cloud.example.com"
NEXTCLOUD_REDIS_URI="redis://localhost:6379/4"
NEXTCLOUD_REDIS_TTL="60"

# NEWS
NEWS_URL="https://news/wp/wp-json/wp/v2/posts"
NEWS_API_URL="https://news/wp/wp-content/"

# MAIL
MAIL_URL="https://portal/roundcube"
MAIL_LOGIN_URL="/roundcube/login/index.php"

# MEETING
MEETING_URL="https://meeting/"
```

## Production Deployment

We use Kubernetes/Docker production.

## Roadmaps

- [x] Support: Mac, Linux and Windows
- [x] Support: production usages
- [x] Security: environment variables both server and client
- [x] Security: production ready session store
- [x] Security: custom auth guards
- [x] Server: integration between [Nest](https://nestjs.com) and [Next.js](https://nextjs.org)
- [x] UI: integration between [Next.js](https://nextjs.org) and [Material UI](https://material-ui.com)
- [x] Authentication with LDAP
- [x] Test: unit tests
- [-] Test: e2e tests
- [x] [Nest.JS WebSockets](https://github.com/nestjs/nest/tree/master/packages/platform-ws)
- [x] [Apollo Link WebSockets](https://www.apollographql.com/docs/link/links/ws/)
