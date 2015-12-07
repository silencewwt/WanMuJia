'use strict'

//  ==================================================
//  Component: ProgressBar
//
//  Include: Spinner
//
//  Description: Jsx for ProgressBar
//
//  TODO: [fix] 修正初始时 transition 不生效的问题
//  ==================================================

require('./ProgressBar.scss');

/* Spinner */
var Spinner = React.createClass({
  render: function() {
    return (
      <div className="cu-spinner" style={{borderColor: this.props.color,borderLeftColor: 'transparent'}}></div>
    );
  }
});

/* ProgressBar */
var ProgressBar = React.createClass({
  getInitialState: function() {
    return {
      rate: null,
      done: false
    };
  },
  getDefaultProps: function() {
    return {
      speed: 0.6,  // 动画速度
      spinner: true,  // 是否有圈圈
      easing: 'ease',  // 动画缓动曲线
      maxRate: 0.96,  // 进度条最大宽度
      incStep: 0.04,  // inc 增长步幅
      minStep: 0.005,  // 随机增长的最小步幅
      maxStep: 0.03,  // 随机增长的最大步幅
      trickle: true,  // 是否自动增长
      trickleSpeed: 800,  // 自动增长的间隔时间
      color: '#09c4c7',
      setTrickle: false  // set 后是否自动增长（未启用）
    };
  },
  start: function() {
    this._init();
    this.set('0.5%');
    this.props.trickle && this._autoInc();
  },
  set: function(n, trickle) {
    !trickle && this._init();
    n = this._format(n);
    if (n === 100) {
      /* done */
      this.setState({
        rate: 100
      });
    } else {
      n = n > this.props.maxRate * 100
        ? this.props.maxRate * 100
        : n;
      this.setState({
        rate: n
      });
    }
  },
  inc: function(n) {
    this._init();
    this.props.trickle && this._autoInc();
    n = n
      ? this._format(n)
      : this.props.incStep * 100;
    var newRate = this.state.rate + n;
    this.set(newRate + '%', true);
  },
  done: function() {
    this.set('100%');
    setTimeout(function() {
      this.setState({
        done: true
      });
      setTimeout(function() {
        this.setState({
          rate: null
        });
      }.bind(this), this.props.speed * 2 * 1000);
    }.bind(this), this.props.speed * 1000);
  },
  _format: function(data) {  // 格式化为 0-100 的整数
    if (typeof data === 'number') {  // 0-1 的小数
      return data > 1
        ? this.pros.maxRate * 100
        : data * 100;
    } else if (typeof data === 'string') {  // 百分比
      return parseFloat(data) > 100
        ? this.props.maxRate * 100
        : parseFloat(data);
    } else {
      return;
    }
  },
  _init: function() {
    this.state.done && this.setState({
      done: false
    });
    this.timer && this._clearInterval();
  },
  _autoInc: function() {
    var newRate;
    var random;
    this.timer = setInterval(function() {
      random = this._getRadomStep();
      newRate = this.state.rate + random;
      console.log(random);
      if (newRate > this.props.maxRate * 100) {
        console.log(this.props.maxRate * 100);
        this._clearInterval();
        return;
      }
      console.log(newRate);
      this.set(newRate + '%', true);
    }.bind(this), this.props.trickleSpeed);
  },
  _clearInterval: function() {
    this.timer && clearInterval(this.timer);
  },
  _getRadomStep: function(min, max) {
    min = min || this.props.minStep * 100;
    max = max || this.props.maxStep * 100;
    return Math.random() * (max - min) + min;
  },
  render: function() {
    var progressStyle = {
      //display: (!this.state.rate && typeof this.state.rate === 'object') ? 'none' : 'block',
      opacity: this.state.done
        ? 0
        : 1,
      transition: 'opacity ' + this.props.speed + 's ' + this.props.easing
    };
    var barStyle = {
      width: !this.state.rate
        ? 0
        : this.state.rate + '%',
      transition: 'width ' + this.props.speed + 's ' + this.props.easing,
      backgroundColor: this.props.color,
      boxShadowColor: this.props.color
    };
    return this.state.rate
      ? (
        <div className="cu-progress" style={progressStyle}>
          <div className="cu-progress-bar" style={barStyle}></div>
          {this.props.spinner
            ? <Spinner color={this.props.color} />
            : null}
        </div>
      )
      : null;
  }
});

module.exports = ProgressBar;
