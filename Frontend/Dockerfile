FROM node:22-slim

WORKDIR /app

# Copy dependency definition files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Expose port
EXPOSE 5173

# Start frontend
CMD ["npm", "run", "dev", "--", "--host"]
