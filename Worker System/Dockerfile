FROM node:22-alpine

WORKDIR /app

# Copy all files for monorepo setup
COPY . .

# Install dependencies across all workspaces
RUN npm install

# Start worker
CMD ["npm", "run", "worker", "--workspace=worker"]
