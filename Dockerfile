# ---- Build ----
FROM node:20-alpine AS builder
WORKDIR /

# pnpm 활성화
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 빌드
COPY . .
RUN pnpm prisma generate
RUN pnpm build:docker

# 실행 환경 의존성만 남기기
RUN pnpm prune --prod

# ---- Run ----
FROM node:20-alpine
WORKDIR /
ENV NODE_ENV=production \
    PORT=8080

# 런타임에 필요한 것만 복사
COPY --from=builder /node_modules ./node_modules
COPY --from=builder /dist ./dist
COPY package.json ./

EXPOSE 8080
CMD ["node", "dist/main.js"]