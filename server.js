const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

// Configuración de conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'aSdF_010503',  // ← PON AQUÍ TU CONTRASEÑA DE MYSQL
  database: 'cotizaciones_db' // ← Este es el nombre correcto de tu base de datos
});

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static('.'));

// Ruta para obtener los ítems
app.get('/api/get_items', (req, res) => {
  // Cambié la consulta para usar los nombres reales de tus columnas
  const query = 'SELECT itm_id, itm_descripcion, itm_precio FROM items ORDER BY itm_descripcion ASC';

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});