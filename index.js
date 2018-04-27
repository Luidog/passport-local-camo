'use strict';

const crypto = require('crypto');
const uuidv4 = require('uuid/v4');
const cryptoRandomString = require('crypto-random-string');
const { Document } = require('marpat');

let defaults = {
  primaryKey: 'uId',
  usernameKey: 'name',
  passwordKey: 'hash',
  primaryKeyGenerator: () => uuidv4(),
  E_USER_NOT_FOUND: 'No such user registered',
  E_INVALID_PASS: 'Invalid credentials passed'
};

const modelConstructor = (options = {}) => {
  options = Object.assign({}, defaults, options);

  class Account extends Document {
    constructor() {
      super();
      this[options.primaryKey] = {
        type: String,
        default: options.primaryKeyGenerator()
      };
      this[options.usernameKey] = {
        type: String,
        required: true,
        unique: true
      };
      this.salt = {
        type: String,
        required: true,
        default: cryptoRandomString(20)
      };
      this.iterations = {
        type: Number,
        required: true,
        default: 872791
      };
      this.digest = {
        type: String,
        required: true,
        default: 'sha512'
      };
      this.hashBytes = {
        type: Number,
        required: true,
        default: 32
      };
      this[options.passwordKey] = {
        type: String,
        default: ''
      };
    }

    hashGenerator(data) {
      return new Promise((resolve, reject) =>
        crypto.pbkdf2(
          data,
          this.salt,
          this.iterations,
          this.hashBytes,
          this.digest,
          (error, hash) => {
            if (error) reject(error);
            resolve(hash.toString('hex'));
          }
        )
      );
    }

    saveHash(data) {
      return this.hashGenerator(data)
        .then(hash => {
          this.hash = hash;
          return this.save();
        })
        .then(user => this.dump());
    }

    checkHash(data) {
      return this.hashGenerator(data).then(
        hash => hash === this[options.passwordKey]
      );
    }

    dump() {
      try {
        let tmp = Object.assign({}, this);
        delete tmp[options.passwordKey];
        delete tmp._schema;
        delete tmp.salt;
        delete tmp.iterations;
        delete tmp.hashBytes;
        delete tmp._id;
        delete tmp.digest;
        return tmp;
      } catch (error) {}
      try {
        return Object.assign({}, this, {
          [options.passwordKey]: undefined,
          _schema: undefined,
          _id: undefined
        });
      } catch (error) {
        return this;
      }
    }

    static serialize(user, done) {
      done(null, user[options.primaryKey]);
    }

    static deserialize(primaryKey, done) {
      this.findOne({ [options.primaryKey]: primaryKey })
        .then(user => done(null, user))
        .catch(error => done(error, false));
    }

    resetPassword(current, change) {
      return new Promise((resolve, reject) => {
        if (this.checkHash(current)) {
          resolve(this.saveHash(change));
        } else {
          reject(options.E_INVALID_PASS);
        }
      });
    }

    static authenticate(username, password, done) {
      this.findOne({ [options.usernameKey]: username })
        .then(user => {
          if (!user)
            return done(null, false, new Error(options.E_USER_NOT_FOUND));
          return user.checkHash(password).then(verified => {
            if (verified) return done(null, user.dump());
            return done(null, false, new Error(options.E_INVALID_PASS));
          });
        })
        .catch(error => done(error));
    }

    static register(username, password) {
      let user =
        username instanceof Account
          ? username
          : this.create({ [options.usernameKey]: username });
      return user.saveHash(password);
    }
  }

  return Account;
};

module.exports = modelConstructor;
