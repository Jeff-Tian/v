npm run build
docker build -t jefftian/v .
docker images
docker run --rm --network host -e CI=true -d -p 127.0.0.1:3000:3000 --name vvv jefftian/v
docker ps | grep -q v
docker ps -aqf "name=vvv$"
docker push jefftian/v
docker logs $(docker ps -aqf name=vvv$)
curl localhost:3000 || docker logs $(docker ps -aqf name=vvv$)
docker kill vvv || echo "vvv killed"
docker rm vvv || echo "vvv removed"