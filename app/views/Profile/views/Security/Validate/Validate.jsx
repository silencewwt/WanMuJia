'use strict';

//  ==================================================
//  Component: Validate
//
//  State: tip => string|null 提示语
//         value => string 输入框的值
//
//  Props:  inputType => string|null 提示语
//          validate => object|null 验证规则
//          placeholder => string|null 输入框自身提示
//          theme => string 主题
//
//  Methods:  getValue() => 获取输入框的值
//            setTip(tip, status) => 设置提示语和状态 @status => string(error, success, tip)
//
//  Use: views::Profile::Security
//
//  TODO:
//  ==================================================

let Validate = React.createClass({
  getInitialState: function() {
    return {
      tip: this.props.tip || null,  // 提示语
      value: this.props.value ? this.props.value : ''  // 输入框的值
    }
  },
  getDefaultProps: function() {
    return {
      inputType: 'text',  // 输入框的类型
      validate: null, // 验证规则
      placeholder: null,  // 输入框自身提示
      theme: 'default',  // 主题
      value: null // 值
    };
  },
  handleInputBlur: function(e) {
    let value = e.target.value;
    let tip = null;

    if(!this.props.validate || !value) {
      return;
    }

    if(!this.props.validate.rule.test(value)) {
      tip = this.props.validate.text;
      value = null;
    }

    this.setState({
      tip: tip ? {
        status: 'error',
        text: tip
      } : null,
      value: value
    });
  },
  getValue: function() {
    return this.state.value;
  },
  setTip: function(tip, status) {
    this.setState({
      tip: {
        status: status || 'error',
        text: tip
      }
    });

    if(status !== 'success' && status !== 'tip') {
      this.setState({
        value: null
      });
    }
  },
  render: function() {
    return (
      <div className="form-validate">
        <ValidateInput
          theme={this.props.theme}
          type={this.props.inputType}
          onBlur={this.handleInputBlur}
          placeholder={this.props.placeholder}
          tip={this.state.tip}
          value={this.props.value}
        />
          {this.props.children}
        <ValidateTip tip={this.state.tip} />
      </div>
    );
  }
});

let ValidateInput = React.createClass({
  render: function() {
    let inputEle = document.createElement('input');
    let pld = "placeholder" in inputEle;
    let tipStyle =
      this.props.tip && (this.props.tip.status !== 'success' && this.props.tip.status !== 'tip') ?
      {
        borderColor: '#833e00'
      } : null;
    return (
      <input
        className={this.props.theme === 'verify' ? 'verify' : null}
        type={this.props.type}
        onBlur={this.props.onBlur}
        defaultValue={!pld ? this.props.placeholder : null}
        placeholder={this.props.placeholder}
        style={tipStyle}
        value={this.props.value}
      />
    );
  }
});

let ValidateTip = React.createClass({
  render: function() {
    let tipClass = this.props.tip ? ('input-tip ' + this.props.tip.status) : 'input-tip';
    return (
      <span className={tipClass}>
        {
          this.props.tip ?
          this.props.tip.text :
          null
        }
      </span>
    );
  }
});

module.exports = Validate;
