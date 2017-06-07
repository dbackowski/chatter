$(document).ready(function() {
  "use strict";

  var socket = io.connect("http://localhost:8080", { reconnection: true, transports: ['websocket', 'xhr-polling', 'polling', 'htmlfile', 'flashsocket'] });

  var ChatApp = React.createClass({
    getInitialState: function() {
      socket.on('users', this.usersList);
      socket.on('message', this.messageReceive);
      socket.on('connect_error', this.connectionError);
      return { messages: [], users: [] };
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

    usersList: function(users) {
      this.setState({ users: users });
    },

    messageReceive: function(msg) {
      var messages = this.state.messages;
      messages.push(msg);
      this.setState({ messages: messages });
    },

    render: function() {
      return (
        <div className='chatApp'>
          <div className="row">
            <div className="col-md-1">
              <UsersList users={this.state.users}/>
            </div>
            <div className="col-md-11">
              <MessagesList messages={this.state.messages}/>
              <MessageForm />
            </div>
          </div>
        </div>
      )
    }
  });

  var UsersList = React.createClass({
    render: function() {
      return (
        <div>
          <b>Users:</b>
          <ul>
            {this.props.users.map(function(user) {
              return <li key={user}>{user}</li>;
            })}
          </ul>
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

        if (e.target.value) {
          socket.emit('message', { message: e.target.value });
          e.target.value = '';
        }

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
      var node = ReactDOM.findDOMNode(this);
      this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
    },

    componentDidUpdate: function() {
      if (this.shouldScrollBottom) {
        var node = ReactDOM.findDOMNode(this);
        node.scrollTop = node.scrollHeight
      }
    },

    render: function() {
      return (
        <div className="messages-list">
          <div id="content">
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
      return `<b>${this.props.message['user']['login']}</b>&nbsp;${moment(this.props.message['created_at']).format("YYYY-MM-DD HH:mm:ss")}<br />${body}`;
    },

    render: function() {
      return <div className="message-body" dangerouslySetInnerHTML={{ __html: this.formatMessage() }}></div>
    }
  });

  ReactDOM.render(<ChatApp />, document.getElementById('main'));
});
