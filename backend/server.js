require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const prisma = require('./src/config/database');
const notificationJob = require('./src/jobs/notification.job');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const DEFAULT_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
];

const ENV_ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .filter((origin) => origin !== '*');

const ALLOWED_ORIGINS = Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...ENV_ALLOWED_ORIGINS]));

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin(origin, callback) {
            if (!origin || ALLOWED_ORIGINS.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error(`CORS origin not allowed: ${origin}`));
        },
        methods: ["GET", "POST"]
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Attach io to app and global to use in services/controllers
app.set('io', io);
global.io = io;

// Start Server
server.listen(PORT, async () => {
    notificationJob.start();

    try {
        await prisma.checkConnection();
    } catch (error) {
        const isDbUnavailable =
            typeof prisma.isDbUnavailableError === 'function' && prisma.isDbUnavailableError(error);

        if (isDbUnavailable) {
            console.warn('[Startup] Database unavailable. API will return 503 until DB is up.');
        } else {
            console.error('[Startup] Database check failed:', error);
        }
    }

    console.log(`
  🚀 Server ready at: http://localhost:${PORT}
  🌍 Environment: ${process.env.NODE_ENV}
  `);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err);
    server.close(() => {
        process.exit(1);
    });
});
