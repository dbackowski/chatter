express = require('express')
session = require('express-session')({
  secret: '1234567'
  saveUninitialized: false
  resave: false
})
sharedsession = require('express-socket.io-session')
app = express()
http = require('http').Server(app)
io = require('socket.io')(http)
path = require('path')
bookshelf = require('./bookshelf')
bodyParser = require('body-parser')
bcrypt = require('bcrypt-nodejs')

User = bookshelf.Model.extend({
  tableName: 'users'
})

Message = bookshelf.Model.extend({
  tableName: 'messages'
  hasTimestamps: ['created_at']
  user: ->
    this.belongsTo(User, 'user_id')
})

app.use(session)
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
io.use(sharedsession(session))

app.get '/', (req, res) ->
  if req.session.user_id
    res.sendFile(path.join(__dirname, 'views/index.html'))
  else
    res.redirect '/login'

app.get '/login', (req, res) ->
  res.sendFile(path.join(__dirname, 'views/login.html'))

app.post '/login', (req, res) ->
  console.log req.body.login

  new User().where('login', req.body.login).fetch().then((user) =>
    if user && bcrypt.compareSync(req.body.password, user.get('password'))
      req.session.user_id = user.get('id')
      res.redirect '/'
    else
      res.redirect '/login'
  ).catch((err) ->
    console.error err
  )

app.get('/messages', (req, res) ->
  new Message().query('orderBy', 'created_at', 'asc').fetchAll({ withRelated: ['user'] }).then((messages) ->
    res.send(messages.toJSON())
  ).catch((err) ->
    console.error err
    res.send({ error: err })
  )
)

io.use (socket, next) ->
  if socket.handshake.session.user_id
    next()
  else
    next(new Error('Authentication error'))

io.on 'connection', (socket) ->
  socket.on 'message', (data) ->
    console.log data
    console.log socket.handshake.session.user_id

    Message.forge({
      body: data['message'],
      user_id: socket.handshake.session.user_id
    })
    .save()
    .then((message) ->
      new Message().where('id', message.id).fetch({ withRelated: ['user'] }).then((message) ->
        console.log message.toJSON()
        console.log message.related('user').toJSON()['login']
        #io.emit('history', messages.toJSON())

        io.emit('message', message.toJSON())
      ).catch((err) ->
        console.error err
      )

      #res.json({error: false, data: {id: user.get('id')}});
    )
    .catch((err) ->
      console.log(err)
      #res.status(500).json({error: true, data: {message: err.message}});
    )

  socket.on 'disconnect', () ->
    console.log 'disconnet'

http.listen 8080, () ->
  console.log 'listening on *:8080'