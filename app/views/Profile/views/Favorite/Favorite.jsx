'use strict';

//  ==================================================
//  Component: Favorite
//
//  Props: items => array 商品收藏列表
//
//  Use: views::Profile
//
//  TODO: [add] items 获取数据和分页
//        [add] 对比和取消收藏事件
//  ==================================================

var Favorite = React.createClass({
  getDefaultProps: function() {
    return {
      items: [
        {
          deleted: false,
          image_url: "http://static.wanmujia.com/images/item/64/4986512e86263cd48393274f8fdbcbf3/30f91826d0d95e6c8ce9fe53e11b6598.jpg",
          item: "\u7ea2\u9178\u679d\u8001\u6599\u548c\u548c\u7f8e\u7f8e\u9876\u7bb1\u67dc",
          item_id: 13864,
          price: 580000
        },
        {
          deleted: false,
          image_url: "http://static.wanmujia.com/images/item/79/19df4c4ed2a0b4b63dbe7a7cda54730d/26da7f8e889121b3046a8487fcba9917.jpg",
          item: "\u5357\u5b98\u5e3d\u6905",
          item_id: 13879,
          price: 42900
        },
        {
          deleted: false,
          image_url: "http://static.wanmujia.com/images/item/60/acd356270e8c9c6a9f9e804dd5acf4de/d0a0bb363f47e57f4adf63b4e2cf627b.jpg",
          item: "\u9999\u83171.55\u7c73\u7535\u89c6\u67dc",
          item_id: 13960,
          price: 28600
        },
        {
          deleted: false,
          image_url: "http://static.wanmujia.com/images/item/7/0fc1e06943399afe2bd2da45d43a0674/002520b20c469c9c9d822ca5ccfc90c7.jpg",
          item: "\u7d2b\u5149\u6a80120cm\u6e05\u5f0f\u9ad8\u51e0",
          item_id: 14007,
          price: 45000
        }
      ]
    };
  },
  render: function() {
    return (
      <div className="favorite">
        {this.props.items.map((item, i) => {
          return <Item item={item} key={i} />;
        })}
      </div>
    );
  }
});

var Item = React.createClass({
  formatPrice: function(price) {
    if(price / 10000 >= 1) {
      return (price / 10000).toFixed(2) + '万';
    } else if(price / 1000 >= 1) {
      return (price / 1000).toFixed(2) + '千';
    } else {
      return price.toFixed(2);
    }
  },
  render: function() {
    let thumbStyle = {
      background: 'url(' + this.props.item.image_url + ') no-repeat',
      backgroundSize: 'cover'
    };
    return (
      <div className="item">
        <a
          href={'item/' + this.props.item.item_id}
          className="thumb"
          style={thumbStyle}
          alt={this.props.item.item}
          title={this.props.item.item}
        >
          {this.props.item.item}
        </a>
        <a
          href={'item/' + this.props.item.item_id}
          className="title"
          title={this.props.item.item}
        >
          {this.props.item.item}
        </a>
        <span className="price">
          {this.formatPrice(this.props.item.price)}
        </span>
        <button
          className='compare'
          title="对比"
        >
          对比
        </button>
        <button
          className='unfavorite'
          title="取消收藏"
        >
          取消收藏
        </button>
      </div>
    );
  }
});

module.exports = Favorite;
