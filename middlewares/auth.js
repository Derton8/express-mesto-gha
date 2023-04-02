const jwt = require('jsonwebtoken');

const { HTTP_STATUS_UNAUTHORIZED } = require('../utils/constants');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(HTTP_STATUS_UNAUTHORIZED).send({ message: 'Необходимо авторизоваться.' });
  }
  let payload;
  try {
    payload = jwt.verify(token, 'MY_SECRET_KEY');
  } catch (err) {
    return res.status(HTTP_STATUS_UNAUTHORIZED).send({ message: 'Необходимо авторизоваться.' });
  }
  req.user = payload;
  next();
};
