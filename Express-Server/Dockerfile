FROM node:22-slim

WORKDIR /app

# Copy all files for monorepo setup
COPY . .

# Install dependencies (ignoring local lockfile to force native bindings fetch)
RUN rm -f package-lock.json && npm install

# Expose port
EXPOSE 8000

# Start server
CMD ["npm", "run", "dev", "--workspace=ai-image-pipeline"]
