'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = (sequelize, DataTypes) => {
  const model = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false, },
    token: {
      type: DataTypes.VIRTUAL,
      get() {
        return jwt.sign({ username: this.username });
      },
    },
  }, {
    hooks: {
      beforeCreate: (async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
      }),
    },
  });

  // Basic AUTH: Validating strings (username, password) 
  model.prototype.authenticateBasic = async function (username, password) {
    const user = await this.findOne({ username })
    const valid = await bcrypt.compare(password, user.password)
    if (valid) { return user; }
    throw new Error('Invalid User');
  }

  /**
   * Authenticates a token from the client yeah
   * @param {*} token JSON Web Token from the client
   * @returns A user object
   */
  model.prototype.authenticateToken = async function (token) {
    try {
      const parsedToken = jwt.verify(token, process.env.SECRET);
      const user = this.findOne({ username: parsedToken.username })
      if (user) { return user; }
      throw new Error('User not found');
    } catch (e) {
      throw new Error(e.message);
    }
  }

  return model;
}

module.exports = userSchema;
