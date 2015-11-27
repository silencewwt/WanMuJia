'use strict';

require('./SortBar.scss');

let SortItem = React.createClass({
  render: function () {
    let sortText;
    let name = this.props.name;
    let isActive = this.props.isActive;
    if (!isActive) {
      sortText = name;
    } else if (this.props.order === 'asc') {
      sortText = name + '从低到高';
    } else {
      sortText = name + '从高到低';
    }
    return (
      <a className={isActive ? 'active' : ''} onClick={this.props.onSort}>
        {sortText}
      </a>
    );
  }
});

let SortBar = React.createClass({
  getInitialState: function () {
    return {
      activeField: null,
      order: false
    };
  },
  handleSortItemSelect: function (field, order) {
    let oldField = this.state.activeField;
    let oldOrder = this.state.order;
    this.setState({
      activeField: field,
      order: order
    });
    (field !== oldField || order !== oldOrder) && this.props.onSortSelect(field, order);
  },
  setSortState: function (field, order) {
    this.setState({
      activeField: field,
      order: order
    });
  },
  reverseOrder: function (order) {
    if (order === 'asc') return 'desc';
    else return 'asc';
  },
  render: function () {
    let sortItemNodes = this.props.sortDefs.map((def, index) => {
      let isActive = this.state.activeField === def.field;
      return (
        <li key={index} className={'sortbar-item ' + (isActive ? 'active' : '')}>
          <SortItem
            {...def}
            isActive={isActive}
            order={isActive ? this.state.order : null}
            onSort={this.handleSortItemSelect.bind(null, def.field, this.reverseOrder(this.state.order))}
          />
        </li>
      );
    });
    return (
      <div className="sortbar">
        <div className="head">
          <h4 className="sortbar-name">排序方式</h4>
        </div>
        <div className="body">
          <ul className="sortbar-items">
            {sortItemNodes}
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = SortBar;
