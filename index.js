'use strict';

const crypto = require('crypto');
const uuidv4 = require('uuid/v4');
const cryptoRandomString = require('crypto-random-string');
const { Document } = require('marpat');

/**
 * These defaults are used in during construction of the account class.
 * The defaults are overwritten by the options parameter properties passed to
 * the modelConstructor function
 * @type {Object}
 * @see  {@link @modelConstructor}
 */
const defaults = {
  primaryKey: 'uid',
  usernameKey: 'name',
  passwordKey: 'hash',
  primaryKeyGenerator: () => uuidv4(),
  E_USER_NOT_FOUND: 'No such user registered',
  E_INVALID_PASS: 'Invalid credentials passed'
};

/**
 * @function modelConstructor
 * @public
 * @description The modelConstructor function will create a Account class configured based on the option parameter
 * it is called with. The option parameter is an object contianing properties which will customize the returned account.
 * @param  {Object} [options] Configuration options for customizing the account's properties
 * @param  {String} [options.primaryKey] The schema property to use as the primary key. This key is used for deserialization
 * @param  {String} [options.usernameKey] The schema property to use as the username. The username is used alongs the password property for authentication.
 * @param  {String} [options.passwordKey] The schema property to use to save the password hash.
 * @param  {Function} [options.primaryKeyGenerator] A function returning the uuid to use to generate the primary key for each account.
 * @param  {String} [options.E_USER_NOT_FOUND] An error message to be returned if a user is not found.
 * @param  {String} [options.E_INVALID_PASS] An error message to be returned if an invalid password or username is used.
 * @return {Account}  An Account class is returned for either direct use or to be extended by a new class.
 * @see  {@link @defaults}
 * @see  {@link @Account}
 * @see  {@link @deserialize}
 * @see  {@link @authenticate}
 */
