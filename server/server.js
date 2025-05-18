// Load environment variables
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const https = require('https'); // Only need this once

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Connect to MySQL using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false // AlwaysData uses a shared certificate
  }
});

// Verify connection
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL database.');
});

// Endpoint: Get all books
app.get('/api/books', (req, res) => {
  db.query('SELECT * FROM books', (err, results) => {
    if (err) {
      console.error('Error fetching books:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Proxy OpenLibrary cover images
/*
app.get('/cover/:isbn', (req, res) => {
  const { isbn } = req.params;
  const url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

  https.get(url, (imageRes) => {
    if (imageRes.statusCode === 200) {
      res.setHeader('Content-Type', imageRes.headers['content-type'] || 'image/jpeg');
      imageRes.pipe(res);
    } else {
      res.status(imageRes.statusCode).send('Image not found');
    }
  }).on('error', () => {
    res.status(500).send('Proxy error');
  });
});
*/
// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
