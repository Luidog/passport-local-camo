/* global describe before beforeEach it */

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

describe('Storage Capabilities', () => {
  let database;
  let account;

  before(done => {
    environment.config({ path: './test/.env' });
    varium({ manifestPath });
    connect('nedb://memory')
      .then(db => {
        database = db;
        return database.dropDatabase();
      })
      .then(() => {
        return done();
      });
  });

  beforeEach(done => {
    const user = {
      role: process.env.ACCOUNT_ROLE
    };

    user[`${process.env.ACCOUNT_KEY}`] = process.env.ACCOUNT_NAME;
    user[`${process.env.PASSWORD_KEY}`] = process.env.ACCOUNT_PASSWORD;

    account = User.create(user);
    done();
  });

  it('should allow an instance to be created', () => {
    return expect(Promise.resolve(account))
      .to.eventually.be.an('object')
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
  });

  it('should allow an instance to be saved.', () => {
    return expect(account.save())
      .to.eventually.be.an('object')
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
  });

  it('should allow an instance to be recalled', () => {
    return expect(User.findOne({}))
      .to.eventually.be.an('object')
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
  });

  it('should allow instances to be listed', () => {
    return expect(User.find({})).to.eventually.be.an('array');
  });

  it('should allow you to remove an instance', () => {
    return expect(User.deleteOne({}))
      .to.eventually.be.an('number')
      .and.equal(1);
  });
});
