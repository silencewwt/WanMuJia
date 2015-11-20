'use strict';

//  ==================================================
//  Component: Validate
//
//  Props:
//
//  Methods:
//
//  Use: views::Profile
//
//  TODO:
//  ==================================================

let Validate = React.createClass({
  getInitialState: function() {
    return {
      tip: null,
      value: null
    }
  },
  getDefaultProps: function() {
    return {
      inputType: 'text',
      validate: null,
      placeholder: null,
      theme: 'default'
    };
  },
  handleInputBlur: function(e) {
    if(!this.props.validate) {
      return;
    }

    let value = e.target.value;
    let tip = null;

    for(let i in validate) {
      if(!this.props.validate[i].rule.test(value)) {
        tip = this.props.validate[i].text;
        value = null;
        break;
      }
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

    if(status !== 'success') {
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
        />
        {this.props.children}
        <ValidateTip tip={this.state.tip} />
      </div>
    );
  }
});

let ValidateInput = React.createClass({
  render: function() {
    return (
      <input
        className={this.props.theme === 'verify' ? 'verify' : null}
        type={this.props.inputType}
        onBlur={this.handleInputBlur}
        placeholder={this.props.placeholder}
      />
    );
  }
});

let ValidateTip = React.createClass({
  render: function() {
    let tipClass = this.props.tip ? 'input-tip ' + this.props.tip.status : 'input-tip';
    return (
      <span className="input-tip">
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
