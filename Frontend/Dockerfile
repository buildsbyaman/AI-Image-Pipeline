FROM node:22-alpine

WORKDIR /app

# Copy all files for monorepo setup
COPY . .

# Install dependencies across all workspaces
RUN npm install

# Expose port
EXPOSE 5173

# Start frontend
CMD ["npm", "run", "dev", "--workspace=frontend", "--", "--host"]
