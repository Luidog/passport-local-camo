# Passport-Local marpat [![npm version](https://badge.fury.io/js/passport-local-marpat.svg)](https://badge.fury.io/js/passport-local-marpat)
Passport-Local marpat is a [marpat](https://github.com/scottwrobinson/marpat) plugin that simplifies building username and password login with [Passport](http://passportjs.org).

## Installation

    $ npm i --save passport-local-marpat

Passport-Local marpat does not require `passport`, `passport-local` or `marpat` dependencies directly but expects you
to have these dependencies installed.

In case you need to install the whole set of dependencies

    $ npm i --save passport passport-local marpat passport-local-marpat

## Usage

### Model Passport-Local marpat
First you need to instantiate from Passport-Local marpat into your own User model

    const modelBuilder = require('passport-local-marpat');
    const Account = modelBuilder();

    module.exports = Account;

You're free to define your User how you like by extending `Account` class. Passport-Local marpat will add custom fields to store username and hashed password.

Additionally Passport-Local marpat adds some methods to your Schema. See the API Documentation section for more details.

### Configure Passport/Passport-Local
You should configure Passport/Passport-Local as described in [the Passport Guide](http://passportjs.org/guide/configure/).

Passport-Local marpat supports this setup by implementing a `LocalStrategy` and serializeUser/deserializeUser functions.

To setup Passport-Local marpat use this code

    // requires the model built by Passport-Local marpat or one extended from it
    var User = require('./models/User');
    
    // use static serialize and deserialize of model for passport session support
    passport.serializeUser(User.serialize);
    passport.deserializeUser(User.deserialize);

    // use static authenticate method of model in LocalStrategy
    passport.use(new LocalStrategy(User.authenticate));

Make sure that you have a marpat connected to mongodb and you're done.

### Options
Passport-Local marpat additional options can be passed to model builder to configure process.

    //  models/User.js
    const Account = modelBuilder(options);

`options` is object. Each field is optional. Here are defaults for each field.

__Main Options__

* `primaryKey`: represents field name for primary key. Default is `uid`
* `usernameKey`: represents field name for username. Default is `username`
* `passwordKey`: represents field name for pass. Default is `passhash`
* `primaryKeyGen`: sync function which is used to generate random primary key. Must take 2 args:
* * [`length`]: length of generated key. Default is `64`
* * [`encoding`]: encoding of generated key. Default is `hex`
* `hashGen`: **async** function which is used to hash password.
* * <`data`>: data to be hashed
* * [`algorithm`]: algorithm used for hashing. Default is `whirlpool`
* * [`encoding`]: encoding of resulting hash. Default is `hex`
* `E_USER_NOT_FOUND`, `E_INVALID_PASS`: error text accordingly

### Examples
For complete example of implementing a registration, login and logout see [here](https://github.com/perimetral/passport-local-marpat/tree/master/example).

## API Documentation
### Instance methods

#### async setPasshash(password) 
set a user's password. ***must be called at least once upon creation of new user, if using `Account.create()`***

#### async checkPasshash(password)
directly check whether passed password is correct or not

#### async dump()
get clean user object (JSON without passhash and methods)

### Static methods
Static methods are exposed on the schema. For example to use `register` function use

    var User = require('./models/User');
    await User.register(opts);

* `authenticate (username, passhash, done)`: function that is used in Passport's LocalStrategy
* `serialize (user, done)`: function that is used by Passport to serialize users into the session
* `deserialize (primaryKey, done)`: function that is used by Passport to deserialize users from the session
* async `register (user || username, password)`: method to register a new user instance with a given password. Checks if username is unique. 

## License
Passport-Local marpat is licensed under the MIT License. See LICENSE.md
