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

      var login = e.target.login.value.trim();
      var password = e.target.password.value.trim();

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
          this.setState({ error: 'An error occured, unable to log in.'})
        }
      });
    },

    render: function() {
      return (
        <form className="form-signin" onSubmit={this.onSubmit}>
          { this.state.error ? <ErrorMessage message={this.state.error} /> : null }

          <div className="form-group">
            <input type="text" name="login" autoFocus className="form-control" onChange={this.updateLogin} placeholder="Login" />
          </div>
          <div className="form-group">
            <input type="password" name="password" className="form-control" onChange={this.updatePassword} placeholder="Password" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={!this.state.login || !this.state.password}>Login</button>
        </form>
      )
    }
  });

  ReactDOM.render(<LoginForm />, document.getElementById('main'));
});