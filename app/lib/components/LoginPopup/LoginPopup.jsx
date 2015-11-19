'use strict';

require("./LoginPopup.scss");

let React = require("react");

let LoginIn = require("../LoginIn/LoginIn.jsx");

/**
* prop: callback return login msg back , show: true/false 
*
**/


var LoginPopup = React.createClass({
  getInitialState: function() {
    return {
      show: false,
      wShow: false,
    };
  },
  componentWillReceiveProps: function(props) {
    if(this.props.show != props.show) {
      if(!this.state.show) {
        this.show();
      }else {
        this.hide();
      }
    }
  },
  show: function() {
    this.setState({wShow: true}, function() {
      setTimeout(function() {
        this.setState({show: true});
      }.bind(this), 50)
    }.bind(this));
  },
  hide: function() {
    this.setState({show: false}, function() {
      setTimeout(function() {
        this.setState({wShow: false});
      }.bind(this), 1000)
    }.bind(this));
  },
  secceed: function(msg) {
    this.hide();
    this.props.callback(msg);
  },
  render: function() {
    return (
      <div
        style={{display: (this.state.wShow?"block":"none")}}
        className={(this.state.show?"show ":"") + "login-popup"}>
        <div className="login-wrap">
          <div onClick={this.hide} className="close">+</div>
          <LoginIn callback={this.secceed} />
        </div>
        <div className="login-dimmer">
        </div>
      </div>
    );
  }
});

module.exports = LoginPopup;
