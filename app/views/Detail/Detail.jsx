'use strict';

require('../../assets/pages/detail.html');
require('./Detail.scss');
require('../../assets/images/favicon.png');

let utils = require('../../lib/utils/utils');

let React = require('react');
let ReactDOM = require('react-dom');

let Header = require('../../lib/components/Header/Header.jsx');
let Footer = require('../../lib/components/Footer/Footer.jsx');
let FloatBottomTip = require('../../lib/components/FloatBottomTip/FloatBottomTip.jsx');
let LoginPopup = require('../../lib/components/LoginPopup/LoginPopup.jsx');
let DetailBox = require('./views/DetailBox/DetailBox.jsx');

let reqwest = require('reqwest');

var Detail = React.createClass({
  getInitialState: function() {
    return {
      logined: false,
      mobile: "",
      userInfo: null,
    };
  },
  componentDidMount: function() {
    reqwest({
      url: "/logined",
      method: "get",
      success: function(resp) {
        if(resp.logined) {
          this.setState({logined: true, mobile: resp.mobile, userInfo: resp});
        }
      }.bind(this)
    });
  },
  toLogin: function() {
    // 登录
    this.refs.loginPopup.show();
  },
  addCompare: function(item) {
    this.refs.floatBottomTip.compareBarAddItem(item);
  },
  render: function() {
    return (
      <div>
        <Header
          mainNav={[]}
          shrink={true}
          userInfo={this.state.userInfo}
        />
        <DetailBox
          mobile={this.state.mobile}
          toLogin={this.toLogin}
          addCompare={this.addCompare}
        />
        <Footer />
        <FloatBottomTip ref="floatBottomTip" />
        {
          !this.state.logined?
            <LoginPopup ref="loginPopup" />:null
        }
      </div>
    );
  }
});

ReactDOM.render(
  <Detail />,
  document.getElementById('content')
);
