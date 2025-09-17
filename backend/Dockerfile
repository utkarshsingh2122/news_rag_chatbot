FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm i -g ts-node
EXPOSE 8080
CMD ["npx","ts-node","src/app.ts"]
