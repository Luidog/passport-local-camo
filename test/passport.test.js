/* global describe before  it */

/* eslint-disable */

const assert = require('assert');
const { expect, should } = require('chai');

/* eslint-enable */

const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const environment = require('dotenv');
const varium = require('varium');
const { connect } = require('marpat');
const { User } = require('./mocks');

const manifestPath = path.join(__dirname, './env.manifest');

chai.use(chaiAsPromised);

describe('Passport Capabilities', () => {
  let database;
  let user;

  before(done => {
    environment.config({ path: './test/.env' });
    varium({ manifestPath });
    connect('nedb://memory')
      .then(db => {
        database = db;
        return database.dropDatabase();
      })
      .then(() =>
        User.register(process.env.ACCOUNT_NAME, process.env.ACCOUNT_PASSWORD)
      )
      .then(results => {
        user = results;
        done();
      });
  });
  it('should serialize an account', function(done) {
    User.serialize(user, (error, key) => {
      try {
        expect(error).to.be.null;
        expect(key).to.be.an('string');
        done();
      } catch (error) {
        done(error);
      }
    });
  });
  it('should deserialize an account', function(done) {
    User.deserialize(user[process.env.PRIMARY_KEY], (error, user) => {
      try {
        expect(error).to.be.null;
        expect(user)
          .to.be.an('object')
          .that.has.all.keys(
            '_schema',
            process.env.ACCOUNT_KEY,
            '_id',
            'digest',
            'email',
            'hash',
            'hashBytes',
            'iterations',
            'role',
            'salt',
            process.env.PRIMARY_KEY
          );
        done();
      } catch (error) {
        done(error);
      }
    });
  });
  it('should return false if there is no account to deserialize', function(done) {
    User.deserialize('no-account', (error, user) => {
      try {
        expect(error).to.be.null;
        expect(user).to.be.false;
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
