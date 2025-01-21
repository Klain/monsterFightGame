//src\routes\auth.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const router = express.Router();

// Registro de usuarios
router.post('/register', [
  body('username').isString().isLength({ min: 3 }),
  body('password').isString().isLength({ min: 6 }),
],
(req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    function (err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          res.status(400).json({ error: 'El nombre de usuario ya existe' });
        } else {
          res.status(500).json({ error: err.message });
        }
      } else {
        res.status(201).json({ id: this.lastID, username });
      }
    }
  );
});

// Inicio de sesión
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!user || !bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ error: 'Credenciales inválidas' });
    } else {
      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      res.json({ token });
    }
  });
});

module.exports = router;
