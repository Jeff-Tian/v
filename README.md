v
---

> v

## Install

Use node 16.10.0:

```
yarn
cd client
yarn

cd ..

NODE_ENV=local yarn start
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