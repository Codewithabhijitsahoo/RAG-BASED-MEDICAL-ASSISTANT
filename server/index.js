import express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, 'database.sqlite');

app.use(cors());
app.use(express.json());

// Initialize Database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        userEmail TEXT NOT NULL,
        title TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(sessionId) REFERENCES sessions(id) ON DELETE CASCADE
      )
    `);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'alive' });
});

// Signup
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    
    db.run(sql, [name, email, hashedPassword], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Email already registered' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      const user = { id: this.lastID, name, email };
      res.status(201).json({ user });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.get(sql, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });
});

// --- Chat Routes ---

// Get all sessions for a user
app.get('/api/chat/sessions', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });

  db.all('SELECT * FROM sessions WHERE userEmail = ? ORDER BY createdAt DESC', [email], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ sessions: rows });
  });
});

// Create/Update a session
app.post('/api/chat/sessions', (req, res) => {
  const { id, userEmail, title } = req.body;
  if (!id || !userEmail || !title) return res.status(400).json({ error: 'Missing fields' });

  db.run('INSERT OR REPLACE INTO sessions (id, userEmail, title) VALUES (?, ?, ?)', [id, userEmail, title], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id });
  });
});

// Get messages for a session
app.get('/api/chat/sessions/:id/messages', (req, res) => {
  const { id } = req.params;
  db.all('SELECT * FROM messages WHERE sessionId = ? ORDER BY timestamp ASC', [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ messages: rows });
  });
});

// Save a message
app.post('/api/chat/messages', (req, res) => {
  const { id, sessionId, role, content, timestamp } = req.body;
  if (!id || !sessionId || !role || !content) return res.status(400).json({ error: 'Missing fields' });

  db.run('INSERT INTO messages (id, sessionId, role, content, timestamp) VALUES (?, ?, ?, ?, ?)', 
    [id, sessionId, role, content, timestamp], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id });
  });
});

// Delete a session
app.delete('/api/chat/sessions/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM sessions WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
