# Stage 1: Build the React app
FROM node:18-alpine as build
WORKDIR /app

# Install git for the postinstall script, then copy package.json and install dependencies
RUN apk add --no-cache git
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Run Nginx as a non-root user (nginx user is already created in alpine image)
# Note: nginx requires root to bind to port 80, but we can configure it to use a higher port
# For simplicity, we just stick to what's defined in the problem description (non-root `node` was asked for backend)
# However, for a complete solution we can change it. Let's just modify the backend first.

# Copy built assets
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]