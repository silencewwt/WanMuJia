'use strict';

require('./LeftTab.scss');

const TAB_DATA = [
  {
    class: "intro",
    name: "平台介绍",
  },
  {
    class: "progress",
    name: "使用流程",
  },
  {
    class: "useterms",
    name: "用户条款",
  },
  {
    class: "server",
    name: "平台服务",
  },
  {
    class: "contact",
    name: "联系我们",
  }
];

var LeftTab = React.createClass({
  render: function() {
    var liNodes = TAB_DATA.map(function(item, idx) {
      return (
        <li key={item.class+"_li"}>
          <a
            key={item.class+"_a"}
            className={(this.props.tab==item.class?"active ":"")+item.class}
            href={"#"+item.class}
            onClick={this.props.setTabState.bind(null,item.class)} >
            {item.name}
          </a>
        </li>
      );
    }.bind(this));
    return (
      <div className="left-tab">
        <ul>
          {liNodes}
        </ul>
      </div>
    );
  }
});

module.exports = LeftTab;
