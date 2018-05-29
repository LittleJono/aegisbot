FROM node:8

WORKDIR /aegisbot

COPY . /aegisbot

RUN npm install

RUN chmod 775 -R /aegisbot

CMD [ "node", "./app.js" ]