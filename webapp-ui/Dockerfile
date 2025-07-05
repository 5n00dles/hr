FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npm run build
RUN npm install express

EXPOSE 4173

CMD ["node", "src/ssr-server.js"]
