const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan')
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const authRouter = require('./routes/authRoutes');
const accountRouter = require('./routes/accountRoutes');
const transactionRouter = require('./routes/transactionRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// for deployed on Render
app.set('trust proxy', 1);

// parse json body and limit to 10kb to prevent DOS attacks
app.use(express.json({ limit: '10kb' }));

// security headers
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  })
);

// routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.use('/api/accounts', accountRouter);
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionRouter);

// error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;