FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy source
COPY . .

# Build
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
