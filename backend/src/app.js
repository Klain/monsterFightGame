//backend\src\app.js
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./src/swagger.yaml');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRouter = require('./routes/authRoutes');
const characterRoutes = require('./routes/characterRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

//Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/api/characters', characterRoutes);
app.use('/api/auth', authRouter);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
