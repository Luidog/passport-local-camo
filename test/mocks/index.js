'use strict';

const path = require('path');
const varium = require('varium');
const environment = require('dotenv');
const modelConstructor = require('../../index');

const manifestPath = path.join(__dirname, '../env.manifest');

environment.config({ path: './test/.env' });
varium({ manifestPath });

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
