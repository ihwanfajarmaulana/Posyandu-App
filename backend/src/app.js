require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sequelize = require('./config/database');
const routes = require('./routes');
const { setupCronJobs } = require('./utils/cronJobs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.use('/api', routes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route tidak ditemukan' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database terhubung');
    await sequelize.sync({ alter: true });
    console.log('✅ Tabel tersync');
    setupCronJobs();
    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Gagal start server:', err);
    process.exit(1);
  }
};

start();