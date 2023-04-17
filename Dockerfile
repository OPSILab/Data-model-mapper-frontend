FROM node:16-alpine
WORKDIR /app
COPY ./dataModels ./dataModels 
COPY ./docs ./docs
COPY ./src ./src
COPY ./config.template.js ./config.template.js 
COPY ./config.template.js ./config.js 
COPY ./mapper.js ./mapper.js
COPY ./LICENSE ./LICENSE 
COPY ./package*.json ./package*.json
COPY README.md README.md
RUN npm install
CMD ["node", "mapper"]