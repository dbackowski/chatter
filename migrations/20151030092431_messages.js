exports.up = function(knex, Promise) {
  return knex.schema.createTable('messages', function (table) {
    table.increments('id').primary();
    table.integer('user_id').notNullable().index().references('id').inTable('users');
    table.text('body');
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema
             .dropTable('messages', table)
             .then(function () {
                console.log('Messages table was dropped!');
             });
};
