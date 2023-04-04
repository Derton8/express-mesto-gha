/* eslint-disable no-console */
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const NotFoundError = require('./utils/errors/not-found-err');
const auth = require('./middlewares/auth');
const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const {
  createUser,
  login,
} = require('./controllers/users');

const { PORT = 3000 } = process.env;
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

mongoose
  .connect('mongodb://127.0.0.1:27017/mestodb')
  .then(() => {
    console.log('Соединение с БД установлено!');
  })
  .catch((err) => {
    console.log(err);
  });

app.post('/signin', login);
app.post('/signup', createUser);
app.use(auth);
// роуты, которым авторизация нужна
app.use('/users', userRouter);
app.use('/cards', cardRouter);

// обработка ошибок
app.use('/', (req, res, next) => {
  next(new NotFoundError('Error: 404 Not Found'));
});
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(err.statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка.'
        : message,
    });
  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
