# Usar una imagen base oficial de Node.js
FROM node:18

# Crear un directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que tu aplicación escuchará
EXPOSE 3000

# Comando para ejecutar tu aplicación
CMD ["npm", "start"]
