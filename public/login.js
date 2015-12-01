$(document).ready(function() {
  "use strict";

  var ErrorMessage = React.createClass({
    render: function() {
      return (
        <div className="alert alert-danger" role="alert">
          {this.props.message}
        </div>
      )
    }
  });

  var LoginForm = React.createClass({
    getInitialState: function() {
      return { login: "", password: "", error: "" }
    },

    updateLogin: function(e) {
      this.setState({ login: e.target.value })
    },

    updatePassword: function(e) {
      this.setState({ password: e.target.value })
    },

    onSubmit: function(e) {
      e.preventDefault();
      console.log('zatwierdzam formularz');

      var login = e.target.login.value.trim();
      var password = e.target.password.value.trim();

      console.log(login);
      console.log(password);

      if(!login || !password) {
        return;
      }

      $.ajax({
        url: '/login',
        dataType: 'json',
        type: 'POST',
        data: { login: login, password: password },
        success: (data) => {
          if (data.error) {
            this.setState({ error: data.error });
          } else {
            window.location.href = '/';
          }
        },
        error: (xhr, status, err) => {
          console.error(this.props.url, status, err.toString());
        }
      });
    },

    render: function() {
      return (
        <form onSubmit={this.onSubmit}>
          { this.state.error ? <ErrorMessage message={this.state.error} /> : null }

          <div className="form-group">
            <label htmlFor="login">Login</label>
            <input type="text" name="login" className="form-control" onChange={this.updateLogin} placeholder="Login" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" name="password" className="form-control" onChange={this.updatePassword} placeholder="Password" />
          </div>
          <button type="submit" className="btn btn-default" disabled={!this.state.login || !this.state.password}>Login</button>
        </form>
      )
    }
  });

  ReactDOM.render(<LoginForm />, document.getElementById('main'));
});