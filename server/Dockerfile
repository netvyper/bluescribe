FROM node:18-alpine

RUN apk add --no-cache git

WORKDIR /app

# Ensure we run as non-root user for security
RUN mkdir -p /app/data && chown -R node:node /app

USER node

COPY package*.json ./
RUN npm ci --only=production

COPY --chown=node:node . .

# Optional, ensures correct node environment
ENV NODE_ENV=production

VOLUME /app/data

EXPOSE 3001

CMD ["node", "index.js"]