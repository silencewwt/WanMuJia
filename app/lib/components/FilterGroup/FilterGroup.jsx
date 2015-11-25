'use strict';

require('./FilterGroup.scss');

//  ==================================================
//  Component: FilterGroup
//
//  Include: Filter FilterOption FilterAction FilterStateBar FilterStateTag
//
//  TODO:
//  ==================================================

/* 每条过滤器的每个选项 */
let FilterOption = React.createClass({
  render: function () {
    let optionValue = this.props.value;
    // let select = this.props.onSelect.bind(null, optionValue);
    let select = function (event) {
      !this.props.isMultiSelect && event && event.preventDefault();
      this.props.onSelect(optionValue);
    }.bind(this);
    let optionElement;
    let optionValueElement = <span>{optionValue.value}</span>;
    if (this.props.isMultiSelect) {
      optionElement = (
        <label href="#" htmlFor={optionValue.name}>
          <input onClick={select} type="checkbox" name={optionValue.name} value={optionValue.value} id={optionValue.value} />
          {optionValueElement}
        </label>
      );
    }
    else {
      optionElement = (
        <a href="#" onClick={select}>
          {optionValueElement}
        </a>
      );
    }
    return optionElement;
  }
});

/* 每条过滤器的额外操作 */
let FilterAction = React.createClass({
  render: function () {
    return (
      <div className="filter-action">
        <a style={{display: this.props.multiToggleStatus ? 'inline' : 'none'}}
          onClick={this.props.multiToggle} href="#" className="multi-toggle">多选</a>
        <a onClick={this.props.expandToggle} className="expand-toggle" href="#">
          {this.props.expandToggleStatus ? '更多' : '收起'}
        </a>
      </div>
    );
  }
});

/* 状态标签 */
let FilterStateTag = React.createClass({
  render: function () {
    let tagValueNodes;
    let removeTag = function (value, event) {
      event && event.preventDefault();
      this.props.onTagRemove(value);
    }.bind(this);
    let currStateValues =  Array.isArray(this.props.value) ?
                          this.props.value :
                          [this.props.value];
    tagValueNodes = currStateValues.map(function (value, index, values) {
      if (this.props.treeView) {
        // state 为 treeView
        return (
          <span key={index}>
            {value.value}&nbsp;
            <span className="tag-remove">
              <a onClick={removeTag.bind(this, value)} href="#">&times;</a>
            </span>
            {
              index == values.length - 1 ?
                null :
                (<span>&nbsp;&nbsp;&gt;&nbsp;&nbsp;</span>)
            }
          </span>
        );
      }
      // state 不是 treeView 但可能为多选状态
      if (index == values.length - 1) {
        return (
          <span key={index}>
            {value.value}&nbsp;
            <span className="tag-remove">
              <a onClick={removeTag.bind(this, value)} href="#">&times;</a>
            </span>
          </span>
        );
      }
      else {
        return (
          <span key={index}>
            {value.value + ','}&nbsp;
          </span>
        );
      }
    }.bind(this));

    return (
      <div className="filter-tag">
        <div className="tag-name">{this.props.name + ':'}&nbsp;&nbsp;</div>
        <div className="tag-value">
          {tagValueNodes}
        </div>
      </div>
    );
  }
});

/* 状态标签栏 */
let FilterStateBar = React.createClass({
  render: function () {
    let filterState = this.props.filterState;
    let stateTagNodes = Object.keys(filterState)
      .map(function (field, index) {
        let state = filterState[field];
        let def = this.props.getFilterDef(field);
        return (
          <FilterStateTag
            key={index}
            name={def.name}
            value={state}
            treeView={def.treeView}
            onTagRemove={this.props.onStateDelete.bind(null, field)}
          />
        );
      }.bind(this));
    return (
      <div className="filter-state">
        <div className="custom-content">
          {this.props.children}
        </div>
        <div className="filter-tags">
          {stateTagNodes}
        </div>
      </div>
    );
  }
});

