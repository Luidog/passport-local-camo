const modelConstructor = require('../index');

const Account = modelConstructor({
  usernameKey: 'name',
  primaryKey: 'user',
  passwordKey: 'hash'
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
