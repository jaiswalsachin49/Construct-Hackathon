const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const { authLimiter, apiLimiter } = require('./middlewares/rateLimiter');
const cron = require('node-cron');
const Wave = require('./models/Wave');
const { initializeBadges } = require('./controllers/badgeController');

dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize badges after DB connection
setTimeout(() => {
  initializeBadges();
}, 2000);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: process.env.FRONTEND_URL, credentials: true }
});

// Middleware
app.use(cors(
  { origin: process.env.FRONTEND_URL, credentials: true }
));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// // Rate limiting
// app.use('/api/auth/login', authLimiter);
// app.use('/api/auth/register', authLimiter);
// app.use('/api/', apiLimiter);

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/communities', require('./routes/communities'));
app.use('/api/waves', require('./routes/waves'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/badges', require('./routes/badges'));

// Socket.IO
require('./config/socket')(io);

// Cron job to delete expired waves (runs every hour)
cron.schedule('0 * * * *', async () => {
  try {
    const result = await Wave.deleteMany({ expiresAt: { $lt: new Date() } });
    console.log(`Expired waves deleted: ${result.deletedCount}`);
  } catch (error) {
    console.error('Cron error:', error);
  }
});

console.log('Cron job scheduled: Expired waves cleanup every hour');

// Error handling
app.use(require('./middlewares/errorHandler'));

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));