$(document).ready(function() {
  "use strict";

  class ChatApp extends React.Component {
    constructor(props) {
      super(props);
      this.state = { messages: [], users: [] };
    }

    componentDidMount() {
      this.socket = io();
      this.socket.on('users', this.usersList.bind(this));
      this.socket.on('message', this.messageReceive.bind(this));
      this.socket.on('connect_error', this.connectionError.bind(this));

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
    }

    connectionError() {
      $('#main').html('<p><div class="alert alert-danger">An error occured, please refresh the page and try again.</div></p>');
    }

    usersList(users) {
      this.setState({ users: users });
    }

    messageReceive(msg) {
      let messages = this.state.messages;
      messages.push(msg);
      this.setState({ messages: messages });
    }

    render() {
      return (
        <div className='chatApp'>
          <div className="row">
            <div className="col-md-1">
              <UsersList users={this.state.users}/>
            </div>
            <div className="col-md-11">
              <MessagesList messages={this.state.messages}/>
              <MessageForm socket={this.socket}/>
            </div>
          </div>
        </div>
      )
    }
  }

  class UsersList extends React.Component {
    render() {
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
  }

  class MessageForm extends React.Component {
    constructor(props) {
      super(props);
      this.messageSend = this.messageSend.bind(this);
    }

    setCaretPosition(ctrl, pos) {
      if (ctrl.setSelectionRange) {
        ctrl.focus();
        ctrl.setSelectionRange(pos, pos);
      } else if (ctrl.createTextRange) {
        let range = ctrl.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
      }
    }

    messageSend(e) {
      if (e.keyCode === 13) {
        e.preventDefault();

        if (e.target.value) {
          this.props.socket.emit('message', { message: e.target.value });
          e.target.value = '';
        }

        this.setCaretPosition(e.target, 100);
      }
    }

    render() {
      return (
        <div className="message-input">
          <textarea className="form-control" id="input" rows="1" autoFocus onKeyDown={this.messageSend}></textarea>
        </div>
      )
    }
  }

  class MessagesList extends React.Component {
    constructor(props) {
      super(props);
    }

    componentWillUpdate() {
      let node = ReactDOM.findDOMNode(this);
      this.shouldScrollBottom = Math.ceil(node.scrollTop) + 1 + node.offsetHeight >= node.scrollHeight;
    }

    componentDidUpdate() {
      if (this.shouldScrollBottom) {
        let node = ReactDOM.findDOMNode(this);
        node.scrollTop = node.scrollHeight
      }
    }

    render() {
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
  }

  class Message extends React.Component {
    formatMessage() {
      let body = this.props.message['body'].replace(new RegExp('\ ','g'), '&nbsp;').replace(new RegExp('\r?\n','g'), '<br />');
      return `<b>${this.props.message['user']['login']}</b>&nbsp;${moment(this.props.message['created_at']).format("YYYY-MM-DD HH:mm:ss")}<br />${body}`;
    }

    render() {
      return <div className="message-body" dangerouslySetInnerHTML={{ __html: this.formatMessage() }}></div>
    }
  }

  ReactDOM.render(<ChatApp />, document.getElementById('main'));
});
