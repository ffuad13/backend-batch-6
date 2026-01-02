require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {logger} = require('./middlewares/logger')

const PORT = process.env.SERVER_PORT;
const router = require('./routes/router');
const userRouter = require('./routes/user.router');
const authRouter = require('./routes/auth.router');
const { errorRoute, globalError } = require('./middlewares/errorHandler');

const app = express();

//middlewares
app.use(logger)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

//routing
app.use('/', router);
app.use('/user', userRouter);
app.use('/auth', authRouter)
app.get('/data', (req, res, next) => { //controller
  res.json({ message: 'ini data' });
});
app.get('/*splat', errorRoute)
app.use(globalError)

app.listen(PORT, () => {
  console.log('Server Running on port: ', PORT);
});
