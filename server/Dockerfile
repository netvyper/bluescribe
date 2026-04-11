FROM node:alpine

RUN apk add --no-cache git

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Optional, ensures correct node environment
ENV NODE_ENV=production

VOLUME /app/data

EXPOSE 3001

CMD ["node", "index.js"]