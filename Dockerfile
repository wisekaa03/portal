# Stage 0
# =======
FROM node:12

WORKDIR /app

COPY package*.json yarn.lock jwt.private.pem jwt.public.pem ./
RUN yarn
RUN yarn jwt:cert

COPY . ./
RUN yarn build

EXPOSE 4000

CMD ["yarn", "start"]
