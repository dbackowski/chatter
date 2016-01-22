process.env.NODE_ENV = 'test';

var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://localhost:8080');
var app = require('../server.coffee');
var fs = require('fs');

describe('Server', function() {
  describe('User not logged', function() {
    describe('GET /', function() {
      it('should redirect to login form', function(done) {
        api.get('/')
          .expect(302)
          .expect('Location', '/login')
          .end(done);
      });
    })

    describe('GET /messages', function() {
      it('should redirect to login form', function(done) {
        api.get('/messages')
          .expect(302)
          .expect('Location', '/login')
          .end(done);
      });
    })

    describe('GET /login', function() {
      it('should render login.html', function(done) {
        api.get('/login')
          .expect(200)
          .end(function(err, res) {
            var template = fs.readFileSync('views/login.html').toString();
            res.text.should.equal(template);
            done();
          });
      });
    })
  });
});