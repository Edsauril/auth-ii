import React, { Component } from "react";
import axios from "axios";

const initialUser = {
  username: "",
  password: "",
  department: ""
};

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: { ...initialUser },
      message: ""
    };
  }
  inputHandler = event => {
    const { name, value } = event.target;
    this.setState({ user: { ...this.state.user, [name]: value } });
  };
  submitHandler = event => {
    event.preventDefault();
    axios
      .post("http://localhost:9000/register", this.state.user)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            message: "Registration Success",
            user: { ...initialUser }
          });
        } else {
          throw new Error();
        }
      })
      .catch(err =>
        this.setState({
          message: "Registration Failed",
          user: { ...initialUser }
        })
      );
  };

  render() {
    return (
      <div>
        <form onSubmit={this.submitHandler}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={this.state.user.username}
            onChange={this.inputHandler}
          />
        </form>
        <form onSubmit={this.submitHandler}>
          <label htmlFor="password">Password</label>
          <input
            type="text"
            id="password"
            name="password"
            value={this.state.user.password}
            onChange={this.inputHandler}
          />
        </form>
        <form onSubmit={this.submitHandler}>
          <label htmlFor="department">Department</label>
          <input
            type="text"
            id="department"
            name="department"
            value={this.state.user.department}
            onChange={this.inputHandler}
          />
        </form>
        {this.state.message ? <h4>{this.state.message}</h4> : undefined}
      </div>
    );
  }
}
