#FROM node:12.6-stretch
#
## Install app dependencies
#RUN apt update
#
## RUN apt install git bzip2 openssh-client -y
#RUN apt install bzip2 -y
#
#RUN npm install -g form-cli
#
## Create app directory
##RUN mkdir /home/node/ui
#WORKDIR /home

FROM node:12.0-alpine

RUN apk add git
RUN npm install -g form-cli

# Create app directory
#RUN mkdir /home/node/ui
WORKDIR /home
