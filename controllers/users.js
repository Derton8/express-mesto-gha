const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const BadRequestError = require('../utils/errors/bad-req-err');
const ConflictError = require('../utils/errors/conflict-err');
const NotFoundError = require('../utils/errors/not-found-err');
const UnauthorizedError = require('../utils/errors/unauthorized-err');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(new NotFoundError('Пользователь с указанным id не найден.'))
    .then((user) => res.send({ data: user }))
    .catch(next);
};

module.exports.getMe = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail(new NotFoundError('Пользователь с указанным id не найден.'))
    .then((user) => res.send({ data: user }))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then(async (hash) => {
      const user = await User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      });
      return res.send({ data: user.delPassword() });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Пользователь с данным email уже существует.'));
        return;
      }
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при регистрации.'));
        return;
      }
      next(err);
    });
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .orFail(new NotFoundError('Пользователь с указанным id не найден.'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении пользователя.'));
        return;
      }
      next(err);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { avatar }, { new: true })
    .then((user) => res.send({ data: user }))
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .orFail(new UnauthorizedError('Неправильные почта или пароль.'))
    .then(async (user) => {
      const matched = await bcrypt.compare(password, user.password);
      if (matched) {
        const token = jwt.sign({ _id: user._id }, 'MY_SECRET_KEY');
        res
          .cookie('jwt', token, {
            maxAge: 7 * 24 * 3600000,
            httpOnly: true,
          })
          .send({ data: user.delPassword() });
      } else {
        next(new UnauthorizedError('Неправильные почта или пароль.'));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при авторизации пользователя.'));
        return;
      }
      next(err);
    });
};
