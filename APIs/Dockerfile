FROM node:14
RUN npm install -g sequelize-cli
WORKDIR /app
COPY package.json  .
RUN npm i 
COPY . .

# CMD ["npm","run","serve"]
