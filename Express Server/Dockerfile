FROM node:22-slim

WORKDIR /app

# Copy dependency definition files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Expose port
EXPOSE 8000

# Start server
CMD ["npm", "run", "dev"]
