$(document).ready(function() {
  var socket = io.connect("http://127.0.0.1:8080", { reconnection: true, transports: ['websocket', 'xhr-polling', 'polling', 'htmlfile', 'flashsocket'] });

  socket.on('connect_error', function() {
    $('#content').html('Wystąpił błąd, nie można pobrać danych.');
  });

  socket.on('connect', function() {
    socket.emit('connected', { user: 'test' });
  });
/*
  socket.on('message', function(msg) {
    console.log(msg);
    $('#content').append($('<div>').html(msg['user']['login'] + ': ' + formatMessage(msg['body'])));
  });
*/
/*
  socket.on('history', function(msg) {
    console.log(msg);

    msg.forEach(function(msg) {
      $('#content').append($('<div>').html(msg['user']['login'] + ': ' + formatMessage(msg['body'])));
    })
  });
*/
  function formatMessage(msg) {
    return msg.replace(new RegExp('\ ','g'), '&nbsp;').replace(new RegExp('\r?\n','g'), '<br />');
  }

  function setCaretPosition(ctrl, pos) {
    if(ctrl.setSelectionRange) {
      ctrl.focus();
      ctrl.setSelectionRange(pos,pos);
    } else if (ctrl.createTextRange) {
      var range = ctrl.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  }

/*
  $(document).on('keypress', '#input', function(e) {
    if (e.keyCode === 13) {
      socket.emit('message', { message: this.value, user_id: 1 });
      this.value = '';
    }
  });
*/
  var ChatApp = React.createClass({
    getInitialState: function() {
      socket.on('message', this.messageReceive);
      return { messages: [] };
    },

    componentDidMount: function() {
      $.ajax({
        url: '/messages',
        dataType: 'json',
        success: function(data) {
          console.log(data);
          this.setState({ messages: data });
        }.bind(this),
        failure: function(xhr, status, err) {
          console.err(url, status, err.toString());
        }.bind(this)
    });
    },

    messageReceive: function(msg) {
      console.log('dostalem wiadomosc: ' + msg);
      var messages = this.state.messages;
      messages.push(msg);
      //console.log(msg);
      this.setState({ messages: messages });
    },

    messageSend: function(e) {
      console.log(e.keyCode);
      if (e.keyCode === 13) {
        e.preventDefault();
        socket.emit('message', { message: e.target.value, user_id: 1 });
        e.target.value = '';
        setCaretPosition(e.target, 0);
      }
    },

    render: function() {
      return (
        <div>
          <div className="well" id="content">
            {this.state.messages.map(function(msg) {
              return <div key={msg['id']} dangerouslySetInnerHTML={{ __html: msg['user']['login'] + ':' + formatMessage(msg['body']) }}></div>
            })}
          </div>
          <textarea className="form-control" id="input" rows="1" onKeyDown={this.messageSend}></textarea>
        </div>
      );
    }
  });

  ReactDOM.render(<ChatApp />, document.getElementById('main'));
});
