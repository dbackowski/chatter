# Chatter [![Build Status](https://travis-ci.org/dbackowski/chatter.svg?branch=master)](https://travis-ci.org/dbackowski/chatter)

Very simple chat (NodeJS + PostgreSQL + Socket.io + React).

![screenshot](http://i.imgur.com/HIZhqYK.png)

# Installation

Install node modules:

    yarn global add knex
    yarn global add bower
    yarn global add coffee-script
    yarn

Create PostgreSQL database "chatter":

    createdb -U postgres chatter

Run knex migrations:

    knex migrate:latest

Seed database with example users:

    knex seed:run

Start application:

    yarn start

Go to http://127.0.0.1:8080

Example users:

    login: test
    password: test

    login: test2
    password: test2

## License

Released under the MIT License.