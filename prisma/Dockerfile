FROM node:18-alpine

# Install OpenSSL and other required packages
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["tail", "-f", "/dev/null"]