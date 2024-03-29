FROM docker.io/library/node:19-alpine

RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/docker-entrypoint.sh"]

WORKDIR /app
EXPOSE 3000

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY ["package.json", "package-lock.json*", "./"]
RUN npm ci

COPY conf/env.ini.sample ./conf/env.ini
COPY .docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY . .

USER node
CMD ["node", "index.js"]