const modelConstructor = (options = {}) => {
  const {
    primaryKey,
    primaryKeyGenerator,
    usernameKey,
    passwordKey,
    E_USER_NOT_FOUND,
    E_INVALID_PASS
  } = Object.assign({}, defaults, options);

  /**
   * @class Account
   * @classdesc The class used to create user accounts
   */
  class Account extends Document {
    /** @constructs */
    constructor() {
      super();
      /**
       * The primary key for an account
       * @member Account#primaryKey
       * @see  {@link @modelConstructor}
       * @type String
       */
      this[primaryKey] = {
        type: String,
        default: primaryKeyGenerator()
      };
      /**
       * The username for the account
       * @member Account#username
       * @see  {@link @modelConstructor}
       * @type String
       */
      this[usernameKey] = {
        type: String,
        required: true,
        unique: true
      };
      /**
       * The salt used when hashing the account password
       * @member Account#salt
       * @see  {@link @saveHash}
       * @see  {@link @checkHash}
       * @see  {@link https://github.com/sindresorhus/crypto-random-string|crypto-random-string}
       * @type String
       */
      this.salt = {
        type: String,
        required: true,
        default: cryptoRandomString({ length: 20 })
      };
      /**
       * The number of iterations to use when hashing the account password
       * @see  {@link @saveHash}
       * @see  {@link @checkHash}
       * @type Number
       */
      this.iterations = {
        type: Number,
        required: true,
        default: 872791
      };
      /**
       * The digest to use when hashing a password.
       * @default  sha512
       * @see  {@link @saveHash}
       * @see  {@link @checkHash}
       * @type String
       */
      this.digest = {
        type: String,
        required: true,
        default: 'sha512'
      };
      /**
       * The hashBytes to use when hashing a password.
       * @default  32
       * @see  {@link @saveHash}
       * @see  {@link @checkHash}
       * @type Number
       */
      this.hashBytes = {
        type: Number,
        required: true,
        default: 32
      };
      /**
       * The password hash for the account.
       * @member Account#passwordKey
       * @see  {@link @modelConstructor}
       * @see  {@link @saveHash}
       * @see  {@link @checkHash}
       * @type String
       */
      this[passwordKey] = {
        type: String,
        default: ''
      };
    }

    /**
     * @method hashGenerator
     * @public
     * @description The hashGenerator method accepts a data property and will use the crypto pbkdf2 method to generate
     * a hash.
     * @param  {String} data The string to hash.
     * @return {Promise} A promise that will resolve with the generated hash or reject with an error
     * @see  {@link @crypto}
     */
    hashGenerator(data) {
      return new Promise((resolve, reject) =>
        crypto.pbkdf2(
          data,
          this.salt,
          this.iterations,
          this.hashBytes,
          this.digest,
          (error, hash) =>
            error ? reject(error) : resolve(hash.toString('hex'))
        )
      );
    }

    /**
     * @method saveHash
     * @public
     * @description The saveHash method generates a hash of the the data passed to it and saves the result to the account
     * schema.
     * assigned to the object.
     * @param {String} data The string to check the currently saved hash against.
     * @return {Promise} A promise which will resolve with a account object.
     * @see  {@link @hashGenerator}
     * @see  {@link @dump}
     */
    saveHash(data) {
      return this.hashGenerator(data)
        .then(hash => {
          this[passwordKey] = hash;
          return this.save();
        })
        .then(user => this.dump());
    }

    /**
     * @method checkHash
     * @public
     * @description The checkHash method checks the data parameter against the accounts currently saved hash.
     * assigned to the object.
     * @param {String} data The string to check the currently saved hash against.
     * @return {Promise} A promise which will resolve with a true or false.
     * @see  {@link @hashGenerator}
     */
    checkHash(data) {
      return this.hashGenerator(data).then(hash => hash === this[passwordKey]);
    }

    /**
     * @method dump
     * @public
     * @description The dump method creates a new object with properties assigned from
     * the current account. The dump method will remove all sensitive schema properties
     * assigned to the object.
     * @return {Object} A user object created from the current account.
     */
    dump() {
      const tmp = Object.assign({}, this);
      delete tmp[passwordKey];
      delete tmp._schema;
      delete tmp.salt;
      delete tmp.iterations;
      delete tmp.hashBytes;
      delete tmp._id;
      delete tmp.digest;
      return tmp;
    }

    /**
     * @method serialize
     * @public
     * @static
     * @memberof Account
     * @description The serialize method accepts a user parameter and a done parameter. The method will select the
     * primaryKey of the user passed to it and call the done parameter with a null argument and the user's primary key.
     * @param  {Object|Class} user object or Account class to serialize.
     * @param  {Function} done the callback to call after serialization.
     */
    static serialize(user, done) {
      done(null, user[primaryKey]);
    }

    /**
     * @method deserialize
     * @public
     * @static
     * @memberof Account
     * @description The deserialize method accepts a key parameter and a done parameter. The method
     * will use the key paramerer to query for a user account. After performing the a query on the user datastore.
     * If a user is found done is called with arguments of null and the user. If a user is not found
     * done is called with arguments of null and false.
     * @param  {String} key The key to use in the find request
     * @param  {Function} done  The new password
     * @see  {@link checkHash}
     */
    static deserialize(key, done) {
      this.findOne({ [primaryKey]: key }).then(user =>
        user ? done(null, user) : done(null, false)
      );
    }

    /**
     * @method resetPassword
     * @public
     * @memberof Account
     * @description The resetPassword method accepts a current parameter and a change parameter. The method
     * will use the checkHash method to verify the current password parameter matches the saved hash. If the parameter
     * matches the save password the change parameter is saved.
     * @param  {String} current The users current password
     * @param  {String} change  The new password
     * @return {Promise} Resolves to a user account or rejects with an error.
     * @see  {@link checkHash}
     */
    resetPassword(current, change) {
      return this.checkHash(current).then(valid =>
        valid
          ? Promise.resolve(this.saveHash(change))
          : Promise.reject(E_INVALID_PASS)
      );
    }

    /**
     * @method authenticate
     * @public
     * @static
     * @memberof Account
     * @description The authenticate method will accept a username parameter and a password parameter. The
     * method will check if the username is found and verify the hash against the saved password hash.
     * @param  {String|Account} username The username for the account or an account.
     * @param  {Object} password The password for the account.
     * @param  {Function} done The function to call when authentication is complete.
     * @see {@link checkHash}
     * @see {@link dump}
     */
    static authenticate(username, password, done) {
      this.findOne({ [usernameKey]: username })
        .then(user => {
          if (!user) return done(null, false, new Error(E_USER_NOT_FOUND));
          return user.checkHash(password).then(verified => {
            if (verified) return done(null, user.dump());
            return done(null, false, new Error(E_INVALID_PASS));
          });
        })
        .catch(error => done(error));
    }

    /**
     * @method register
     * @public
     * @static
     * @memberof Account
     * @description The register method will accept a username parameter and a password parameter.
     * If the username parameter is not already an account the parameter is used to create one. If the
     * username parameter is an account that account is used to hash and save the password parameter.
     * @param  {String|Account} username The username for the account or an account.
     * @param  {Object} password The password for the account.
     * @return {Promise} Resolves to a user account or rejects with an error.
     * @see {@link saveHash}
     * @see {@link create}
     */
    static register(username, password) {
      const user =
        username instanceof Account
          ? username
          : this.create({ [usernameKey]: username });
      return user.saveHash(password);
    }
  }

  return Account;
};

module.exports = modelConstructor;
