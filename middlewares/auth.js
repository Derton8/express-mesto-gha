const jwt = require('jsonwebtoken');

const { HTTP_STATUS_UNAUTHORIZED } = require('../utils/constants');

module.exports = (res, req, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    res.status(HTTP_STATUS_UNAUTHORIZED).send({ message: 'Необходимо авторизоваться.' });
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, 'MY_SECRET_KEY');
  } catch (err) {
    return res.status(HTTP_STATUS_UNAUTHORIZED).send({ message: 'Необходимо авторизоваться.' });
  }
  req.user = payload;
  next();
};
