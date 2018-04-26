'use strict';

const crypto = require('crypto');
const { Document } = require('marpat');

let defaults = {
	primaryKey: 'uid',
	usernameKey: 'username',
	passwordKey: 'passhash',
	primaryKeyGenerator: (length = 64, encoding = 'hex') => {
		return crypto.randomBytes(length).toString(encoding);
	},
	hashGenerater: async (data, algorithm = 'whirlpool', encoding = 'hex') => {
		let hash = crypto.createHash(algorithm);
		hash.update(data);
		return hash.digest(encoding);
	},
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
			(this[options.usernameKey] = {
				type: String,
				required: true,
				unique: true
			}),
				(this[options.passwordKey] = {
					type: String,
					default: ''
				});
		}

		async createHash(data) {
			this[options.passwordKey] = await options.hashGenerater(data);
			return this.save();
		}

		async checkHash(data) {
			return (await options.hashGenerater(data)) === this[options.passwordKey];
		}

		async dump() {
			try {
				let tmp = Object.assign({}, this);
				delete tmp[options.passwordKey];
				delete tmp._schema;
				delete tmp._id;
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
			this.findOne({ [options.primaryKey]: primaryKey }).then(
				user => {
					done(null, user);
				},
				error => {
					done(error, false);
				}
			);
		}

		static resetPassword(current, change) {
			return new Promise((resolve, reject) => {
				if (this.checkHash(current)) {
					this.createHash(change);
					resolve(this.dump());
				} else {
					reject({ message: 'Current password is not correct' });
				}
			});
		}

		static authenticate(name, hash, done) {
			this.findOne({ [options.usernameKey]: name }).then(
				async user => {
					if (!user)
						return done(null, false, new Error(options.E_USER_NOT_FOUND));
					if (await user.checkHash(hash)) return done(null, await user.dump());
					else return done(null, false, new Error(options.E_INVALID_PASS));
				},
				error => {
					return done(error);
				}
			);
		}

		static async register(username, passhash) {
			let user =
				username instanceof Account
					? username
					: this.create({ [options.usernameKey]: username });
			await user.createHash(passhash);
			return user;
		}
	}

	return Account;
};

module.exports = modelConstructor;
