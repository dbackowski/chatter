'use strict';

exports.seed = function(knex, Promise) {
  return Promise.join(
    // Deletes ALL existing entries
    knex('users').del(),

    // Inserts seed entries
    knex('users').insert({id: 1, login: 'test'}),
    knex('users').insert({id: 2, login: 'test2'})
  );
};
