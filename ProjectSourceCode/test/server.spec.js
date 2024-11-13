// ********************** Initialize server **********************************

const server = require('../index'); //TODO: Make sure the path to your index.js is correctly added

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************
describe('Test Register', () => {
  // Sample test case given to test / endpoint.
  it('positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'John-Doe', password: '123'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Success');
        done();
      });
  });
});

describe('Test Login', () => {
  // Sample test case given to test / endpoint.
  it('positive : /login', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'John-Doe', password: '123'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Success');
        done();
      });
  });
});

describe('Test Login', () => {
  // Sample test case given to test / endpoint.
  it('negative : /login', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'JohnDoe', password: '1234'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Success');
        done();
      });
  });
});


// ********************************************************************************