v
---

> v

## Install

Use node 16.10.0:

```
npm install  --registry=https://registry.npm.taobao.org
cd client
npm install  --registry=https://registry.npm.taobao.org

cd ..

npm start
```

## Run in local

### Start directly in local mode

```shell
NODE_ENV=local yarn start
```

### Start using docker mode (to simulate the production environment)

```shell
docker build -t jefftian/vvv .
docker run -d -p 127.0.0.1:3000:3000 --name vvv jefftian/vvv
```