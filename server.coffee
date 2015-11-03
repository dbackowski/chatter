express = require('express')
app = express()
http = require('http').Server(app)
io = require('socket.io')(http)
path = require('path')
bookshelf = require('./bookshelf')
bodyParser = require('body-parser')

User = bookshelf.Model.extend({
  tableName: 'users'
})

Message = bookshelf.Model.extend({
  tableName: 'messages'
  hasTimestamps: ['created_at']
  user: ->
    this.belongsTo(User, 'user_id')
})

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())

app.get('/messages', (req, res) ->
  new Message().query('orderBy', 'created_at', 'asc').fetchAll({ withRelated: ['user'] }).then((messages) ->
    console.log messages.toJSON()
    res.send(messages.toJSON())
  ).catch((err) ->
    console.error err
    res.send({ error: err })
  )
)

io.on 'connection', (socket) ->
  socket.on 'connected', (data) ->
    console.log data

  socket.on 'message', (data) ->
    console.log data

    Message.forge({
      body: data['message'],
      user_id: data['user_id']
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