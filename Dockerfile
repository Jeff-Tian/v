FROM node:12
RUN mkdir -p /home/server
WORKDIR /home/server
COPY . /home/server

RUN npm i \
    cd client \
    npm i

EXPOSE 3000
CMD npm start