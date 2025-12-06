const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const exchangesRoutes = require('./routes/exchanges');
const subscriptionsRoutes = require('./routes/subscriptions');
const mockUsersRoutes = require('./routes/mockUsers');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exchanges', exchangesRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/mockUsers', mockUsersRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'MyScorePass Backend is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 MyScorePass Backend running on port ${PORT}`);
});

module.exports = app;


