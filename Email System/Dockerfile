FROM node:22-slim

WORKDIR /app

# Copy dependency definition files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Start notification service
CMD ["npm", "run", "dev"]
