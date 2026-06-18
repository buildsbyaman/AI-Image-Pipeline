FROM node:22-slim

WORKDIR /app

# Copy all files for monorepo setup
COPY . .

# Install dependencies (ignoring local lockfile to force native bindings fetch)
RUN rm -f package-lock.json && npm install

# Expose port
EXPOSE 5173

# Start frontend
CMD ["npm", "run", "dev", "--workspace=frontend", "--", "--host"]
