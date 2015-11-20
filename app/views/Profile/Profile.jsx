'use strict';

//  ==================================================
//  Component: Profile
//
//  Props: active => number 激活的 tab 的索引
//
//  State:  active => number 激活的 tab 的索引
//          userInfo  => object 用户登录信息
//
//  Dependence: lib::TopBar Profile::Banner Profile::Favorite Profile::Security lib::Footer
//
//  Use: views::Profile
//
//  TODO: [add] 收藏分页
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
      active: this.props.active || 0, // 激活的 tab 的索引
      userInfo: null // 用户登录信息
    };
  },
  handleTabChange: function(id, e) {  // tab 改变时回调
    this.setState({
      active: id
    });
  },
  componentWillMount: function() {
    Ajax({  // 模拟登录
      url: '/',
      method: 'post',
      data: {
        username: 18829212006,
        password: 123456
      },
      success: function (res) {
        console.log(res);
      }
    })
  },
  render: function() {
    return (
      <div>
        <TopBar userInfo={this.state.userInfo} />
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
