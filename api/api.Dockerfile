FROM node:12-alpine

RUN mkdir -p /home/node/api/node_modules && chown -R node:node /home/node/api

WORKDIR /home/node/api

COPY ./package*.json ./

COPY ./wait-for.sh /

RUN chmod a+x /wait-for.sh

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080 9292

CMD [ "npm", "start" ]
