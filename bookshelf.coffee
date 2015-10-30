knex = require('knex')({
  client: 'pg',
  connection: {
    host     : '127.0.0.1',
    user     : 'postgres',
    password : '',
    database : 'chatter',
    charset  : 'utf8'
  }
});

module.exports = require('bookshelf')(knex)