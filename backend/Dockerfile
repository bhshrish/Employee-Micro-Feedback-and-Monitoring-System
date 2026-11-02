FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY src ./src
COPY openapi.yaml ./openapi.yaml
USER node
EXPOSE 4000
CMD ["npm", "start"]
