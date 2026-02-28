const { Prisma } = require('@prisma/client');

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error(err);

    let status = err.status || 500;
    let message = err.message || 'Internal Server Error';
    let errors = err.errors || undefined;

    // Handle Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            status = 409;
            message = 'Unique constraint failed on the fields: ' + err.meta.target;
        } else if (err.code === 'P2025') {
            status = 404;
            message = 'Record not found';
        }
    }

    if (err instanceof Prisma.PrismaClientInitializationError) {
        status = 503;
        message = 'Database is unavailable. Start PostgreSQL on localhost:5432 and verify DATABASE_URL (hint: docker compose up -d postgres).';
    }

    // Handle Validation errors (Joi)
    if (err.isJoi) {
        status = 400;
        message = 'Validation Error';
        errors = err.details.map(d => ({ message: d.message, path: d.path }));
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        status = 401;
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        status = 401;
        message = 'Token expired';
    }

    res.status(status).json({
        success: false,
        message,
        errors,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;
