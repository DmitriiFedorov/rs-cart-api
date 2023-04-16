FROM node:14-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install && npm cache clean --force

COPY . .

RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start:prod"]