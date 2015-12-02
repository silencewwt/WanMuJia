'use strict';

require('./FooterLink.scss')

let React= require('react');

//  ==================================================
//  Component: FooterLink
//
//  Props:
//
//  Dependence:
//
//  Use: Footer
//
//  TODO:
//  ==================================================

var FooterLink = React.createClass({
  getDefaultProps: function() {
    return {
      links: [
        [{
          title: '用户指南',
          link: '#'
        }, {
          title: '使用流程',
          link: '#'
        }, {
          title: '用户条款',
          link: '#'
        }], [{
          title: '企业指南',
          link: '#'
        }, {
          title: '企业入驻',
          link: '#'
        }, {
          title: '入驻条款',
          link: '#'
        }], [{
          title: '关于我们',
          link: '#'
        }, {
          title: '联系方式',
          link: '#'
        }, {
          title: '平台介绍',
          link: '#'
        }]
      ]
    }
  },
  render: function() {
    return (
      <div className="footer-link">
        {this.props.links.map(function(link, i) {
          return (
            <ul className="link-group" key={i}>
              {link.map(function(item, j) {
                return (
                  <li key={i + '.' + j}>
                    <a
                      href={j === 0 ? null : item.link}
                      className={j === 0 ? 'title' : null}
                    >
                      {item.title}
                    </a>
                  </li>
                )
              })}
            </ul>
          )
        })}
      </div>
    );
  }
});

module.exports = FooterLink;
