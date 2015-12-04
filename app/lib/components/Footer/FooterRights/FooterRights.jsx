'use strict';

require('./FooterRights.scss')

let React= require('react');

//  ==================================================
//  Component: FooterRights
//
//  Props:
//
//  Dependence:
//
//  Use: Footer
//
//  TODO:
//  ==================================================

var FooterRights = React.createClass({
  render: function() {
    return (
      <div className="footer-rights">
        <div className="container">
          <div>
            <span>&copy; 2015 万木家&trade; 版权所有 | </span>
            <a href="http://www.miit.gov.cn/" target="_blank">
              京ICP备15040704号
            </a>
          </div>
          <div>
            北京静雅居科技有限公司
          </div>
        </div>
      </div>
    );
  }
});

module.exports = FooterRights;
