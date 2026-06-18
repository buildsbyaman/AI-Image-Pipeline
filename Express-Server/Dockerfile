FROM node:22-slim

WORKDIR /app

# Copy all files for monorepo setup
COPY . .

# Install dependencies across all workspaces
RUN npm install

# Expose port
EXPOSE 8000

# Start server
CMD ["npm", "run", "dev", "--workspace=ai-image-pipeline"]
