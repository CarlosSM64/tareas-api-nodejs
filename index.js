const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


app.get('/tareas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tareas ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error en GET /tareas:', error.message);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});


app.get('/tareas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM tareas WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en GET /tareas/:id:', error.message);
    res.status(500).json({ error: 'Error al obtener la tarea' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));


app.post('/tareas', async (req, res) => {
  const { titulo, descripcion } = req.body;

  if (!titulo) {
    return res.status(400).json({ error: 'El campo titulo es obligatorio' });
  }

  try {
    await pool.query(
      'INSERT INTO tareas (titulo, descripcion) VALUES ($1, $2)',
      [titulo, descripcion || null]
    );

    const result = await pool.query('SELECT * FROM tareas ORDER BY id ASC');
    res.status(201).json(result.rows);
  } catch (error) {
    console.error('Error en POST /tareas:', error.message);
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
});


app.put('/tareas/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, completada } = req.body;

  try {

    const check = await pool.query('SELECT * FROM tareas WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const updated = await pool.query(
      `UPDATE tareas 
       SET titulo = COALESCE($1, titulo), 
           descripcion = COALESCE($2, descripcion), 
           completada = COALESCE($3, completada) 
       WHERE id = $4 
       RETURNING *`,
      [titulo, descripcion, completada, id]
    );

    res.json(updated.rows[0]);
  } catch (error) {
    console.error('Error en PUT /tareas/:id:', error.message);
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
});


app.delete('/tareas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query('SELECT * FROM tareas WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    await pool.query('DELETE FROM tareas WHERE id = $1', [id]);
    res.json({ mensaje: `Tarea con id=${id} eliminada correctamente` });
  } catch (error) {
    console.error('Error en DELETE /tareas/:id:', error.message);
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
});