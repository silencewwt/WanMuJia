'use strict';

//  ==================================================
//  Component: ItemGroup
//
//  Props:
//
//  State:
//
//  Dependence: lib::Items npm::reqwest
//
//  TODO:
//  ==================================================

let Items = require('../../../../lib/components/Items/Items.jsx');

const ItemGroup = React.createClass({
  getDefaultProps: function() {
    return {
      titleBgc: '#B15E36'
    };
  },
  render: function() {
    return (
      <div className="item-group">
        <Title
          brand={this.props.brand}
          titleBgc={this.props.titleBgc}
          scene={this.props.scene}
          id={this.props.id}
        />
        <Items
          items={this.props.items}
          theme="tight lg"
        />
      </div>
    );
  }
});

const Title = React.createClass({
  render: function() {
    let titleStyle = {
      backgroundColor: this.props.titleBgc
    };

    return (
      <div className="title" style={titleStyle}>
        <span className="scene">
          {this.props.scene + '系列'}
        </span>
        <span className="more">
          <a href={'/item/?brand=' + this.props.brand + '&scene=' + this.props.id} title="查看更多">
            查看更多
          </a>
        </span>
      </div>
    );
  }
});

module.exports = ItemGroup;