/* 单条过滤器 */
let Filter = React.createClass({
  getInitialState: function () {
    return {
      isMultiSelect: false,
      isExpanded: false,
      multiSelected: {}    // 暂时被多选中的选项
    };
  },
  getDefaultProps: function () {
    return {
      canMultiSelect: false,
      treeView: false,
      options: [],
    };
  },
  multiSelectToggle: function (event) {
    event && event.preventDefault();
    this.setState({
      isMultiSelect: !this.state.isMultiSelect,
      // 若由非多选到多选，则自动展开
      isExpanded: this.state.isMultiSelect ? false : true
    });
  },
  expandToggle: function (event) {
    event && event.preventDefault();
    this.setState({
      // 若由展开到收起，则取消多选状态
      isMultiSelect: this.state.isExpanded ? false : this.state.isMultiSelect,
      isExpanded: !this.state.isExpanded
    });
  },
  // 用于更新暂时被多选中的选项状态
  updateMultiSelected: function (value) {
    let multiSelected = this.state.multiSelected;
    multiSelected[value.value] ?
      multiSelected[value.value] = null :
      multiSelected[value.value] = value;
    this.setState({multiSelected: multiSelected});
  },
  // 确认多选的状态
  confirmMultiSelect: function (event) {
    event && event.preventDefault();
    let selectedObj = this.state.multiSelected;
    let selectedArr = [];
    for (let key in selectedObj) {
      if (selectedObj.hasOwnProperty(key) && selectedObj[key]) {
        selectedArr.push(selectedObj[key]);
      }
    }
    this.props.onSelectOption(selectedArr);
    // 清空多选暂存
    this.setState({multiSelected: {}});
    // 取消多选状态
    this.multiSelectToggle();
  },
  render: function () {
    let handleSelect = function (value) {
      if (!this.state.isMultiSelect) {
        this.props.onSelectOption(value);
        return;
      }
      this.updateMultiSelected(value);
    }.bind(this);
    let optionNodes = this.props.options.map(function (option, index) {
      return (
        <li key={index} className="filter-item">
          <FilterOption value={option} onSelect={handleSelect} isMultiSelect={this.state.isMultiSelect} />
        </li>
      );
    }.bind(this));

    return (
      <div className={"filter" + (this.state.isExpanded ? " expanded" : "")} style={{display: this.props.options.length > 0 ? 'block' : 'none'}}>
        <div className="head">
          <h4 className="filter-name">{this.props.name}</h4>
        </div>

        <div className="body">
          <ul className="filter-items">
            {optionNodes}
          </ul>

          <div style={{display: this.state.isMultiSelect ? 'block' : 'none'}}
              className="multi-confirm">
            <button className="btn-confirm" onClick={this.confirmMultiSelect} type="button" name="confirm">确定</button>
            <button className="btn-cancel" type="button" name="cancel" onClick={this.multiSelectToggle}>取消</button>
          </div>
        </div>

        <div className="foot">
          <FilterAction
            multiToggleStatus={this.props.canMultiSelect &&
              !this.state.isMultiSelect}
            expandToggleStatus={!this.state.isExpanded}
            multiToggle={this.multiSelectToggle}
            expandToggle={this.expandToggle}
          />
        </div>
      </div>
    );
  }
});

/* 过滤器组，最外层组件 */
/**
 * [props]
 * {object} filterDefs
 * {object} filterValues
 * {function} onStateChange
 */
