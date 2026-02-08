FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json tsconfig.base.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/backend/package.json apps/backend/package.json

RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=production
EXPOSE 4000 6000

CMD ["sh", "-c", "npx concurrently -n frontend,backend -c cyan,magenta \"node_modules/.bin/next start -p 4000\" \"node apps/backend/dist/index.js\""]
