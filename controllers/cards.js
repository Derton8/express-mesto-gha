const mongoose = require('mongoose');
const Card = require('../models/card');

const {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_FORBIDDEN,
} = require('../utils/constants');

module.exports.getCards = ((req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка.' }));
});

module.exports.createCard = ((req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки.' });
        return;
      }
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка.' });
    });
});

module.exports.deleteCard = ((req, res) => {
  const { cardId } = req.params;
  const userId = req.user._id;
  if (!mongoose.isValidObjectId(cardId)) {
    res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан некорректный id для удаления карточки.' });
    return;
  }
  Card.findById(cardId)
    .orFail()
    .then(async (card) => {
      if (userId.toString() !== card.owner.toString()) {
        throw new Error('Forbidden');
      } else {
        const cardDelete = await card.deleteOne();
        return res.send({ data: cardDelete });
      }
    })
    .catch((err) => {
      if (err.message === 'Forbidden') {
        res.status(HTTP_STATUS_FORBIDDEN).send({ message: 'Объект принадлежит другому пользователю.' });
        return;
      }
      if (err.name === 'DocumentNotFoundError') {
        res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным id не найдена.' });
        return;
      }
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка.' });
    });
});

module.exports.likeCard = ((req, res) => {
  const { cardId } = req.params;
  const userId = req.user._id;
  if (!mongoose.isValidObjectId(cardId)) {
    res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан некорректный id карточки.' });
    return;
  }
  // $addToSet: добавить _id в массив, если его там нет
  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: userId } }, { new: true })
    .orFail()
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным id не найдена.' });
        return;
      }
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка.' });
    });
});

module.exports.dislikeCard = ((req, res) => {
  const { cardId } = req.params;
  const userId = req.user._id;
  if (!mongoose.isValidObjectId(cardId)) {
    res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан некорректный id карточки.' });
    return;
  }
  // $pull: убрать _id из массива
  Card.findByIdAndUpdate(cardId, { $pull: { likes: userId } }, { new: true })
    .orFail()
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'DocumenCtNotFoundError') {
        res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным id не найдена.' });
        return;
      }
      res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка.' });
    });
});
