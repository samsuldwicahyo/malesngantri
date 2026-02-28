const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

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

const corsOrigin = (origin, callback) => {
    // Allow server-to-server, curl, and same-origin requests with no Origin header.
    if (!origin) {
        return callback(null, true);
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
    }

    return callback(new Error(`CORS origin not allowed: ${origin}`));
};

// Security Middlewares
app.use(helmet());
app.use(cors({
    origin: corsOrigin,
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
app.use(cookieParser());
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
app.use('/api/v1/schedules', require('./modules/schedules/schedule.routes'));
app.use('/api/v1', require('./modules/services/service.routes'));
app.use('/api/v1', require('./modules/barbershops/barbershop.routes'));
app.use('/api/v1', require('./modules/superadmin/superadmin.routes'));
app.use('/api/v1', require('./modules/workers/worker.routes'));

// 404 Error Handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
