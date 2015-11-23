'use strict';

exports.seed = function(knex, Promise) {
  return Promise.join(
    // Deletes ALL existing entries
    knex('users').del(),

    // Inserts seed entries
    knex('users').insert({id: 1, login: 'test', password: '$2a$10$RJNklunA0gw81CNL4tJy6OJWa1ulHElFfmNPIRNFrhNdyT.VTL4B2'}),
    knex('users').insert({id: 2, login: 'test2', password: '$2a$10$769EGw8ZVptU9U.09FOBNuIL2hsXL4eb8JCLjeiyOfXJon0A/hn6C'})
  );
};
