'use strict'

//  ==================================================
//  Component: Pagination
//
//  Props: pages => integer 总页数
//
//  Theme: light dark
//
//  TODO:
//  ==================================================

require('./Pagination.scss');

var Pagination = React.createClass({
  propTypes: {
    pages: React.PropTypes.number
  },
  getInitialState: function() {
    return {
      activePage: this.props.activePage
    };
  },
  getDefaultProps: function() {
    return {
      activePage: 1, // 激活页初始值
      first: null, // 首页 null || string
      prev: "上一页", // 上一页 null || string
      basePages: 2, // first prev base ... mid ... next last
      midPages: 5, // first prev base ... mid ... next last
      ellipsis: true, // 省略号 boolen
      next: "下一页", // 下一页 null || string
      last: null, // 末页 null || string
      theme: "light", // 主题
      quickGo: false, // 概览和快速切换 boolen
      selected: function(page) { // 页码切换时回调
        console.log('当前页：' + page);
      }
    }
  },
  componentWillReceiveProps: function(nextProps) {
    if(nextProps.activePage !== this.props.activePage) {
      this.setActivePage(nextProps.activePage);
    }
  },
  setActivePage: function(page) {
    this.setState({
      activePage: page
    });
  },
  render: function() {
    var pagiClass = (this.props.theme === 'light') ? 'pagination' : 'pagination ' + this.props.theme;
    return (
      <div className={pagiClass}>
        <PagiMain
          {...this.props}
          activePage={this.state.activePage}
          setActivePage={this.setActivePage}
        />
        {this.props.quickGo ? <PagiOverview pages={this.props.pages} /> : null}
        {this.props.quickGo ? <PagiQuickGo pages={this.props.pages} setActivePage={this.setActivePage} /> : null}
      </div>
  )
  }
});

var PagiMain = React.createClass({
  getInitialState: function() {
    return {
      pageItems: this.getPageItems(this.props.activePage)
    };
  },
  componentWillReceiveProps: function(nextProps) {
    if(nextProps.activePage !== this.props.activePage || nextProps.pages !== this.props.pages) {
      var pageItems = this.getPageItems(nextProps.activePage, nextProps);
      this.setState({
        pageItems: pageItems
      });
      (nextProps.activePage !== this.props.activePage) && this.props.selected(nextProps.activePage);
    }
  },
  handleItemClick: function(type, page, pages) {
    if (type === "first") {
      page = 1;
    } else if (type === "prev") {
      page = (this.props.activePage === 1) ? 1 : this.props.activePage - 1;
    } else if (type === "next") {
      page = (this.props.activePage === this.props.pages) ? this.props.pages : this.props.activePage + 1;
    } else if (type === "last") {
      page = this.props.pages;
    } else {
      page = page > this.props.pages ? this.props.pages : page;
    }
    if (page !== this.props.activePage) {
      this.props.setActivePage(page);
    }
  },
  getPageItems: function(n, nextProps) {
    var list = [];
    var b = nextProps ? nextProps.basePages : this.props.basePages;
    var m = nextProps ? nextProps.midPages : this.props.midPages;
    var p = nextProps ? nextProps.pages : this.props.pages;
    if(n <= parseInt(m / 2) + 1) { // 1
      list = this._getSeriesNumber(1, p <= b + m ? p : m);
      (p > b + m) && list.push(0);
    } else if((n <= parseInt(m / 2) + 1 + b) || p <= b + m)  { // 1'
      list = this._getSeriesNumber(1, p <= b + m ? p : n + 2);
      (p > b + m) && list.push(0);
    } else if((n < p - parseInt(m / 2) - 1)) {  // 2
      list = this._getSeriesNumber(1, nextProps ? nextProps.basePages : this.props.basePages);
      list.push(0);
      list = list.concat(this._getSeriesNumber(n-2, m));
      if(p > m + b + 2) {
        list.push(0);
      }
    } else if(n === p - parseInt(m / 2) - 1) {  // 3
      list = this._getSeriesNumber(1, nextProps ? nextProps.basePages : this.props.basePages);
      list.push(0);
      list = list.concat(this._getSeriesNumber(p - m, m + 1));
    } else {  // 4
      list = this._getSeriesNumber(1, nextProps ? nextProps.basePages : this.props.basePages);
      list.push(0);
      list = list.concat(this._getSeriesNumber(p - m + 1, m));
    }
    return list;
  },
  _getSeriesNumber: function(start, length) {
    start = start;
    length = length;
    var series = [];
    while(length--) {
      series.push(start++);
    }
    return series;
  },
  render: function() {
    var startBlock = [];
    var endBlock = [];
    if(this.props.pages > 0) {
      if(this.props.first) {
        startBlock.push(<PaginationBtn key='first' text={this.props.first} disabled={(this.props.activePage === 1) ? true : false} type="first" changePage={this.handleItemClick.bind(this, 'first')} />);
      }
      if(this.props.prev) {
        startBlock.push(<PaginationBtn key='prev' text={this.props.prev} disabled={(this.props.activePage === 1) ? true : false} type="prev" changePage={this.handleItemClick.bind(this, 'prev')} />);
      }
      if(this.props.next) {
        endBlock.push(<PaginationBtn key='next' text={this.props.next} type="next" disabled={(this.props.activePage === this.props.pages) ? true : false} changePage={this.handleItemClick.bind(this, 'next')} />);
      }
      if(this.props.last) {
        endBlock.push(<PaginationBtn key='last' text={this.props.last} type="last" disabled={(this.props.activePage === this.props.pages) ? true : false} changePage={this.handleItemClick.bind(this, 'last')} />);
      }
    }
    return (
      <ul className="pagi-main">
        {startBlock}
        {
          (this.props.pages > 0) && this.state.pageItems.map(function(item, i) {
              return (
                <PaginationBtn key={i} text={item} type={item ? 'num' : 'dot'} active={(item === this.props.activePage) ? true : false} changePage={item ? this.handleItemClick.bind(this, 'num', item) : null} />
              )
            }.bind(this))
        }
        {endBlock}
      </ul>
    )
  }
});

var PaginationBtn = React.createClass({
  getDefaultProps: function() {
    return {
      text: 1,
      type: "num"
    };
  },
  render: function() {
    var text = (this.props.type === 'dot') ? '...' : this.props.text;
    var itemClass = this.props.active
      ? "item active"
      : "item";
    if(this.props.type !== 'num') {
      itemClass += (" page " + this.props.type);
    }
    if(this.props.disabled) {
      itemClass += ' disabled';
    }
    return (
      <li className={itemClass} onClick={this.props.changePage}>
        <a>{text}</a>
      </li>
    );
  }
});

var PagiOverview = React.createClass({
  render: function() {
    return (
      <div className="overview">共 {this.props.pages} 页，</div>
    );
  }
});

var PagiQuickGo = React.createClass({
  getInitialState: function() {
    return {
      pageInput: null
    };
  },
  inputChange: function(e) {
    this.setState({
      pageInput: e.target.value
    });
  },
  quickGo: function() {
    if(this.state.pageInput) {
      var nextPage = +this.state.pageInput;
      nextPage = nextPage < 1 ? 1 : nextPage;
      nextPage = nextPage > this.props.pages ? this.props.pages : nextPage;
      this.props.setActivePage(nextPage)
    }
  },
  render: function() {
    return (
      <div className="quick-go">
        <span>到第</span>
        <input className="go-page" type="number" min="1" max={this.props.pages} onChange={this.inputChange} />
        <span>页</span>
        <button className="go-submit" onClick={this.quickGo}>确认</button>
      </div>
    );
  }
});

module.exports = Pagination;
