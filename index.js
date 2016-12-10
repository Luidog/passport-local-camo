const crypto = require('crypto');
const camo = require('camo');

const modelConstructor = (options = {}) => {
	if (typeof options !== typeof {}) options = {};
	let defaults = {
		primaryKey: 'uid',
		usernameKey: 'username',
		passwordKey: 'passhash',
		primaryKeyGen: (length = 64, encoding = 'hex') => {
			return crypto.randomBytes(length).toString(encoding);
		},
		hashGen: async (data, algorithm = 'whirlpool', encoding = 'hex') => {
			let hash = crypto.createHash(algorithm);
			hash.update(data);
			return hash.digest(encoding);
		},
		E_USER_NOT_FOUND: 'No such user registered',
		E_INVALID_PASS: 'Invalid credentials passed'
	};
	options = Object.assign({}, defaults, options);

	class Account extends camo.Document {
		constructor () {
			super();
			this[options.primaryKey] = {
				type: String,
				default: options.primaryKeyGen()
			};
			this[options.usernameKey] = {
				type: String,
				required: true,
				unique: true
			},
			this[options.passwordKey] = {
				type: String,
				default: ''
			};
		}

		async setPasshash (data) {
			this[options.passwordKey] = await options.hashGen(data);
			return this.save();
		}

		async checkPasshash (data) {
			return (await options.hashGen(data) === this[options.passwordKey]);
		}

		async dump () {
			return {
				[options.primaryKey]: this[options.primaryKey],
				[options.usernameKey]: this[options.usernameKey]
			};
		}

		static serialize (user, done) {
			done(null, user[options.primaryKey]);
		}

		static deserialize (primaryKey, done) {
			Account.findOne({ [options.primaryKey]: primaryKey }).then((user) => {
				done(null, user);
			}, (e) => {
				done(e, false);
			});
		}

		static authenticate (username, passhash, done) {
			Account.findOne({ [options.usernameKey]: username }).then(async (user) => {
				if (! user) return done(null, false, new Error(options.E_USER_NOT_FOUND));
				if (await user.checkPasshash(passhash)) return done(null, await user.dump());
				else return done(null, false, new Error(options.E_INVALID_PASS));
			}, (e) => {
				return done(e);
			});
		}

		static async register (username, passhash) {
			let user = ((username instanceof Account) ? username : Account.create({ [options.usernameKey]: username }));
			await user.setPasshash(passhash);
			return user;
		}
	};

	return Account;
};

module.exports = modelConstructor;