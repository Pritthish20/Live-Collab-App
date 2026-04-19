FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json

RUN npm install

COPY server server

RUN npm run prisma:generate -w server

RUN npm run build -w server

EXPOSE 4000 1234

CMD ["npm", "run", "start", "-w", "server"]
