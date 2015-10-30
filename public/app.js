$(document).ready(function() {
  var socket = io.connect("http://127.0.0.1:8080", { reconnection: true, transports: ['websocket', 'xhr-polling', 'polling', 'htmlfile', 'flashsocket'] });

  socket.on('connect_error', function() {
    $('#content').html('Wystąpił błąd, nie można pobrać danych.');
  });

  socket.on('connect', function() {
    socket.emit('connected', { user: 'test' });
  });

  socket.on('message', function(msg) {
    console.log(msg);
    $('#content').append($('<div>').html(msg['user']['login'] + ': ' + formatMessage(msg['body'])));
  });

  socket.on('history', function(msg) {
    console.log(msg);

    msg.forEach(function(msg) {
      $('#content').append($('<div>').html(msg['user']['login'] + ': ' + formatMessage(msg['body'])));
    })
  });

  function formatMessage(msg) {
    return msg.replace(new RegExp('\ ','g'), '&nbsp;').replace(new RegExp('\r?\n','g'), '<br />');
  }

  $(document).on('keypress', '#input', function(e) {
    if (e.keyCode === 13) {
      socket.emit('message', { message: this.value, user_id: 1 });
      this.value = '';
    }
  });
});