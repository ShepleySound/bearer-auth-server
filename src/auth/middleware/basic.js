'use strict';

const base64 = require('base-64');
const { users } = require('../models/index.js');

module.exports = async (req, res, next) => {

  try {
    if (!req.headers.authorization) { 
      next('Auth Error');
    }
    const basicHeaderParts = req.headers.authorization.split(' ');
    const encodedString = basicHeaderParts.pop();
    const [username, password] = base64.decode(encodedString).split(':');

    req.user = await users.authenticateBasic(username, password);
    next();
  } catch (err) {
    console.error(err);
    res.status(403).send('Invalid Login');
  }
};

