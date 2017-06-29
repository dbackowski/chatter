$(document).ready(function() {
  "use strict";

  class ErrorMessage extends React.Component {
    render() {
      return (
        <div className="alert alert-danger" role="alert">
          {this.props.message}
        </div>
      )
    }
  }

  class LoginForm extends React.Component {
    constructor(props) {
      super(props);
      this.state = { login: "", password: "", error: "" };
      this.updateLogin = this.updateLogin.bind(this);
      this.updatePassword = this.updatePassword.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
    }

    updateLogin(e) {
      this.setState({ login: e.target.value })
    }

    updatePassword(e) {
      this.setState({ password: e.target.value })
    }

    onSubmit(e) {
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
    }

    render() {
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
  }

  ReactDOM.render(<LoginForm />, document.getElementById('main'));
});