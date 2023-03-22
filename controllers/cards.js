const mongoose = require('mongoose');
const Card = require('../models/card');

const {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_OK,
} = require('../utils/constants');

module.exports.getCards = ((req, res) => {
  Card.find({})
    .then((cards) => res.status(HTTP_STATUS_OK).send({ data: cards }))
    .catch((err) => res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка ${err.name} с текстом: ${err.message}.` }));
});

module.exports.createCard = ((req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(HTTP_STATUS_OK).send({ card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки.' });
        return;
      }
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка ${err.name} с текстом: ${err.message}.` });
    });
});

module.exports.deleteCard = ((req, res) => {
  const { cardId } = req.params;
  if (!mongoose.isValidObjectId(cardId)) {
    res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан некорректный id для удаления карточки.' });
  }
  Card.findByIdAndDelete(cardId)
    .orFail(() => res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным id не найдена.' }))
    .then((card) => res.status(200).send({ card }))
    .catch((err) => {
      if (res.headersSent) {
        return;
      }
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка ${err.name} с текстом: ${err.message}.` });
    });
});

module.exports.likeCard = ((req, res) => {
  const { cardId } = req.params;
  const userId = req.user._id;
  if (!mongoose.isValidObjectId(cardId)) {
    res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан некорректный id карточки.' });
  }
  // $addToSet: добавить _id в массив, если его там нет
  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: userId } }, { new: true })
    .orFail(() => res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным id не найдена.' }))
    .then((card) => res.status(HTTP_STATUS_OK).send({ card }))
    .catch((err) => {
      if (res.headersSent) {
        return;
      }
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка ${err.name} с текстом: ${err.message}.` });
    });
});

module.exports.dislikeCard = ((req, res) => {
  const { cardId } = req.params;
  const userId = req.user._id;
  if (!mongoose.isValidObjectId(cardId)) {
    res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан некорректный id карточки.' });
  }
  // $pull: убрать _id из массива
  Card.findByIdAndUpdate(cardId, { $pull: { likes: userId } }, { new: true })
    .orFail(() => res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным id не найдена.' }))
    .then((card) => res.status(HTTP_STATUS_OK).send({ card }))
    .catch((err) => {
      if (res.headersSent) {
        return;
      }
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: `Произошла ошибка ${err.name} с текстом: ${err.message}.` });
    });
});
