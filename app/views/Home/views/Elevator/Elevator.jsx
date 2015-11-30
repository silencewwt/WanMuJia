'use strict';

//  ==================================================
//  Component: Elevator
//
//  Props:
//
//  State:
//
//  Dependence:
//
//  TODO: 样式和过渡和监听
//  ==================================================

const Elevator = React.createClass({
  getInitialState: function() {
    return {
      active: null  // 激活的 btn
    };
  },
  selected: function(id) {
    this.setState({
      active: id
    });
    let offset = 530 + (560 + 20) * parseInt(id);
    document.body.scrollTop = offset;
  },
  render: function() {
    return (
      <div className="elevator">
        {this.props.items.map((item, i) => {
          return (
            <Item
              key={i}
              item={item}
              extraClass={this.state.active === i ? 'active' : null}
              onClick={this.selected.bind(null, i)}
            />
          );
        })}
      </div>
    )
  }
});

const Item = React.createClass({
  render: function() {
    let itemClass = this.props.extraClass ? 'item ' + this.props.extraClass : 'item';
    return (
      <div
        className={itemClass}
        title={this.props.item.title}
        onClick={this.props.onClick}
      >
        <span className="title">
          {this.props.item.title}
        </span>
      </div>
    );
  }
});

module.exports = Elevator;
