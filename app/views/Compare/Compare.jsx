'use strict';

require('../../assets/pages/compare.html');
require('./Compare.scss');
require('../../assets/images/favicon.png');

let utils = require('../../lib/utils/utils');

let React = require('react');
let ReactDOM = require('react-dom');

let Header = require('../../lib/components/Header/Header.jsx');
let Footer = require('../../lib/components/Footer/Footer.jsx');
let FloatBottomTip = require('../../lib/components/FloatBottomTip/FloatBottomTip.jsx');
let LoginPopup = require('../../lib/components/LoginPopup/LoginPopup.jsx');

let CompareTable = require('./views/CompareTable/CompareTable.jsx');

let reqwest = require('reqwest');

let Compare = React.createClass({
  getInitialState: function() {
    return {
      logined: false,
      userInfo: null,
    };
  },
  componentDidMount: function() {
    reqwest({
      url: "/logined",
      method: "get",
      success: function(resp) {
        if(resp.logined) {
          this.setState({logined: true, userInfo: resp});
        }
      }.bind(this)
    });
  },
  toLogin: function() {
    // 登录
    this.refs.loginPopup.show();
  },
  render: function() {
    return (
      <div>
        <Header
          mainNav={[]}
          shrink={true}
          userInfo={this.state.userInfo}
        />
        <CompareTable logined={this.state.logined} toLogin={this.toLogin} />
        <Footer />
        <FloatBottomTip />

        {
          !this.state.logined?
            <LoginPopup ref="loginPopup" />:null
        }

      </div>
    );
  }
});

ReactDOM.render(
  <Compare />,
  document.getElementById('content')
);
