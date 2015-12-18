'use strict';

require('./Feedback.scss');
let reqwest = require('reqwest');

var Feedback = React.createClass({
  getInitialState: function() {
    return {
      show: false,
    };
  },
  toShow: function() {
    this.setState({show: true});
  },
  toHide: function() {
    this.setState({show: false});
  },
  toToggle: function() {
    this.setState({show: !this.state.show});
  },
  render: function() {
    return (
      <div className="feedback-wrap">
        <div className="feedback-btn" onClick={this.toToggle}>
          <div className="tip">意见反馈</div>
        </div>

        <FeedbackForm
          show={this.state.show}
          toHide={this.toHide}
          toShow={this.toShow}
        />

      </div>
    );
  }
});

var FeedbackForm = React.createClass({
  componentDidMount: function() {
    document.addEventListener('mousedown', this.allClick, false);
  },
  componentWillUnmount: function () {
    document.removeEventListener('mousedown', this.allClick, false);
  },
  allClick: function(e) {
    if (ReactDOM.findDOMNode(this).contains(e.target)) {
      return ;
    }
    this.props.toHide();
  },
  getInitialState: function() {
    return {
      tip: null,
      cont: "",
      num: "",
      hasSubmit: false,
    };
  },
  handleCont: function(e) {
    let cont = e.target.value;
    if(cont.length > 200) {
      this.setState({tip: "请输入10到200个字符"});
      return false;
    }
    if(cont.length < 10) {
      this.setState({tip: "请输入10到200个字符"});
    }
    if(cont.length <= 200 && cont.length >= 10) {
      this.setState({tip: ""});
    }
    this.setState({cont: cont});
  },
  handleNum: function(e) {
    let num = e.target.value;
    if(num.length <= 100) {
      this.setState({num: num});
    }
  },
  handleSubmit: function(e) {
    e.preventDefault();
    let cont = this.state.cont;
    let num = this.state.num;
    if(this.state.tip) {
      return false;
    }
    if(!cont) {
      this.setState({tip: "请填写反馈建议再提交～"});
      return false;
    }
    let csrfToken = Utils.getCookie('csrf_token');

    reqwest({
      url: '/feedback',
      method: 'post',
      data: {
        csrf_token: csrfToken,
        feedback: cont,
        contact: num,
      },
      error: function(err) {
        this.setState({tip: "提交失败，请刷新页面重试，亲～"});
      }.bind(this),
      success: function(resp) {
        if(resp.success) {
          this.setState({hasSubmit: true});
        } else {
          this.setState({tip: resp.message});
        }
      }.bind(this)
    });

  },
  render: function() {
    if(this.state.hasSubmit) {
      return (
        <div className={(this.props.show?"show ":"")+"feedback-form"} >

          <div className="close" onClick={this.props.toHide}>+</div>

          <div className="result">
            提交成功
            <br/>
            感谢你的反馈与建议～
          </div>

        </div>
      );
    }
    return (
      <div className={(this.props.show?"show ":"")+"feedback-form"} >

        <div className="close" onClick={this.props.toHide}>+</div>

        <textarea
          className="cont"
          placeholder="万木家用户你好，请将你使用过程中遇到的问题或者是希望有的功能反馈给我们，我们会不断优化你的使用体验。"
          value={this.state.cont}
          onChange={this.handleCont}>
         </textarea>

        <div className="form-tip">{this.state.tip}</div>

        <div className="input-group">
          <input
            className="ipt-num"
            type="text"
            placeholder="邮箱或手机号或微信号（选题）"
            value={this.state.num}
            onChange={this.handleNum}/>
          <input
            className="submit"
            type="submit"
            value="确定"
            onClick={this.handleSubmit}
          />
        </div>

      </div>
    );
  }
});

module.exports = Feedback;
