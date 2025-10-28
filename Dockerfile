FROM node:20.18-alpine

WORKDIR /app
COPY . .
RUN npm install -g pnpm@10.10.0
RUN pnpm install

EXPOSE 5200
ENTRYPOINT ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5200"]
