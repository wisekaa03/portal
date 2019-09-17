# Stage 0
# =======
FROM node:latest

WORKDIR /app

COPY package*.json yarn.lock ./
RUN yarn
RUN yarn jwt:cert

COPY . ./
RUN yarn build

EXPOSE 4000

CMD ["yarn", "start"]
