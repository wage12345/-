const express = require('express');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const pool = require('./config/db');
const { ensureSchema } = require('./config/schemaSync');
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const studentRoutes = require('./routes/studentRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false
  })
);

app.get('/health', (req, res) => {
  res.status(200).send('ok');
});

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS result');
    res.json({
      message: 'Database connected successfully',
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      message: 'Database connection failed',
      error: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.use(authRoutes);
app.use(studentRoutes);
app.use(classRoutes);

if (require.main === module) {
  ensureSchema()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Failed to prepare database schema:', error.message);
      process.exit(1);
    });
}

module.exports = app;
