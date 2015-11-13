$(document).ready(function() {
  "use strict";

  var socket = io.connect("http://127.0.0.1:8080", { reconnection: true, transports: ['websocket', 'xhr-polling', 'polling', 'htmlfile', 'flashsocket'] });

  socket.on('connect', function() {
    socket.emit('connected', { user: 'test' });
  });

  var ChatApp = React.createClass({
    getInitialState: function() {
      socket.on('message', this.messageReceive);
      socket.on('connect_error', this.connectionError);
      return { messages: [] };
    },

    componentDidMount: function() {
      $.ajax({
        url: '/messages',
        dataType: 'json',
        success: (data) => {
          console.log(data);
          this.setState({ messages: data });
        },
        failure: (xhr, status, err) => {
          console.err(url, status, err.toString());
        }
      });
    },

    connectionError: function() {
      $('#content').html('Wystąpił błąd, nie można pobrać danych.');
    },

    setCaretPosition: function (ctrl, pos) {
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
    },

    messageReceive: function(msg) {
      console.log('dostalem wiadomosc: ' + msg);
      var messages = this.state.messages;
      messages.push(msg);
      //console.log(msg);
      this.setState({ messages: messages });
    },

    render: function() {
      return (
        <div className='chatApp'>
          <MessagesList messages={this.state.messages}/>
          <MessageForm />
        </div>
      )
    }
  });

  var MessageForm = React.createClass({
    messageSend: function(e) {
      console.log(e.keyCode);
      if (e.keyCode === 13) {
        e.preventDefault();
        socket.emit('message', { message: e.target.value, user_id: 1 });
        e.target.value = '';
        this.setCaretPosition(e.target, 0);
      }
    },

    render: function() {
      return (
        <textarea className="form-control" id="input" rows="1" onKeyDown={this.messageSend}></textarea>
      )
    }
  });

  var MessagesList = React.createClass({
    render: function() {
      return (
        <div>
          <div className="well" id="content">
            {this.props.messages.map(function(msg) {
              return <Message key={msg['id']} message={msg}></Message>
            })}
          </div>
        </div>
      );
    }
  });

  var Message = React.createClass({
    formatMessage: function() {
      var body = this.props.message['body'].replace(new RegExp('\ ','g'), '&nbsp;').replace(new RegExp('\r?\n','g'), '<br />');
      return `${this.props.message['user']['login']}: ${body}`;
    },

    render: function() {
      return <div dangerouslySetInnerHTML={{ __html: this.formatMessage() }}></div>
    }
  });

  ReactDOM.render(<ChatApp />, document.getElementById('main'));
});
