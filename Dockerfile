FROM node:8.1-alpine

COPY ./src /opt/
RUN cd /opt && npm install

CMD [ "npm", "run", "start" ]
WORKDIR /opt
