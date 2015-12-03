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
      active: this.props.active  // 激活的 btn
    };
  },
  componentWillReceiveProps: function(nextProps) {
    if(nextProps.active !== this.state.active) {
      this.setState({
        active: nextProps.active
      });
    }
  },
  selected: function(id) {
    this.setState({
      active: id
    });
    let offset = 530 + (560 + 20) * parseInt(id);
    document.body.scrollTop = offset;
  },
  render: function() {
    let elevatorStyle = {
      top: (window.innerHeight - 350) / 2 + 'px',
      left: (window.innerWidth - 1200) / 2 - 70 + 'px'
    };
    return (
      <div className="elevator" style={elevatorStyle}>
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
    let itemStyle = this.props.extraClass ? {
      backgroundColor: this.props.item.color,
      borderColor: this.props.item.color
    } : null;
    return (
      <div
        className={itemClass}
        title={this.props.item.title}
        onClick={this.props.onClick}
        style={itemStyle}
      >
        <span className="title">
          {this.props.item.title}
        </span>
      </div>
    );
  }
});

module.exports = Elevator;
