# Chatter

Very simple chat (NodeJS + PostgreSQL + Socket.io + React).

# Installation

Install node modules:

    npm install knex -g
    npm install bower -g
    npm install coffee-script -g
    npm install
    bower install

Create PostgreSQL database "chatter":
    
    createdb -U postgres chatter

Run knex migrations:
    
    knex migrate:latest

Seed database with example users:

    knex seed:run

Start application:
    
    npm start

Go to http://127.0.0.1:8080

Example users:

    login: test
    password: test

    login: test2
    password: test2
