FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Add this line to copy the pythonfile directory
COPY pythonfile /usr/src/app/pythonfile

EXPOSE 3000
CMD [ "node", "app.js" ]
