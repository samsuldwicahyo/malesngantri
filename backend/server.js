require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const notificationJob = require('./src/jobs/notification.job');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
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
server.listen(PORT, () => {
    notificationJob.start();
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
