$(document).ready(function() {
  "use strict";

  var LoginForm = React.createClass({
    getInitialState: function() {
      return { login: "", password: "", error: "" }
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
          //this.setState({data: data});
          console.log('zalogowalem');
          if (data.error) {
            console.log(data.error);
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
          {this.state.error}
          <div className="form-group">
            <label htmlFor="login">Login</label>
            <input type="text" name="login" className="form-control" placeholder="Login" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" name="password" className="form-control" placeholder="Password" />
          </div>
          <button type="submit" className="btn btn-default">Login</button>
        </form>
      )
    }
  });

  ReactDOM.render(<LoginForm />, document.getElementById('main'));
});