FROM node:12

WORKDIR /app

COPY . ./

# TODO: when production, turn off comments
# RUN yarn
# RUN yarn jwt:cert
# RUN yarn build

EXPOSE 4000

CMD ["yarn", "start"]
