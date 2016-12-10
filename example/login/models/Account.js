const modelBuilder = require('passport-local-camo');

const Account = modelBuilder({
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
});

//	To modify model behavior, just extend it with new features
class ExtendedAccount extends Account {
	constructor (props) {
		super(props);
		this.customField = {
			type: Date,
			default: new Date()
		};
	}
	async preSave () {
		console.log('WARNING! CAPTAIN IS COMING!');
		return this;
	}
}

module.exports = ExtendedAccount;