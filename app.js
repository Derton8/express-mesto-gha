/* eslint-disable no-console */
const express = require('express');
const mongoose = require('mongoose');

const { PORT = 3000 } = process.env;
const app = express();

mongoose
  .connect('mongodb://127.0.0.1:27017/mestodb')
  .then((res) => {
    console.log(`Соединение с БД установлено. Ответ: ${res.Model}`);
  });

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Hello, world');
});
