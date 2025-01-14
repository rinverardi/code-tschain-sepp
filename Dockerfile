FROM node:23

WORKDIR /home/node/src

COPY *.json /home/node/src/
COPY *.lock /home/node/src/

RUN yarn install

COPY *.toml /home/node/src/
COPY *.ts /home/node/src/

COPY app/ /home/node/src/app/
COPY components/ /home/node/src/components/
COPY public/ /home/node/src/public/
COPY target/idl/ /home/node/src/target/idl/
COPY target/types/ /home/node/src/target/types/

RUN yarn next build

RUN chown -R node:node /home/node/src

USER node

CMD yarn next start
