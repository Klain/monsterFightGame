  Monster Game API - Documentación body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; } h1, h2, h3 { color: #333; } pre { background: #f4f4f4; padding: 10px; border-radius: 5px; } code { font-weight: bold; color: #d63384; }

📜 Monster Game API - Documentación
===================================

Bienvenido a la API de Monster Game, un juego de combate basado en turnos donde los jugadores pueden crear personajes, luchar en batallas y mejorar sus atributos.

🚀 Instalación y Configuración
------------------------------

Sigue estos pasos para instalar y ejecutar el proyecto en tu entorno local.

### 1️⃣ Clonar el repositorio

    git clone https://github.com/tu-repositorio/monster-game.git

### 2️⃣ Instalar dependencias

    cd backend
    npm install

### 3️⃣ Configurar variables de entorno

Crea un archivo `.env` en el directorio `backend` con el siguiente contenido:

    
    JWT_SECRET=tu_secreto_jwt
    DATABASE_URL=postgres://usuario:contraseña@localhost:5432/monster_game
        

### 4️⃣ Ejecutar el servidor

    npm start

El servidor correrá en `http://localhost:3000`

📌 Endpoints Principales
------------------------

### 🛡️ Autenticación

*   `POST /api/auth/register` - Registrar un nuevo usuario
*   `POST /api/auth/login` - Iniciar sesión y obtener un token JWT

### 🎭 Gestión de Personajes

*   `POST /api/characters` - Crear un personaje
*   `GET /api/characters` - Obtener información del personaje
*   `POST /api/characters/add-xp` - Añadir experiencia
*   `POST /api/characters/upgrade-attribute` - Mejorar atributos
*   `GET /api/characters/leaderboard` - Ver ranking de jugadores

### ⚔️ Combate

*   `POST /api/combat/battle` - Iniciar un combate entre dos personajes
*   `GET /api/combat/find-opponent` - Buscar oponente aleatorio

🔑 Autenticación con JWT
------------------------

Todos los endpoints protegidos requieren un token JWT en el header `Authorization`:

    Authorization: Bearer tu_token_aqui

📜 Documentación Swagger
------------------------

Puedes consultar la documentación completa de la API en [Swagger UI](http://localhost:3000/api-docs).

📧 Contacto
-----------

Si tienes dudas o sugerencias, puedes contactarme en [contacto@monstergame.com](mailto:contacto@monstergame.com).

**¡Gracias por usar Monster Game API! 🚀**