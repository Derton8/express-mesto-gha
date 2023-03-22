const mongoose = require('mongoose');
const User = require('../models/user');

const {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_OK,
} = require('../utils/constants');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(HTTP_STATUS_OK).send({ data: users }))
    .catch((err) => res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка ${err.name} с текстом: ${err.message}.` }));
};

module.exports.getUserById = (req, res) => {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId)) {
    res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан некорректный id для создания пользователя.' });
  }
  User.findById(userId)
    .orFail(() => res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь с указанным id не найден.' }))
    .then((user) => {
      res.status(HTTP_STATUS_OK).send({ data: user });
    })
    .catch((err) => {
      if (res.headersSent) {
        return;
      }
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка ${err.name} с текстом: ${err.message}.` });
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.status(HTTP_STATUS_OK).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя.' });
        return;
      }
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка ${err.name} с текстом: ${err.message}.` });
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  if (!mongoose.isValidObjectId(userId)) {
    res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан некорректный id для обновлении пользователя.' });
  }
  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .orFail(() => res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь с указанным id не найден.' }))
    .then((user) => res.status(HTTP_STATUS_OK).send({ data: user }))
    .catch((err) => {
      if (res.headersSent) {
        return;
      }
      if (err.name === 'ValidationError') {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении пользователя.' });
        return;
      }
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка ${err.name} с текстом: ${err.message}.` });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;
  if (!mongoose.isValidObjectId(userId)) {
    res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан некорректный id пользователя для обновлении аватара.' });
  }
  User.findByIdAndUpdate(userId, { avatar }, { new: true })
    .then((user) => res.status(HTTP_STATUS_OK).send({ data: user }))
    .catch((err) => {
      if (res.headersSent) {
        return;
      }
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка ${err.name} с текстом: ${err.message}.` });
    });
};
