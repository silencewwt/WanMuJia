'use strict';

require('./Items.scss');

//  ==================================================
//  Component: Items
//
//  Props: items => array 商品列表
//         theme => enum(normal, tight) 主题
//         itemTipClick => array ItemTip 的回调
//
//  State:
//
//  TODO:
//  ==================================================

var Items = React.createClass({
  getDefaultProps: function() {
    return {
      theme: 'normal',  // 风格
      itemTipClick: [ // theme 为 tight 时 ItemTip 的回调
        function(ins, item) {
          console.log(item);
        },
        function(ins, item) {
          console.log(item);
        }
      ]
    }
  },
  render: function() {
    var flagStyle = {
      backgroundColor: this.props.color
    };
    return (
      <div className={'items ' + this.props.theme}>
        {
          this.props.theme === 'tight' ?
          <div className="items-flag" style={flagStyle}></div> :
          null
        }
        {this.props.items.map(function(item, i) {
          return (
            <Item
              item={item}
              key={i}
              theme={this.props.theme}
              itemTipClick={this.props.itemTipClick}
            />
          );
        }.bind(this))}
      </div>
    );
  }
});

var Item = React.createClass({
  render: function() {
    return (
      <div className="item">
        {
          // <ItemBadge  />
        }
        <ItemImg
          id={this.props.item.id}
          imgUrl={this.props.item.image_url}
          item={this.props.item.item}
        />
        <ItemInfo
          id={this.props.item.id}
          item={this.props.item.item}
          price={this.props.item.price}
        />
        {
          this.props.theme === 'normal' ?
          <ItemTip
            item={this.props.item}
            itemTipClick={this.props.itemTipClick}
          /> :
          null
        }
      </div>
    );
  }
});

var ItemBadge = React.createClass({
  getDefaultProps: function() {
    return {
      text: '新品',
      color: '#ed4300'
    }
  },
  render: function() {
    var badgeStyle = {
      backgroundColor: this.props.color
    };
    return (
      <span className="item-badge" style={badgeStyle}>
        {this.props.text}
      </span>
    );
  }
});

var ItemImg = React.createClass({
  render: function() {
    return (
      <a href={"/item/" + this.props.id} className="item-img" title={this.props.item}>
        <img src={this.props.imgUrl} alt={this.props.item} />
      </a>
    );
  }
});

var ItemInfo = React.createClass({
  formatPrice: function(price) {
    if(price / 10000 >= 1) {
      return (price / 10000).toFixed(2) + '万';
    } else if(price / 1000 >= 1) {
      return (price / 1000).toFixed(2) + '千';
    } else {
      return price.toFixed(2) + '元';
    }
  },
  render: function() {
    return (
      <div className="item-info">
        <h5>
          <a href={'/item/' + this.props.id} title={this.props.item}>
            {this.props.item}
          </a>
        </h5>
        <p className="price">
          {this.formatPrice(this.props.price)}
        </p>
      </div>
    );
  }
});

var ItemTip = React.createClass({
  getInitialState: function() {
    return {
      isFaved: false
    };
  },
  handleFavClick: function(item, e) {
    e.preventDefault();
    this.props.itemTipClick[0](this, item);
  },
  handleCompClick: function(item, e) {
    e.preventDefault();
    this.props.itemTipClick[1](this, item);
  },
  setFav: function(state) {
    this.setState({
      isFaved: state || true
    });
  },
  render: function() {
    let goFavClass = this.state.isFaved ? "go-fav faved" : "go-fav";
    return (
      <div className="item-tip">
        <span className={goFavClass}>
          <a
            href='#'
            onClick={this.handleFavClick.bind(null, this.props.item)}
          >
            去体验馆
          </a>
        </span>
        <span className="go-comp">
          <a
            href="#"
            onClick={this.handleCompClick.bind(null, this.props.item)}
          >
            对比
          </a>
        </span>
      </div>
    );
  }
});

module.exports = Items;
