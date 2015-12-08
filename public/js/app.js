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

    messageSend: function(e) {
      console.log(e.keyCode);
      if (e.keyCode === 13) {
        e.preventDefault();
        socket.emit('message', { message: e.target.value });
        e.target.value = '';
        this.setCaretPosition(e.target, 0);
      }
    },

    render: function() {
      return (
        <div className="message-input">
          <textarea className="form-control" id="input" rows="1" autoFocus onKeyDown={this.messageSend}></textarea>
        </div>
      )
    }
  });

  var MessagesList = React.createClass({
    componentDidUpdate: function() {
      var node = ReactDOM.findDOMNode(this);
      node.scrollTop = node.scrollHeight;
    },

    render: function() {
      return (
        <div className="messages-list">
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
      return `<b>${this.props.message['user']['login']}</b>&nbsp;${moment(this.props.message['created_at']).format("YYYY-MM-DD HH:mm:ss")}:<br />${body}`;
    },

    render: function() {
      return <div className="message-body" dangerouslySetInnerHTML={{ __html: this.formatMessage() }}></div>
    }
  });

  ReactDOM.render(<ChatApp />, document.getElementById('main'));
});