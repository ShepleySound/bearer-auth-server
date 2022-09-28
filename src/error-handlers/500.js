'use strict';

module.exports = (err, req, res, next) => {
  res.status(500)
    .render('Server Error', { error: err.message || err });
};
