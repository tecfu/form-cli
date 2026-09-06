FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN npm install -g .

WORKDIR /work
ENTRYPOINT ["form-cli"]
