'use strict';

//  ==================================================
//  Component: Header
//
//  Props: mainNav => object 主导航数据
//         shrink => boolean 主导航是否折叠
//
//  Dependence: ItemGroup Header Slider Footer
//
//  TODO:
//  ==================================================

require('../../assets/pages/index.html');
require('./Home.scss');

let utils = require('../../lib/utils/utils');
let Ajax = require('reqwest');

let React = require('react');
let ReactDOM = require('react-dom');

let ItemGroup = require('./views/ItemGroup/ItemGroup.jsx');
let Header = require('../../lib/components/Header/Header.jsx');
let Slider = require('../../lib/components/Slider/Slider.jsx');
let Footer = require('../../lib/components/Footer/Footer.jsx');

const MOCK_GUIDE = {
  title: '客厅',
  img: '',
  url: '/item/?scene=5',
  color: '#6e3800'
};

const MOCK_ITEMS = [
  {
    id: 13826,
    image_url: 'http://static.wanmujia.com/images/item/26/a48932eefa2b4dad3993371075ce494a/df749d2f7c4e6e569c89e84d39a27a70.jpg',
    item: '二闷橱',
    price: 168000
  }, {
    id: 13851,
    image_url: 'http://static.wanmujia.com/images/item/51/8fd2b6a905998718475dc7247ef2b9bc/e46a0c76b5b4067acbf2361fba71daeb.jpg',
    item: '小叶檀梅花条案',
    price: 368000
  }, {
    id: 13892,
    image_url: 'http://static.wanmujia.com/images/item/92/ea1dc35074d70be99f0cc54198b6bf74/3de87dd30c03d45d33175ffdb52ca458.jpg',
    item: '书架书架书架书架书架书架书架书架',
    price: 600000
  }, {
    id: 13892,
    image_url: 'http://static.wanmujia.com/images/item/92/ea1dc35074d70be99f0cc54198b6bf74/3de87dd30c03d45d33175ffdb52ca458.jpg',
    item: '书架书架书架书架书架书架书架书架',
    price: 6000
  }, {
    id: 13851,
    image_url: 'http://static.wanmujia.com/images/item/51/8fd2b6a905998718475dc7247ef2b9bc/e46a0c76b5b4067acbf2361fba71daeb.jpg',
    item: '小叶檀梅花条案',
    price: 368000
  }, {
    id: 13892,
    image_url: 'http://static.wanmujia.com/images/item/92/ea1dc35074d70be99f0cc54198b6bf74/3de87dd30c03d45d33175ffdb52ca458.jpg',
    item: '书架书架书架书架书架书架书架书架',
    price: 6000
  }, {
    id: 13851,
    image_url: 'http://static.wanmujia.com/images/item/51/8fd2b6a905998718475dc7247ef2b9bc/e46a0c76b5b4067acbf2361fba71daeb.jpg',
    item: '小叶檀梅花条案',
    price: 368000
  }, {
    id: 13851,
    image_url: 'http://static.wanmujia.com/images/item/51/8fd2b6a905998718475dc7247ef2b9bc/e46a0c76b5b4067acbf2361fba71daeb.jpg',
    item: '小叶檀梅花条案',
    price: 368000
  }
];

const MOCK_SLIDES = [
  {
    title: '标题',
    img: 'http://s.amazeui.org/media/i/demos/bing-1.jpg',
    url: ''
  }, {
    title: '标题',
    img: 'http://s.amazeui.org/media/i/demos/bing-2.jpg',
    url: '/'
  }, {
    title: '标题',
    img: 'http://s.amazeui.org/media/i/demos/bing-3.jpg',
    url: '/'
  }, {
    title: '标题',
    img: 'http://s.amazeui.org/media/i/demos/bing-4.jpg',
    url: '/'
  }
];

let Home = React.createClass({
  getInitialState: function() {
    return {
      userInfo: null  // 登录状态
    };
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
        <Header
          userInfo={this.state.userInfo}
          shrink={false}
        >
          <Slider slides={MOCK_SLIDES} />
        </Header>
        <ItemGroup
          guide={MOCK_GUIDE}
          items={MOCK_ITEMS}
        />
        <ItemGroup
          guide={MOCK_GUIDE}
          items={MOCK_ITEMS}
          color="rgb(27, 188, 155)"
        />
        <ItemGroup
          guide={MOCK_GUIDE}
          items={MOCK_ITEMS}
        />
        <Footer />
      </div>
    );
  }
});

ReactDOM.render(
  <Home />,
  document.getElementById('content')
);
