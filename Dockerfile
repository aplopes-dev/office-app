# Base para ambiente de execução
FROM node:22.11.0-alpine3.20
RUN apk add --no-cache tzdata
ENV TZ=America/Sao_Paulo

WORKDIR /app
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

# Copia arquivos de dependências
COPY . ./

EXPOSE 3000
RUN npx prisma generate
CMD ["yarn", "start"]