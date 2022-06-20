# Build context should be monorepo root

FROM --platform=linux/amd64 node:18
WORKDIR app

ARG FEED_ID
ARG PAT
ENV FEED_ID=${FEED_ID}
ENV PAT=${PAT}

COPY common/deploy ./
EXPOSE 8080
ENTRYPOINT ["node", "server/rest"]
