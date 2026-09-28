FROM node:22-bookworm-slim

WORKDIR /app

# Inclui as dependências de desenvolvimento: Expo CLI, TypeScript e ngrok.
COPY package.json package-lock.json ./
RUN npm ci --include=dev && npm cache clean --force

COPY . .
RUN chown -R node:node /app

USER node

EXPOSE 8081

CMD ["npx", "expo", "start", "--tunnel"]
