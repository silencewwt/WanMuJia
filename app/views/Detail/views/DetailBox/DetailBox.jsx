'use strict';

require('./DetailBox.scss');

let React = require('react');

let DetailMeta = require('./views/DetailMeta/DetailMeta.jsx');
let DetailContent = require('./views/DetailContent/DetailContent.jsx');

let utils = require('../../../../lib/utils/utils.js');
let reqwest = require('reqwest');

var DetailBox = React.createClass({
  getInitialState: function() {
    return {
      data: null,
    };
  },
  componentDidMount: function() {
    var pathnameArr = (window.location.pathname).split('/');
    var itemId = pathnameArr[pathnameArr.length - 1];
    reqwest({
      url: "/item/"+itemId+"?format=json&action=detail",
      method: "get",
      success: function(resp) {
        this.setState({data: resp});
      }.bind(this)
    });
  },
  render: function() {
    if(!this.state.data) {
      return <div className="detail-box"></div>;
    }
    return (
      <div className="detail-box">
        <DetailMeta
          data={this.state.data}
          mobile={this.props.mobile}
          addCompare={this.props.addCompare}
          toLogin={this.props.toLogin}
        />

        <div className="brand-banner"></div>

        <DetailContent data={this.state.data.item} />
      </div>
    );
  }
});

module.exports = DetailBox;
