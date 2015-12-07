'use strict';

require('../../assets/pages/404.html');
require('./404.scss');
require('../../assets/images/favicon.png');

let utils = require('../../lib/utils/utils');

let React = require('react');
let ReactDOM = require('react-dom');

let Header = require('../../lib/components/Header/Header.jsx');
let Footer = require('../../lib/components/Footer/Footer.jsx');
let FloatBottomTip = require('../../lib/components/FloatBottomTip/FloatBottomTip.jsx');

let reqwest = require('reqwest');

var NotFound = React.createClass({
  getInitialState: function() {
    return {
      userInfo: null,
    };
  },
  componentDidMount: function() {
    reqwest({
      url: "/logined",
      method: "get",
      success: function(resp) {
        if(resp.logined) {
          this.setState({userInfo: resp});
        }
      }.bind(this)
    });
  },
  addCompare: function(item) {
    this.refs.floatBottomTip.compareBarAddItem(item);
  },
  render: function() {
    return (
      <div>
        <Header
          shrink={true}
          userInfo={this.state.userInfo}
        />
        <NotFoundCont />
        <Footer />
        <FloatBottomTip ref="floatBottomTip" />
      </div>
    );
  }
});

var NotFoundCont = React.createClass({
  render: function() {
    return (
      <div className="not-found">
        <div className="img"></div>
        <div className="cont">
          <div className="title">抱歉！页面无法访问...</div>
          <div className="can">你可以：稍后再试</div>
          <div className="back">
            <span className="tip">返回</span>
            <a href="/">万木家首页</a>
          </div>
        </div>
      </div>
    );
  }
});

ReactDOM.render(
  <NotFound />,
  document.getElementById('wrap')
);
