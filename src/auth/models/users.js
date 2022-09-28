'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    token: {
      type: DataTypes.VIRTUAL,
      get() {
        return jwt.sign({ username: this.username }, process.env.SECRET);
      },
    },
  }, {
    hooks: {
      beforeCreate: (async (model) => {
        const hashedPassword = await bcrypt.hash(model.password, 10);
        model.password = hashedPassword;
      }),
    },
  });

  // Basic AUTH: Validating strings (username, password) 
  model.authenticateBasic = async function (username, password) {
    const user = await this.findOne({ where: { username } });
    const valid = await bcrypt.compare(password, user.password);
    if (valid) { return user; }
    throw new Error('Invalid User');
  };

  /**
   * Authenticates a token from the client
   * @param {*} token JSON Web Token from the client
   * @returns A user object
   */
  model.authenticateToken = async function (token) {
    try {
      const parsedToken = jwt.verify(token, process.env.SECRET);
      const user = await this.findOne( { where: { username: parsedToken.username } } );
      if (user) { return user; }
      throw new Error('User not found');
    } catch (err) {
      throw new Error(err.message);
    }
  };

  return model;
};

