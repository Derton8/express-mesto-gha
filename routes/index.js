const express = require('express');

const router = express.Router();

const userRouter = require('./users');
const cardRouter = require('./cards');
const authRouter = require('./auth');
const auth = require('../middlewares/auth');

router.use('/', authRouter);

// роуты, которым авторизация нужна
router.use(auth);
router.use('/users', userRouter);
router.use('/cards', cardRouter);

module.exports = router;
