'use strict';

//  ==================================================
//  Component: Profile
//
//  Props: active => integer 激活的 tab 的索引
//
//  State:  active => integer 激活的 tab 的索引
//          userInfo => object|null 用户登录信息
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
let LoginPopup = require('../../lib/components/LoginPopup/LoginPopup.jsx');
let Banner = require('./views/Banner/Banner.jsx');
let Favorite = require('./views/Favorite/Favorite.jsx');
let Security = require('./views/Security/Security.jsx');
let FloatBottomTip = require('../../lib/components/FloatBottomTip/FloatBottomTip.jsx');
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
  handleCompare: function(item) {
    this.refs.compareBar.compareBarAddItem(item);
  },
  componentDidMount: function() {
    let _this = this;
    Ajax({  // 获取个人信息
      url: '/logined',
      method: 'get',
      success: function (res) {
        if(res.logined) {
          _this.setState({
            userInfo: res
          });
        }
      }
    })
  },
  render: function() {
    return (
      <div>
        <TopBar
          userInfo={this.state.userInfo}
        />
        <Banner
          active={this.state.active}
          onClick={this.handleTabChange}
        />
        {
          this.state.userInfo ?
          null :
          <LoginPopup show={true} />
        }
        <div className="container">
          {
            this.state.active ?
            <Security userInfo={this.state.userInfo} /> :
            <Favorite handleCompare={this.handleCompare} />
          }
        </div>
        <FloatBottomTip ref="compareBar" />
        <Footer />
      </div>
    );
  }
});

ReactDOM.render(
  <Profile active={window.location.hash === '#my' ? 1 : 0} />,
  document.getElementById('content')
);
