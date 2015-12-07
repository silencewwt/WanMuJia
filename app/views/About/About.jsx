'use strict';

require('../../assets/pages/about.html');
require('./About.scss');
require('../../assets/images/favicon.png');

let utils = require('../../lib/utils/utils');

let React = require('react');
let ReactDOM = require('react-dom');

let Header = require('../../lib/components/Header/Header.jsx');
let Footer = require('../../lib/components/Footer/Footer.jsx');
let FloatBottomTip = require('../../lib/components/FloatBottomTip/FloatBottomTip.jsx');

let AboutBox = require('./views/AboutBox/AboutBox.jsx');

let reqwest = require('reqwest');

var About = React.createClass({
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
        <AboutBox />
        <Footer />
        <FloatBottomTip ref="floatBottomTip" />
      </div>
    );
  }
});

ReactDOM.render(
  <About />,
  document.getElementById('wrap')
);
