require('dotenv').config();
const express = require('express');
const cors = require('cors');

const PORT = process.env.SERVER_PORT
const router = require('./routes/router');
const userRouter = require('./routes/user.router')

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({ origin: true, credentials: true }));

app.use('/', router);
app.use('/user', userRouter)

app.listen(PORT, () => {console.log('Server Running on port: ', PORT)});
