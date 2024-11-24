// ********************** Initialize server **********************************

const server = require('../src/index'); //TODO: Make sure the path to your index.js is correctly added

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
describe('Test Register API', () => {
  it('Positive : /register. Checking registration and redirect', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'John-Doe', password: '123'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.redirectTo(/^.*127\.0\.0\.1.*\/login$/);
        done();
      });
  });
  it('Negative : /register. Checking invalid name', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 808, password: 'troupe'})
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
});


describe('Test Login', () => {
  // Sample test case given to test / endpoint.
  it('positive : /login', done => {
    chai
      .request(server)
      .post('/login')
      .send({username: 'John-Doe', password: '123'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it('negative : /login. Invalid Username', done => {
    chai
      .request(server)
      .post('/login')
      .send({username: 'JohnDoe', password: '123'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.redirectTo(/^.*127\.0\.0\.1.*\/register$/);
        done();
      });
  });
  it('negative : /login. Invalid Password', done => {
    chai
      .request(server)
      .post('/login')
      .send({username: 'John-Doe', password: '1234'})
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

});



// ********************************************************************************
