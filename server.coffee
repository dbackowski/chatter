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
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')))
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
  new User().where('login', req.body.login).fetch().then((user) =>
    if user && bcrypt.compareSync(req.body.password, user.get('password'))
      req.session.user_id = user.get('id')
      res.send({ error: null })
    else
      if !user
        error = 'Invalid login.'
      else
        error = 'Invalid password.'

      res.send({ error: error })
  ).catch((err) ->
    console.error err
  )

app.get('/messages', (req, res) ->
  new Message().query('orderBy', 'created_at', 'asc').fetchAll({ withRelated: ['user'] }).then((messages) ->
    res.send(messages.toJSON())
  ).catch((err) ->
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
    Message.forge({
      body: data['message'],
      user_id: socket.handshake.session.user_id
    })
    .save()
    .then((message) ->
      new Message().where('id', message.id).fetch({ withRelated: ['user'] }).then((message) ->
        io.emit('message', message.toJSON())
      ).catch((err) ->
        console.error err
      )
    )
    .catch((err) ->
      console.log(err)
    )

http.listen 8080, () ->
  console.log 'listening on *:8080'