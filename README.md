
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

### Start using docker mode 

To simulate the production environment deployed to kubernetes.

```shell
docker build -t jefftian/vvv .
docker run -d -p 127.0.0.1:3000:3000 --name vvv jefftian/vvv
```

### Start using vercel mode

To simulate the production environment deployed to vercel.

```shell
V_ADMIN=test V_PWD=test NODE_ENV=local vercel dev
```