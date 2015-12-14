'use strict';
require('./CompareBar.scss');

let React = require("react");
let reqwest = require("reqwest");
let utils = require("../../utils/utils.js");
let setCookie = utils.setCookie;
let getCookie = utils.getCookie;

var CompareBar = React.createClass({
  getInitialState: function() {
    return {
      show: false,
      data: [],
      errTip: null,
    };
  },
  show: function() {
    this.setState({show: true});
  },
  hide: function() {
    this.setState({show: false});
  },
  toggle: function() {
    this.setState({show: !this.state.show});
  },
  // 添加对比项，先判断时候套件，套件提示错误；
  // 再判断时候重复，如果重复提示错误；
  // 再判断对比项是否满了，满3件提示错误；
  // 添加到state.data，存cookie
  addItem: function(item) {
    this.show();
    if(item.is_suite) {
      this.setErrTip('套件不可对比，请选择单件商品对比～');
      return false;
    }
    for(let i = 0; i < this.state.data.length; i++) {
      if(this.state.data[i].id == item.id) {
        this.setErrTip('该商品已在对比栏，请选择其他商品添加对比哦！');
        return false;
      }
    }
    if(this.state.data.length == 3) {
      this.setErrTip('对比栏已满，你可以先删除烂内商品再添加哦！');
      return false;
    }
    let _data = this.state.data;
    _data.push(item);
    this.setState({data: _data});
    let _cookieStr =  getCookie("compareItems");
    let _cookieArr = _cookieStr?_cookieStr.split(','):[];
    _cookieArr.push(item.id.toString());
    let cookieStr = _cookieArr.join(',');
    let now = new Date();
    setCookie('compareItems', cookieStr, now.setHours(now.getHours() + 30 * 24) , '/' );
  },
  // 删除对比项
  deleteItem: function(id) {
    var idNum;
    for(let i = 0; i < this.state.data.length; i++) {
      if(this.state.data[i].id == id) {
        idNum = i;
        break;
      }
    }
    var _data = this.state.data;
    _data.splice(idNum , 1);
    this.setState({data: _data});
    let _cookieStr =  getCookie("compareItems");
    let _cookieArr = _cookieStr?_cookieStr.split(','):[];
    if(_cookieArr[idNum] == id) {
      _cookieArr.splice(idNum , 1);
      let cookieStr = _cookieArr.join(',');
      let now = new Date();
      setCookie('compareItems', cookieStr, now.setHours(now.getHours() + 30 * 24) , '/' );
    }
  },
  // 删除所有
  deleteAll: function() {
    this.setState({data: []});
    this.hide();
    let now = new Date();
    setCookie('compareItems', "", now.setHours(now.getHours() + 30 * 24) , '/' );
  },
  // 根据 cookie id 获取对比项数据
  getItem: function(id , num) {
    reqwest({
      url: "/item/"+id,
      method: "get",
      data: {format: "json"},
      success: function(itemData) {
        let _data = this.state.data;
        _data[num] = itemData;
        _data[num].id = id;
        this.setState({data: _data});
      }.bind(this)
    });
  },
  // 初始化获取cookie 获取数据
  componentDidMount: function() {
    let _cookieStr =  getCookie("compareItems");
    if(!_cookieStr) {
      return ;
    }
    let idArr = _cookieStr.split(',');
    for(let i = 0; i < idArr.length; i++) {
      this.getItem(idArr[i] , i);
    }
  },
  setErrTip: function(err) {
    this.setState({errTip: err});
    setTimeout(function() {
      this.setState({errTip: null});
    }.bind(this) , 5000);
  },
  render: function() {
    return (
      <div
        className={(!this.state.data.length?"":"has-item ") +"compare-bar-wrap"}>

        {
          this.state.data.length?
          <span className="compare-item-num">
            {this.state.data.length}
          </span>:
          null
        }

        <span
          className={"compare-bar-btn"}
          onClick={this.toggle}>
          对比
        </span>

        <div className={(this.state.show?"show ":"" )+ "compare-bar"}>
          <CompareBarHeader
            errTip={this.state.errTip}
            hide={this.hide}
          />
          <CompareBarContent
            data={this.state.data}
            delete={this.deleteItem}
            deleteAll={this.deleteAll}
          />
        </div>
      </div>
    );
  }
});

var CompareBarHeader = React.createClass({
  render: function() {
    let errTip = null;
    if(this.props.errTip) {
      errTip = (<div className="err-tip">{this.props.errTip}</div>);
    }
    return (
      <div className="cb-header">
        <h1>对比栏</h1>
        <div className="close-btn" onClick={this.props.hide}>隐藏</div>

        {errTip}

      </div>
    );
  }
});

var CompareBarContent = React.createClass({
  render: function() {
    return (
      <div className="cb-content">
        <CompareBarItem num="1" data={this.props.data[0]} delete={this.props.delete} />
        <CompareBarItem num="2" data={this.props.data[1]} delete={this.props.delete} />
        <CompareBarItem num="3" data={this.props.data[2]} delete={this.props.delete} />
        <CompareBarOperation deleteAll={this.props.deleteAll} />
      </div>
    );
  }
});

var CompareBarItem = React.createClass({
  render: function() {
    if(!this.props.data) {
      return (
        <div className="cb-item null">
          <div className="num-box">
            {this.props.num}
          </div>
          <div className="null-tip">你还可以继续添加</div>
        </div>
      );
    } else {
      return (
        <div className="cb-item">
          <a href={"/item/"+this.props.data.id}>
            <div className="pic">
              <img src={this.props.data.image_url} alt={this.props.data.item} />
            </div>
            <div className="detail">
              <h2 className="title">{this.props.data.item}</h2>
              <div className="price">{this.props.data.price/10000}万</div>
            </div>
          </a>
          <div className="delete"
            onClick={this.props.delete.bind(null, this.props.data.id)}>
            删除
          </div>
        </div>
      );
    }
  }
});

var CompareBarOperation = React.createClass({
  render: function() {
    return (
      <div className="cb-operation">
        <a className="compare-link" target="_blank" href="/item/compare">对比</a>
        <div className="delete-all" onClick={this.props.deleteAll}>清空对比栏</div>
      </div>
    );
  }
});

module.exports = CompareBar;
