FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY next.config.ts tsconfig.json tailwind.config.ts postcss.config.cjs ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 4000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "4000"]