let FilterGroup = React.createClass({
  getInitialState: function () {
    return {
      filterValues: this.props.filterValues,
      filterState: {}
    };
  },
  getDefaultProps: function () {
    return {
      filterValues: {},
      onStateChange: function () {}
    };
  },
  componentDidMount: function () {
    let defs = this.props.filterDefs
      .reduce(function (defs, filterDef) {
        defs[filterDef.field] = filterDef;
        return defs;
      }, {});
    this.setState({defIndex: defs});
  },
  componentWillReceiveProps: function (nextProps) {
    this.updateFilterValue(nextProps.filterValues);
  },
  updateFilterValue: function (values) {
    this.setState({filterValues: values});
  },
  setFilterState: function (state) {
    // if (!this.isSameState(this.state.filterState, state)) {
    this.setState({filterState: state});
    // }
  },
  addFilterState: function (field, value) {
    let that = this;
    let defs = that.state.defIndex;
    let state = this.state.filterState;
    let changed = false;
    let hasValue = !!state[field];

    if (defs[field].treeView) {
      let indexOfTree = hasValue ?
        that.findIndex(state[field], value) :
        -1;
      // 判断当前点击的和上一个选项是否是同一个层级
      let isSameLevel = function () {
        if (!hasValue) {
          return false;
        }
        let len = state[field].length;
        let currentState = that.props.filterValues[field] || [];
        return that.findIndex(currentState, value) > -1 &&
          that.findIndex(currentState, state[field][len - 1]) > -1;
      };
      // 当一开始没有值或点击的不是最后一个层级时，标记状态为改变
      changed = !hasValue || (indexOfTree != state[field].length - 1);
      if (changed) {
        state[field] = state[field] || [];
        // 如果已有此层级的选项，直接定位到此层级
        if (indexOfTree >= 0) {
          state[field] = state[field].slice(0, indexOfTree + 1);
        }
        else {
          // 当下一层级的选项还未加载时可能对同一层级的选项做多次选择
          // 此时保持同一层级选择的互斥性，总是只能选择一个选项
          if (isSameLevel()) {
            state[field].pop();
          }
          state[field].push(value);
        }
      }
    }
    // 非 treeView
    // 无该 field 下的 state，或 value 值不相等，或 value 数组不相等
    else if (!hasValue ||
      value.value !== state[field].value ||
      (Array.isArray(value) && !that.isSameState(value, state[field]))
    ) {

      if (Array.isArray(value) && value.length === 0) {
        that.removeFilterState(field);
      }
      else {
        state[field] = value;
        changed = true;
      }
    }

    // fire
    if (changed) {
      that.setState({filterState: state});
      that.props.onStateChange(this.state.filterState, that);
    }
  },
  removeFilterState: function (field, value) {
    let defs = this.state.defIndex;
    let state = this.state.filterState;
    let indexOfTree;
    if (defs[field].treeView) {
      indexOfTree = this.findIndex(state[field], value);
      if (indexOfTree === 0) {
        delete state[field];
      }
      else if (indexOfTree > 0) {
        state[field] = state[field].slice(0, indexOfTree);
      }
    }
    else {
      delete state[field];
    }

    // fire
    this.setState({filterState: state});
    this.props.onStateChange(this.state.filterState, this);
  },
  getFilterDef: function (field) {
    return this.state.defIndex[field];
  },

  // util fn
  isSameState: function (o, n) {
    let that = this;
    if (that.isEmptyObj(o) && !that.isEmptyObj(n) ||
      !that.isEmptyObj(o) && that.isEmptyObj(n)) {
      return false;
    }
    return that.isEmptyObj(o) && that.isEmptyObj(n) ||
      Object.keys(o)
        .filter(function (field) {
          return that.props.filterDefs.hasOwnProperty(field);
        })
        .every(function (field) {
          if (o[field] === n[field] || o[field].value === n[field].value) {
              return true;
          }
          if (Array.isArray(o[field]) && Array.isArray(n[field])) {
              return o[field].every(function (oState, index) {
                return oState === n[field][index] ||
                  oState.value === n[field][index].value;
              });
          }
          return false;
        });
  },
  isSameValueArray: function (oArr, nArr) {
    return oArr.every(function (value, index) {
      return value.value === nArr[index].value;
    });
  },
  isEmptyObj: function (obj) {
    return Object.keys(obj).length === 0;
  },
  // 用于在设置了 treeView 选项的 filter state 中寻找已选状态位置
  findIndex: function (arr, value) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].value === value.value) {
        return i;
      }
    }
    return -1;
  },

  render: function () {
    let filterNodes = this.props.filterDefs.map(function (def, index) {
      let options = this.state.filterValues[def.field] || [];
      return (
        <li key={index} style={{display: options.length > 0 ? 'block' : 'none'}}>
          <Filter
            name={def.name}
            field={def.field}
            canMultiSelect={def.canMultiSelect}
            treeView={def.treeView}
            options={options}
            onSelectOption={this.addFilterState.bind(null, def.field)}
          />
        </li>
      );
    }.bind(this));

    return (
      <div className="cu-filter-group">
        <FilterStateBar
          filterState={this.state.filterState}
          getFilterDef={this.getFilterDef}
          onStateDelete={this.removeFilterState}
        >
          {this.props.children}
        </FilterStateBar>
        <ul className="filter-group">
          {filterNodes}
        </ul>
      </div>
    );
  }
});

module.exports = FilterGroup;
