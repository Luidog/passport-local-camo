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
const { User } = require('./mocks');

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
  describe('Account Registration Capabilities', function() {
    it('should allow an account to be registered', () => {
      return expect(
        User.register(process.env.ACCOUNT_NAME, process.env.ACCOUNT_PASSWORD)
      )
        .to.eventually.be.an('object')
        .that.has.all.keys(
          process.env.ACCOUNT_KEY,
          process.env.PRIMARY_KEY,
          'role',
          'email'
        );
    });
    it('should allow an account to register twice', () => {
      return expect(
        User.findOne().then(user =>
          User.register(user, process.env.ACCOUNT_PASSWORD)
        )
      )
        .to.eventually.be.an('object')
        .that.has.all.keys(
          process.env.ACCOUNT_KEY,
          process.env.PRIMARY_KEY,
          'role',
          'email'
        );
    });
    it('should reject if no account key is given', () => {
      return expect(
        User.register(undefined, process.env.ACCOUNT_PASSWORD).catch(
          error => error
        )
      ).to.eventually.be.an('error');
    });
    it('should reject if no password is given', () => {
      return expect(
        User.register(process.env.ACCOUNT_NAME, undefined).catch(error => error)
      ).to.eventually.be.an('error');
    });
  });
  describe('Account Authentication Capabilities', function() {
    before(done => {
      environment.config({ path: './tests/.env' });
      varium(process.env, './tests/env.manifest');
      connect('nedb://memory')
        .then(db => {
          database = db;
          return database.dropDatabase();
        })
        .then(() =>
          User.register(process.env.ACCOUNT_NAME, process.env.ACCOUNT_PASSWORD)
        )
        .then(account => done());
    });
    it('should allow a user to authenticate', function(done) {
      User.authenticate(
        process.env.ACCOUNT_NAME,
        process.env.ACCOUNT_PASSWORD,
        (error, user, definedError) => {
          try {
            expect(error).to.be.null;
            expect(user)
              .to.be.an('object')
              .that.has.all.keys(
                process.env.ACCOUNT_KEY,
                'email',
                'role',
                process.env.PRIMARY_KEY
              );
            expect(definedError).to.be.undefined;
            done();
          } catch (error) {
            done(error);
          }
        }
      );
    });
    it('should reject if no password is given', function(done) {
      User.authenticate(
        process.env.ACCOUNT_NAME,
        undefined,
        (error, user, definedError) => {
          try {
            expect(error).to.be.an('error');
            done();
          } catch (error) {
            done(error);
          }
        }
      );
    });
    it('should reject if the wrong password is given', function(done) {
      User.authenticate(
        process.env.ACCOUNT_NAME,
        'not-correct',
        (error, user, definedError) => {
          try {
            expect(error).to.be.null;
            expect(user).to.be.false;
            expect(definedError).to.be.an('error');
            done();
          } catch (error) {
            done(error);
          }
        }
      );
    });
    it('should reject if the wrong account is given', function(done) {
      User.authenticate(
        'not-an-account',
        process.env.ACCOUNT_PASSWORD,
        (error, user, definedError) => {
          try {
            expect(error).to.be.null;
            expect(user).to.be.false;
            expect(definedError).to.be.an('error');
            done();
          } catch (error) {
            done(error);
          }
        }
      );
    });
  });
  describe('Password Reset Capabilities', function() {
    before(done => {
      User.register(
        process.env.ACCOUNT_NAME,
        process.env.ACCOUNT_PASSWORD
      ).then(results => done());
    });
    it('should allow passwords to be reset', function() {
      return expect(
        User.findOne().then(user =>
          user.resetPassword(process.env.ACCOUNT_PASSWORD, 'new-password')
        )
      ).to.eventually.be.an('object');
    });
    it('should reject if the current password is incorrect', function() {
      return expect(
        User.findOne().then(user =>
          user.resetPassword('incorrect', 'new-password').catch(error => error)
        )
      ).to.eventually.be.a('string');
    });
  });
});
