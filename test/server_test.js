process.env.NODE_ENV = 'test';

var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://localhost:8080');
var app = require('../server.coffee');
var fs = require('fs');
var Cookies;

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

  describe('User logged in', function() {
    before(function(done) {
      api.post('/login')
         .send({'login': 'test', 'password': 'test'})
         .end(function(err, res) {
            if (err) return done(err);
            Cookies = res.headers['set-cookie'].pop().split(';')[0];
            done();
         });

      console.log('loguje');
    });

    describe('GET /messages', function() {
      it('should return messages', function(done) {
        var req = api.get('/messages')
        req.cookies = Cookies;
          req.expect(200)
          .end(done);
      });
    });
   });
});