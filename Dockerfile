FROM node:22-alpine

RUN apk add --no-cache git
RUN npm install -g form-cli

WORKDIR /home
