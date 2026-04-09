FROM node:20-alpine

WORKDIR /app

# Instala dependencias primero para aprovechar cache de capas.
COPY package*.json ./
RUN npm install --omit=dev

# Copia el resto del proyecto.
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
