FROM node:10-alpine

COPY ./src /opt/config
COPY ./src /opt/src
COPY ./tests /opt/tests
COPY ./tsconfig.json /opt/tsconfig.json
COPY ./package.json /opt/package.json
COPY ./package-lock.json /opt/package-lock.json
RUN cd /opt && npm install

CMD [ "npm", "run", "start" ]
WORKDIR /opt
