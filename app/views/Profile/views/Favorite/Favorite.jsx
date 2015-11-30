'use strict';

//  ==================================================
//  Component: Favorite
//
//  State:  items => array 收藏的商品列表
//          pages => null|integer 分页总页码
//          activePage => null|integer 当前页码
//
//  Dependence: lib::Pagination npm::reqwest
//
//  Use: views::Profile
//
//  TODO: [add] 对比
//  ==================================================

let Ajax = require('reqwest');
let Pagination = require('../../../../lib/components/Pagination/Pagination.jsx');

let Favorite = React.createClass({
  getInitialState: function() {
    return {
      items: [],  // 收藏的商品列表
      pages: null,  // 分页总页码
      activePage: null  // 当前页码
    };
  },
  componentDidMount: function() {
    this.getInitialItems();
  },
  getItemsByPage: function(page, callback) {
    let _this = this;
    Ajax({  // 获取收藏信息
      url: '/collection',
      method: 'get',
      data: {
        page: page
      },
      success: function (res) {
        callback && callback(res);
        _this.setState({
          items: res.collections,
          pages: res.pages,
          activePage: page
        });
      }
    })
  },
  addFav: function(item) {
    Ajax({  // 获取收藏信息
      url: '/collection',
      method: 'post',
      data: {
        item: item
      },
      success: function (res) {
        console.log(res);
      }
    })
  },
  getInitialItems: function() {
    this.getItemsByPage(1);
    // for(let $ = 0; $ < 40; $++) {
    //   this.addFav($);
    // }
  },
  handlePageChanged: function(page) {
    this.getItemsByPage(page);
  },
  render: function() {
    return (
      <div className="favorite">
        {this.state.items.map((item, i) => {
          return <Item
            item={item}
            key={i}
            getItemsByPage={this.getItemsByPage}
            activePage={this.state.activePage}
            getItemsByPage={this.getItemsByPage}
            handleCompare={this.props.handleCompare}
          />;
        })}
        <Pagination
          pages={this.state.pages}
          activePage={this.state.activePage}
          selected={this.handlePageChanged}
          quickGo={true}
        />
      </div>
    );
  }
});

let Item = React.createClass({
  handleCompare: function(item) {
    this.props.handleCompare(item);
  },
  formatPrice: function(price) {
    if(price / 10000 >= 1) {
      return (price / 10000).toFixed(2) + '万';
    } else if(price / 1000 >= 1) {
      return (price / 1000).toFixed(2) + '千';
    } else {
      return price.toFixed(2) + '元';
    }
  },
  handleUnfavBtnClick: function(item) {
    let _this = this;
    Ajax({  // 取消收藏
      url: '/collection',
      method: 'delete',
      data: {
        item: item
      },
      success: function (res) {
        if(res.success) {
          _this.props.getItemsByPage(_this.props.activePage);
        }
      }
    })
  },
  render: function() {
    let thumbStyle = {
      background: 'url(' + this.props.item.image_url + ') no-repeat',
      backgroundSize: 'cover'
    };
    return (
      <div className="item">
        <a
          href={'item/' + this.props.item.id}
          className="thumb"
          style={thumbStyle}
          alt={this.props.item.item}
          title={this.props.item.item}
        >
          {this.props.item.item}
        </a>
        <a
          href={'item/' + this.props.item.id}
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
          onClick={this.handleCompare.bind(null, this.props.item)}
        >
          对比
        </button>
        <button
          className='unfavorite'
          title="取消收藏"
          onClick={this.handleUnfavBtnClick.bind(null, this.props.item.id)}
        >
          取消收藏
        </button>
      </div>
    );
  }
});

module.exports = Favorite;
