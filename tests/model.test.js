/* global describe before beforeEach it */

/* eslint-disable */

const assert = require('assert');
const { expect, should } = require('chai');

/* eslint-enable */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const environment = require('dotenv');
const varium = require('varium');
const { connect } = require('marpat');
const modelConstructor = require('../index');

chai.use(chaiAsPromised);

describe('Account Capabilities', () => {
  let database;

  before(done => {
    environment.config({ path: './tests/.env' });
    varium(process.env, './tests/env.manifest');
    connect('nedb://memory')
      .then(db => {
        database = db;
        return database.dropDatabase();
      })
      .then(() => {
        return done();
      });
  });
  it('should allow a class to be created with no options', function() {
    const Account = modelConstructor();
    class User extends Account {
      constructor() {
        super();
        this.schema({});
      }
    }
    return expect(
      User.register(process.env.ACCOUNT_NAME, process.env.ACCOUNT_PASSWORD)
    )
      .to.eventually.be.an('object')
      .that.has.all.keys('uid', 'name');
  });
  it('should reject generating a hash if there is no password to hash', function() {
    const Account = modelConstructor();
    class User extends Account {
      constructor() {
        super();
        this.schema({});
      }
    }

    return expect(
      User.findOne()
        .then(user => {
          user.iterations = 'bacon';
          return user.hashGenerator('delicious');
        })
        .catch(error => error)
    ).to.eventually.be.an('error');
  });
});
