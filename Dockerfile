FROM node:12

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./
COPY jwt.private.pem ./
COPY jwt.public.pem ./

# TODO: when production, turn off comments
# RUN yarn
# RUN yarn jwt:cert

COPY . ./

RUN yarn build

EXPOSE 4000

CMD ["yarn", "start"]
