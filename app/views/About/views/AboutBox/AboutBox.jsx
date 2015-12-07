'use strict';

require('./AboutBox.scss');

var Content = require('./views/Content/Content.jsx');
var LeftTab = require('./views/LeftTab/LeftTab.jsx');

/**
 *  State:
 *        intro , progress , useterms , server , contact
 */

var AboutBox = React.createClass({
  getInitialState: function() {
    return {
      tab: "intro",
    };
  },
  componentDidMount: function() {
    this.hashChange();
    window.addEventListener('hashchange',this.hashChange);
  },
  hashChange: function() {
    var _tab = window.location.hash;
    var tab = _tab.substr(1,_tab.length-1);
    if(tab=="intro"||tab=="progress"||tab=="useterms"||tab=="server"||tab=="contact") {
       this.setState({tab: tab});
       window.scrollTo(0,0);
       if(tab=="intro") {
         document.title = "万木家平台介绍";
       } else if(tab=="progress") {
         document.title = "用户使用流程";
       } else if(tab=="useterms") {
         document.title = "万木家用户使用条款";
       } else if(tab=="server") {
         document.title = "万木家平台服务";
       } else if(tab=="contact") {
         document.title = "联系我们";
       }
    }
  },
  setTabState: function(tab) {
    this.setState({tab: tab});
  },
  render: function() {
    return (
      <div className="about-box clearfix">

        <LeftTab setTabState={this.setTabState} tab={this.state.tab} />
        <Content tab={this.state.tab} />

      </div>
    );
  }
});

module.exports = AboutBox;
