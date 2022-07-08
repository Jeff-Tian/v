FROM node:12
RUN mkdir -p /home/server
WORKDIR /home/server
COPY . /home/server

RUN npm i \
    cd client \
    npm i

EXPOSE 16016
CMD NODE_ENV=production npm run server