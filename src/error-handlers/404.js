'use strict';

module.exports = (req,res,next) => {
  res.status(404)
    .render('Resource Not Found');
};