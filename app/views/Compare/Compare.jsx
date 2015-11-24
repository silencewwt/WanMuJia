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

let Compare = React.createClass({
  render: function() {
    return (
      <div>
        <Header
          mainNav={[]}
          shrink={true}
        />
        <Footer />
        <FloatBottomTip />
      </div>
    );
  }
});

ReactDOM.render(
  <Compare />,
  document.getElementById('content')
);
