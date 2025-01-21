//src\routes\tasks.js
const express = require('express');
const db = require('../database');
const authenticateToken = require('../middleware/auth');
const router = express.Router();


// Proteger todas las rutas
router.use(authenticateToken);

// Obtener todas las tareas
router.get('/', (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  db.all(
    'SELECT * FROM tasks WHERE user_id = ? LIMIT ? OFFSET ?',
    [userId, limit, offset],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

// Crear una nueva tarea
router.post('/', (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id;

  db.run(
    'INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)',
    [title, description, userId],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});

// Actualizar una tarea
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  db.run(
    'UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?',
    [title, description, completed, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Tarea no encontrada' });
      } else {
        res.json({ updated: this.changes });
      }
    }
  );
});

// Eliminar una tarea
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM tasks WHERE id = ?', id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Tarea no encontrada' });
    } else {
      res.json({ deleted: this.changes });
    }
  });
});

//buscar tarea por titulo
router.get('/search', (req, res) => {
  const userId = req.user.id;
  const { query } = req.query;

  db.all(
    'SELECT * FROM tasks WHERE user_id = ? AND title LIKE ?',
    [userId, `%${query}%`],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

module.exports = router;
