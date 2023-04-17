FROM node:16-alpine
WORKDIR /app
COPY ./dataModels ./
COPY ./docs ./
COPY ./src ./src
COPY ./config.template.js ./
COPY ./mapper.js ./
COPY ./LICENSE ./
COPY ./package*.json ./
COPY ./README.md ./
RUN npm install
CMD ["node", "mapper"]