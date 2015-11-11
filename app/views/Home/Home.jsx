'use strict';

require('../../assets/pages/index.html');
require('./Home.scss');

let utils = require('../../lib/utils/utils');

let React = require('react');
let ReactDOM = require('react-dom');

let ItemGroup = require('./views/ItemGroup/ItemGroup.jsx');

let itemGroup = ReactDOM.render(
  <ItemGroup />,
  document.getElementById('root')
);
