FROM node:16-alpine
WORKDIR /app
COPY ./dataModels ./dataModels
COPY ./docs ./docs
COPY ./src ./src
COPY ./config*.js ./
COPY ./mapper.js ./
COPY ./LICENSE ./
COPY ./package*.json ./
COPY ./README.md ./
RUN npm install
CMD ["node", "mapper"]