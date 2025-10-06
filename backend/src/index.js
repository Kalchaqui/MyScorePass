const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const documentRoutes = require('./routes/documents');
const verificationRoutes = require('./routes/verification');
const usersRoutes = require('./routes/users');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (para ver las imágenes de DNI)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'DeFiCred Backend is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 DeFiCred Backend running on port ${PORT}`);
});

module.exports = app;


