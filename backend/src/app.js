const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Base Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes Setup
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});

// Root API Route
app.get('/', (req, res) => {
    res.send('💈 MalasNgantri Backend API v1.0');
});

// Mount Feature Routes
app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/users', require('./modules/users/user.routes'));
app.use('/api/v1/barbers', require('./modules/barbers/barber.routes'));
app.use('/api/v1/queues', require('./modules/queues/queue.routes'));
app.use('/api/v1/services', require('./modules/services/service.routes'));
app.use('/api/v1', require('./modules/barbers/barber.routes')); // To support /barbershops/:id/barbers
app.use('/api/v1', require('./modules/services/service.routes')); // To support /barbershops/:id/services

// 404 Error Handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
