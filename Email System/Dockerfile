FROM node:22-alpine

WORKDIR /app

# Copy all files for monorepo setup
COPY . .

# Install dependencies across all workspaces
RUN npm install

# Start notification service
CMD ["npm", "run", "dev", "--workspace=notification"]
