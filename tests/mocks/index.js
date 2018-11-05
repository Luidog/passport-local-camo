'use strict';

const varium = require('varium');
const environment = require('dotenv');
const modelConstructor = require('../../index');

environment.config({ path: './tests/.env' });
varium(process.env, './tests/env.manifest');

const Account = modelConstructor({
  usernameKey: process.env.ACCOUNT_KEY,
  primaryKey: process.env.PRIMARY_KEY,
  passwordKey: process.env.PASSWORD_KEY
});

class User extends Account {
  constructor() {
    super();

    this.schema({
      role: {
        type: String,
        required: true,
        default: 'user'
      },
      email: {
        type: String
      }
    });
  }
}

module.exports = { User };
