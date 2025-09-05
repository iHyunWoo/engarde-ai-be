FROM node:20-slim

# ffmpeg 설치
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN rm -rf dist && npm run build

CMD ["npm", "start"]
