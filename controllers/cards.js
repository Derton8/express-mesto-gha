const Card = require('../models/card');

module.exports.getCards = ((req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send({ data: cards }))
    .catch((err) => res.status(500).send({ message: err.message }));
});

module.exports.createCard = ((req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(200).send({ card }))
    .catch((err) => res.status(500).send({ message: err.message }));
});

module.exports.deleteCard = ((req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndDelete(cardId)
    .then((card) => res.status(200).send({ card }))
    .catch((err) => res.status(500).send({ message: err.message }));
});

module.exports.likeCard = ((req, res) => {
  const { cardId } = req.params;
  const userId = req.user._id;

  // $addToSet: добавить _id в массив, если его там нет
  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: userId } }, { new: true })
    .then((card) => res.status(200).send({ card }))
    .catch((err) => res.status(500).send({ message: err.message }));
});

module.exports.dislikeCard = ((req, res) => {
  const { cardId } = req.params;
  const userId = req.user._id;

  // $pull: убрать _id из массива
  Card.findByIdAndUpdate(cardId, { $pull: { likes: userId } }, { new: true })
    .then((card) => res.status(200).send({ card }))
    .catch((err) => res.status(500).send({ message: err.message }));
});
