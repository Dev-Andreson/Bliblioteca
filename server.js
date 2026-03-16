const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3000;
const dbFile = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Erro ao abrir banco SQLite:', err);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      course TEXT,
      turn TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/users', (req, res) => {
  db.all('SELECT id, name, email, course, turn, created_at FROM users ORDER BY id DESC', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro ao consultar usuários.' });
    }
    res.json(rows);
  });
});

app.post('/api/register', async (req, res) => {
  const { name, email, password, course, turn } = req.body;

  if (!name || !email || !password || !course || !turn) {
    return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Senha precisa ter no mínimo 6 caracteres.' });
  }

  try {
    const hashed = bcrypt.hashSync(password, 10);
    db.run(
      'INSERT INTO users (name, email, password, course, turn) VALUES (?, ?, ?, ?, ?)',
      [name, email.toLowerCase(), hashed, course, turn],
      function (err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(409).json({ message: 'E-mail já cadastrado.' });
          }
          console.error(err);
          return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
        }
        res.status(201).json({ id: this.lastID, name, email, course, turn });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

app.delete('/api/users', (req, res) => {
  db.run('DELETE FROM users', (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro ao limpar usuários.' });
    }
    res.json({ message: 'Usuários removidos.' });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  db.get('SELECT id, name, email, password, course, turn FROM users WHERE email = ?', [email.toLowerCase()], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro interno.' });
    }
    if (!row) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }

    const passwordIsValid = bcrypt.compareSync(password, row.password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }

    const user = { id: row.id, name: row.name, email: row.email, course: row.course, turn: row.turn };
    return res.json({ message: 'Login realizado com sucesso.', user });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
