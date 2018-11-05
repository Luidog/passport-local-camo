<!--@h1([pkg.name])-->
# passport-local-marpat
<!--/@-->

 
[![npm version](https://badge.fury.io/js/passport-local-marpat.svg)](https://badge.fury.io/js/passport-local-marpat)

passport-local-marpat is a [marpat](https://github.com/luidog/marpat) plugin that simplifies building username and password login with [Passport](http://passportjs.org).

<!--@installation()-->
## Installation

```sh
npm install --save passport-local-marpat
```
<!--/@-->

passport-local-marpat does not require `passport` or `passport-local` dependencies directly but expects you to have these dependencies installed.

    $ npm i --save passport passport-local passport-local-marpat

## Usage

### Model passport-local-marpat

First you need to instantiate from passport-local-marpat into your own User model

    const modelBuilder = require('passport-local-marpat');
    const Account = modelBuilder();

    module.exports = Account;

You're free to define your User how you like by extending `Account` class. passport-local-marpat will add custom fields to store username and hashed password.

Additionally passport-local-marpat adds some methods to your Schema. See the API Documentation section for more details.

### Configure Passport/Passport-Local

You should configure Passport/Passport-Local as described in [the Passport Guide](http://passportjs.org/guide/configure/).

passport-local-marpat supports this setup by implementing a `LocalStrategy` and `serialize`/`deserialize` functions.

To setup passport-local-marpat use this code

    // requires the model built by passport-local-marpat or one extended from it
    var User = require('./models/User');

    // use static serialize and deserialize of model for passport session support
    passport.serializeUser(User.serialize);
    passport.deserializeUser(User.deserialize);

    // use static authenticate method of model in LocalStrategy
    passport.use(new LocalStrategy(User.authenticate));

Make sure that you have a marpat connected to mongodb or nedb and you're done.

### Options

passport-local-marpat additional options can be passed to model builder to configure process.

    //  models/User.js
    const Account = modelBuilder(options);

`options` is object. Each field is optional. Here are defaults for each field.

**Main Options**

- `primaryKey`: represents field name for primary key. Default is `uid`
- `usernameKey`: represents field name for username. Default is `username`
- `passwordKey`: represents field name for pass. Default is `passhash`
- `primaryKeyGen`: sync function which is used to generate random primary key. Must take 2 args:
- - [`length`]&#x3A; length of generated key. Default is `64`
- - [`encoding`]&#x3A; encoding of generated key. Default is `hex`
- `hashGen`: **async** function which is used to hash password.
- - &lt;`data`>: data to be hashed
- - [`algorithm`]&#x3A; algorithm used for hashing. Default is `whirlpool`
- - [`encoding`]&#x3A; encoding of resulting hash. Default is `hex`
- `E_USER_NOT_FOUND`, `E_INVALID_PASS`: error text accordingly

### Examples

For complete example of implementing a registration and authentication see [here](https://github.com/luidog/passport-local-marpat/tree/master/example).

## API Documentation

### Instance methods

#### savehash(password)

set a user's password. **_must be called at least once upon creation of new user, if using `Account.create()`_**

#### checkHash(password)

directly check whether passed password is correct or not

#### dump()

get clean user object (JSON without passhash and methods)

### Static methods

Static methods are exposed on the schema. For example to use `register` function use

    var User = require('./models/User');
    await User.register(opts);

- `authenticate (username, passhash, done)`: function that is used in Passport's LocalStrategy
- `serialize (user, done)`: function that is used by Passport to serialize users into the session
- `deserialize (primaryKey, done)`: function that is used by Passport to deserialize users from the session
- Promise `register (user || username, password)`: method to register a new user instance with a given password. Checks if username is unique.
- Promise `resetPassword (current, new)`: method that checks the current password against the hash and if successful - creates and saves a hash using the new password.

<!--@execute('npm run test',[])-->
```default
> passport-local-marpat@3.0.0 test /Users/luidelaparra/Documents/Development/passport-local-marpat
> nyc _mocha --recursive  ./tests --timeout=30000 --exit



  Account Capabilities
    Account Registration Capabilities
      ✓ should allow an account to be registered (1015ms)
      ✓ should allow an account to register twice (1000ms)
      ✓ should reject if no account key is given (1001ms)
      ✓ should reject if no password is given
    Account Authentication Capabilities
      ✓ should allow a user to authenticate (1002ms)
      ✓ should reject if no password is given
      ✓ should reject if the wrong password is given (1007ms)
      ✓ should reject if the wrong account is given
    Password Reset Capabilities
      ✓ should allow passwords to be reset (2012ms)
      ✓ should reject if the current password is incorrect (1007ms)

  Account Capabilities
    ✓ should allow a class to be created with no options (1018ms)
    ✓ should reject generating a hash if there is no password to hash

  Passport Capabilities
    ✓ should serialize an account
    ✓ should deserialize an account
    ✓ should return false if there is no account to deserialize

  Storage Capabilities
    ✓ should allow an instance to be created
    ✓ should allow an instance to be saved.
    ✓ should allow an instance to be recalled
    ✓ should allow instances to be listed
    ✓ should allow you to remove an instance


  20 passing (12s)

-----------------------------------|----------|----------|----------|----------|-------------------|
File                               |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------------------------|----------|----------|----------|----------|-------------------|
All files                          |      100 |      100 |      100 |      100 |                   |
 passport-local-marpat             |      100 |      100 |      100 |      100 |                   |
  index.js                         |      100 |      100 |      100 |      100 |                   |
 passport-local-marpat/tests/mocks |      100 |      100 |      100 |      100 |                   |
  index.js                         |      100 |      100 |      100 |      100 |                   |
-----------------------------------|----------|----------|----------|----------|-------------------|
```
<!--/@-->

<!--@dependencies()-->
## <a name="dependencies">Dependencies</a>

- [crypto-random-string](https://github.com/sindresorhus/crypto-random-string): Generate a cryptographically strong random string
- [marpat](https://github.com/luidog/marpat): A class-based ES6 ODM for Mongo-like databases.
- [uuid](https://github.com/kelektiv/node-uuid): RFC4122 (v1, v4, and v5) UUIDs

<!--/@-->

<!--@devDependencies()-->
## <a name="dev-dependencies">Dev Dependencies</a>

- [body-parser](https://github.com/expressjs/body-parser): Node.js body parsing middleware
- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [chai-as-promised](https://github.com/domenic/chai-as-promised): Extends Chai with assertions about promises.
- [coveralls](https://github.com/nickmerwin/node-coveralls): takes json-cov output into stdin and POSTs to coveralls.io
- [dotenv](https://github.com/motdotla/dotenv): Loads environment variables from .env file
- [eslint](https://github.com/eslint/eslint): An AST-based pattern checker for JavaScript.
- [eslint-config-google](https://github.com/google/eslint-config-google): ESLint shareable config for the Google style
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier): Turns off all rules that are unnecessary or might conflict with Prettier.
- [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier): Runs prettier as an eslint rule
- [express](https://github.com/expressjs/express): Fast, unopinionated, minimalist web framework
- [jsdoc](https://github.com/jsdoc3/jsdoc): An API documentation generator for JavaScript.
- [minami](https://github.com/Nijikokun/minami): Clean and minimal JSDoc 3 Template / Theme
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [mocha-lcov-reporter](https://github.com/StevenLooman/mocha-lcov-reporter): LCOV reporter for Mocha
- [mos](https://github.com/mosjs/mos): A pluggable module that injects content into your markdown files via hidden JavaScript snippets
- [mos-plugin-dependencies](https://github.com/mosjs/mos/tree/master/packages/mos-plugin-dependencies): A mos plugin that creates dependencies sections
- [mos-plugin-execute](https://github.com/team-767/mos-plugin-execute): Mos plugin to inline a process output
- [mos-plugin-installation](https://github.com/mosjs/mos/tree/master/packages/mos-plugin-installation): A mos plugin for creating installation section
- [mos-plugin-license](https://github.com/mosjs/mos-plugin-license): A mos plugin for generating a license section
- [mos-plugin-snippet](https://github.com/mosjs/mos/tree/master/packages/mos-plugin-snippet): A mos plugin for embedding snippets from files
- [nyc](https://github.com/istanbuljs/nyc): the Istanbul command line interface
- [passport](https://github.com/jaredhanson/passport): Simple, unobtrusive authentication for Node.js.
- [passport-local](https://github.com/jaredhanson/passport-local): Local username and password authentication strategy for Passport.
- [prettier](https://github.com/prettier/prettier): Prettier is an opinionated code formatter
- [varium](https://npmjs.org/package/varium): A strict parser and validator of environment config variables

<!--/@-->

<!--@license()-->
## License

MIT © Lui de la Parra
<!--/@-->
