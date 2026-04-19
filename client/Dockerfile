FROM node:22-alpine

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ARG NEXT_PUBLIC_COLLAB_URL=ws://localhost:1234

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_COLLAB_URL=${NEXT_PUBLIC_COLLAB_URL}
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json

RUN npm install

COPY client client

RUN npm run build -w client

EXPOSE 3000

CMD ["npm", "run", "start:docker", "-w", "client"]
