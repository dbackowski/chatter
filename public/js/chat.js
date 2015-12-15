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
          this.setState({ messages: data });
        },
        failure: (xhr, status, err) => {
          this.connectionError();
        }
      });
    },

    connectionError: function() {
      $('#main').html('<p><div class="alert alert-danger">An error occured, please refresh the page and try again.</div></p>');
    },

    messageReceive: function(msg) {
      var messages = this.state.messages;
      messages.push(msg);
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
    componentWillUpdate: function() {
      var node = this.getDOMNode();
      this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
    },

    componentDidUpdate: function() {
      if (this.shouldScrollBottom) {
        var node = this.getDOMNode();
        node.scrollTop = node.scrollHeight
      }
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
