FROM node:16
RUN mkdir -p /home/server
WORKDIR /home/server
COPY . /home/server

RUN npm i --force \
    cd client \
    npm i --force \
    npm run build

EXPOSE 3000
CMD PORT=3000 NODE_ENV=production npm run server