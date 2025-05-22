# Usa un'immagine Node ufficiale
FROM node:18

# Crea e usa la directory di lavoro
WORKDIR /app

# Copia i file del progetto
COPY package*.json ./
RUN npm install

COPY . .

# Espone la porta 3000
EXPOSE 3000

# Avvia il server
CMD ["npm", "start"]
