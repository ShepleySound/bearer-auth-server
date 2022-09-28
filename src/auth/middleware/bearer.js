'use strict';

const { users } = require('../models/index.js');

module.exports = async (req, res, next) => {

  try {

    if (!req.headers.authorization) { next('Invalid Login') }

    const token = req.headers.authorization.split(' ').pop();
    console.log("Before model auth")
    const validUser = await users.authenticateToken(token);
    console.log('after model auth')

    req.user = validUser;
    req.token = validUser.token;
    next();
  } catch (err) {
    console.error(err);
    res.status(403).send('Invalid Login');
  }
};
