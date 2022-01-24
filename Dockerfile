FROM node:alpine AS production
WORKDIR /app
COPY ./package.json ./
RUN npm install
COPY . .
RUN npm run build
FROM node:alpine
WORKDIR /app
COPY --from=production /app ./
EXPOSE 80
CMD ["npm", "run", "start:prod"]