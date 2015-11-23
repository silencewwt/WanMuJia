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
      tip: this.props.tip || null,
      value: ''
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
        />
          {this.props.children}
        <ValidateTip tip={this.state.tip} />
      </div>
    );
  }
});

let ValidateInput = React.createClass({
  render: function() {
    let tipStyle =
      this.props.tip && (this.props.tip.status !== 'success' && this.props.tip.status !== 'tip') ?
      {
        borderColor: '#833e00'
      } : null;
    return (
      <input
        className={this.props.theme === 'verify' ? 'verify' : null}
        type={this.props.inputType}
        onBlur={this.props.onBlur}
        placeholder={this.props.placeholder}
        style={tipStyle}
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
