'use strict';

require('../../assets/pages/index.html');
require('./Home.scss');

require('../../assets/images/favicon.png');

let utils = require('../../lib/utils/utils');

let React = require('react');
let ReactDOM = require('react-dom');

let ItemGroup = require('./views/ItemGroup/ItemGroup.jsx');
let Header = require('../../lib/components/Header/Header.jsx');
let Footer = require('../../lib/components/Footer/Footer.jsx');

const MOCK_NAV_ITEMS = [
  {
    id: 0,
    title: '客厅',
    subpart: [
      {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/48/ec24e25b1b35f42c93efb219b2c9efe2/8a943ecab51d4d30b0a1e3bf2412bcbc.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/48/ec24e25b1b35f42c93efb219b2c9efe2/8a943ecab51d4d30b0a1e3bf2412bcbc.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/26/a48932eefa2b4dad3993371075ce494a/2b78d158cd2474ed941b1e782b995711.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/26/a48932eefa2b4dad3993371075ce494a/df749d2f7c4e6e569c89e84d39a27a70.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/4/a6222f8ec9329b83fde06479e35a4558/8a16497a488e1bebce79803b06fd43d8.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/76/ae51fa24c7c4fa6243d9d15272c1a854/80630a0eae3bf2f129bce648853dd456.jpg'
      }, {
        id: 1223,
        title: '圈椅',
        img: 'http://static.wanmujia.com/images/item/19/cc63c7dd760ea712b691b2f7c461b1e0/f1347f321d61444c1a7261e326acb40e.jpg'
      }, {
        id: 1223,
        title: '圈椅',
        img: 'http://static.wanmujia.com/images/item/30/37d43b2f5ade643361cd1aaad044a6c3/9b9d71fd85ad09f9adb72c11b62b979c.jpg'
      }, {
        id: 1223,
        title: '圈椅',
        img: 'http://static.wanmujia.com/images/item/68/7eae98baa74e9e765393753444acaa2c/56318d3866295125f817f2ca43f66111.jpg'
      }
    ]
  }, {
    id: 1,
    title: '书房',
    subpart: [
      {
        id: 1223,
        title: '圈椅',
        img: 'http://static.wanmujia.com/images/item/4/a6222f8ec9329b83fde06479e35a4558/8a16497a488e1bebce79803b06fd43d8.jpg'
      }
    ]
  }, {
    id: 2,
    title: '卧室',
    subpart: [
      {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/48/ec24e25b1b35f42c93efb219b2c9efe2/8a943ecab51d4d30b0a1e3bf2412bcbc.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/26/a48932eefa2b4dad3993371075ce494a/2b78d158cd2474ed941b1e782b995711.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/26/a48932eefa2b4dad3993371075ce494a/df749d2f7c4e6e569c89e84d39a27a70.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/4/a6222f8ec9329b83fde06479e35a4558/8a16497a488e1bebce79803b06fd43d8.jpg'
      }
    ]
  }, {
    id: 3,
    title: '餐厅',
    subpart: [
      {
        id: 1223,
        title: '圈椅',
        img: 'http://static.wanmujia.com/images/item/30/37d43b2f5ade643361cd1aaad044a6c3/9b9d71fd85ad09f9adb72c11b62b979c.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/48/ec24e25b1b35f42c93efb219b2c9efe2/8a943ecab51d4d30b0a1e3bf2412bcbc.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/26/a48932eefa2b4dad3993371075ce494a/2b78d158cd2474ed941b1e782b995711.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/26/a48932eefa2b4dad3993371075ce494a/df749d2f7c4e6e569c89e84d39a27a70.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/4/a6222f8ec9329b83fde06479e35a4558/8a16497a488e1bebce79803b06fd43d8.jpg'
      }
    ]
  }, {
    id: 4,
    title: '厨卫',
    subpart: [
      {
        id: 1223,
        title: '圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/26/a48932eefa2b4dad3993371075ce494a/2b78d158cd2474ed941b1e782b995711.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/26/a48932eefa2b4dad3993371075ce494a/df749d2f7c4e6e569c89e84d39a27a70.jpg'
      }, {
        id: 1223,
        title: '圈椅圈椅圈椅圈椅',
        img: 'http://static.wanmujia.com/images/item/4/a6222f8ec9329b83fde06479e35a4558/8a16497a488e1bebce79803b06fd43d8.jpg'
      }, {
        id: 1223,
        title: '圈椅',
        img: 'http://static.wanmujia.com/images/item/30/37d43b2f5ade643361cd1aaad044a6c3/9b9d71fd85ad09f9adb72c11b62b979c.jpg'
      }
    ]
  }
];

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

ReactDOM.render(
  <Header slides={MOCK_SLIDES} mainNav={MOCK_NAV_ITEMS} />,
  document.getElementById('header')
);

// ReactDOM.render(
//   <ItemGroup guide={MOCK_GUIDE} items={MOCK_ITEMS} />,
//   document.getElementById('item-group-1')
// );

// ReactDOM.render(
//   <Footer />,
//   document.getElementById('footer')
// );
