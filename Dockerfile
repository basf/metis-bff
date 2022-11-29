FROM docker.io/library/node:18-alpine

RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/docker-entrypoint.sh"]

WORKDIR /app
EXPOSE 3000

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY ["package.json", "package-lock.json*", "./"]
RUN npm ci

COPY env.ini.sample ./env.ini
COPY . .

USER node
CMD ["node", "index.js"]
