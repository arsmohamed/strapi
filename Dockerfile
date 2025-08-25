# Use Node.js LTS
FROM strapi:alpine

RUN apk add --no-cache --virtual .gyp python3 make g++ \
  && npm install sharp \
  && apk del .gyp
# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all Strapi code
COPY . .

# Build Strapi (optional if you only run in dev mode)
RUN npm run build

# Expose port
EXPOSE 1337

# Start Strapi
CMD ["npm", "run", "develop"]