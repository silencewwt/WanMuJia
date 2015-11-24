'use strict';

//  ==================================================
//  Component: Profile
//
//  Props: active => integer 激活的 tab 的索引
//
//  State:  active => integer 激活的 tab 的索引
//
//  Dependence: lib::TopBar Profile::Banner Profile::Favorite Profile::Security lib::Footer
//
//  Use: views::Profile
//
//  TODO: [add] 收藏对比
//  ==================================================

require('../../assets/pages/profile.html');
require('./Profile.scss');

let Ajax = require('reqwest');

let TopBar = require('../../lib/components/TopBar/TopBar.jsx');
let Banner = require('./views/Banner/Banner.jsx');
let Favorite = require('./views/Favorite/Favorite.jsx');
let Security = require('./views/Security/Security.jsx');
let Footer = require('../../lib/components/Footer/Footer.jsx');

let Profile = React.createClass({
  getInitialState: function() {
    return {
      active: this.props.active || 0 // 激活的 tab 的索引
    };
  },
  handleTabChange: function(id, e) {  // tab 改变时回调
    this.setState({
      active: id
    });
  },
  render: function() {
    return (
      <div>
        <TopBar />
        <Banner
          active={this.state.active}
          onClick={this.handleTabChange}
        />
        <div className="container">
          {
            this.state.active ?
            <Security /> :
            <Favorite />
          }
        </div>
        <Footer />
      </div>
    );
  }
});

ReactDOM.render(
  <Profile active={window.location.hash === '#my' ? 1 : 0} />,
  document.getElementById('content')
);
