require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');

const { logger } = require('../src/middlewares/logger');
const PORT = process.env.SERVER_PORT;
const router = require('../src/routes/router');
const userRouter = require('../src/routes/user.router');
const authRouter = require('../src/routes/auth.router');
const productRouter = require('../src/routes/product.router');
const transactionRouter = require('../src/routes/transaction.router');
const { errorRoute, globalError } = require('../src/middlewares/errorHandler');
const { limiter } = require('../src/middlewares/rateLimit');

const app = express();

//middlewares
app.use(limiter)
app.use(express.static('upload'));
app.use(compression());
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

//routing
app.use('/', router);
app.use('/user', userRouter);
app.use('/auth', authRouter);
app.get('/data', (req, res, next) => {
  //controller
  res.json({ message: 'ini data' });
});
app.use('/product', productRouter);
app.use('/transaction', transactionRouter);
app.get('/*splat', errorRoute);
app.use(globalError);

app.listen(PORT, () => {
  console.log('Server Running on port: ', PORT);
});
