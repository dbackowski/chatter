exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function (table) {
    table.increments('id').primary();
    table.string('login');
    table.string('password')
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema
             .dropTable('users', table)
             .then(function () {
                console.log('Users table was dropped!');
             });
};
