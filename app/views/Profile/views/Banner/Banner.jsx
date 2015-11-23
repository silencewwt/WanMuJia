'use strict';

//  ==================================================
//  Component: Banner
//
//  Props: tabs => array 标签按钮
//         active => number 激活的 tab 的索引
//         onClick => function tab 改变时回调
//
//  Use: views::Profile
//
//  TODO:
//  ==================================================

var Banner = React.createClass({
  getDefaultProps: function() {
    return {
      tabs: ['收藏夹', '账户设置']
    };
  },
  render: function() {
    return (
      <div className="banner">
        <div className="container">
          <Logo />
          <TabsBtn
            items={this.props.tabs}
            active={this.props.active}
            onClick={this.props.onClick}
          />
        </div>
      </div>
    );
  }
});

var Logo = React.createClass({
  render: function() {
    return (
      <div className="logo">
        <a href="/">
          <div className="img">
            logo
          </div>
        </a>
        <div className="title">
          <p>我的万木家</p>
          <a href="/" title="返回首页">返回万木家首页</a>
        </div>
      </div>
    );
  }
});

var TabsBtn = React.createClass({
  render: function() {
    return (
      <div className="tabs">
        {this.props.items.map((item, i) => {
          let btnClass = 'tab-btn';
          if(this.props.active === i) {
            btnClass += ' active';
          }
          return (
            <a
              className={btnClass}
              href={i === 1 ? "#my" : "#favorite"}
              title={item}
              key={i}
              onClick={this.props.onClick.bind(null, i)}
            >
              {item}
            </a>
          );
        })}
      </div>
    );
  }
});

module.exports = Banner;
