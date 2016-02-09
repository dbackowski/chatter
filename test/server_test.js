process.env.NODE_ENV = 'test';

var newXhr = require('socket.io-client-cookies-headers');
var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://localhost:8080');
var app = require('../server.coffee');
var fs = require('fs');
var io = require('socket.io-client');
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
    });

    describe('GET /messages', function() {
      it('should redirect to login form', function(done) {
        api.get('/messages')
          .expect(302)
          .expect('Location', '/login')
          .end(done);
      });
    });

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
    });

    describe('socket.io', function() {
      describe('on connection', function() {
        it('should throw error', function(done) {
          var socket = io.connect('http://127.0.0.1:8080', {
            'reconnection delay' : 0,
            'reopen delay' : 0,
            'force new connection' : true
          });

          socket.on('error', function (data) {
            data.should.equal('Authentication error');
            socket.disconnect();
            done();
          });
        });
      });
    });
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
    });

    describe('GET /messages', function() {
      it('should return messages', function(done) {
        var req = api.get('/messages');

        req.cookies = Cookies;
          req.expect(200)
          .end(done);
      });
    });

    describe('socket.io', function() {
      describe('on connection', function() {
        it('should emit connected user on users channel', function(done) {
          newXhr.setCookies(Cookies);

          var socket = io.connect('http://127.0.0.1:8080', {
            'reconnection delay' : 0,
            'reopen delay' : 0,
            'force new connection' : true
          });

          socket.on('users', function (data) {
            data.should.deep.equal(new Array('test'));
            socket.disconnect();
            done();
          });
        });
      });

      describe('on send message', function() {
        it('should emit message on message channel', function(done) {
          newXhr.setCookies(Cookies);

          var socket = io.connect('http://127.0.0.1:8080', {
            'reconnection delay' : 0,
            'reopen delay' : 0,
            'force new connection' : true
          });

          socket.on('message', function (data) {
            data.body.should.equal('this is test message');
            socket.disconnect();
            done();
          });

          socket.emit('message', { message: 'this is test message' });
        });
      });
    });
  });
});