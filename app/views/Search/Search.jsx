'use strict';

require('../../assets/pages/search.html');
require('./Search.scss');

let reqwest = require('reqwest');

let ProgressBar = require('../../lib/components/ProgressBar/ProgressBar');
let FilterGroup = require('../../lib/components/FilterGroup/FilterGroup');
let SortBar = require('../../lib/components/SortBar/SortBar');
let Items = require('../../lib/components/Items/Items');
let Pagination = require('../../lib/components/Pagination/Pagination');
let FloatBottomTip = require('../../lib/components/FloatBottomTip/FloatBottomTip.jsx');
let LoginPopup = require('../../lib/components/LoginPopup/LoginPopup.jsx');
let historyWatcher = Utils.historyWatcher;

let SearchPage = React.createClass({
  getDefaultProps: function () {
    let queryParamsFromUrl = Utils.queryStringToJson(Utils.getUrlQuery());
    return {
      progressBarConfig: {
        speed: 0.4,
        color: '#833e00',
        spinner: false
      },
      headerConfig: {
        shrink: true,
        defaultSearchValue: queryParamsFromUrl.search || ''
      },
      filterGroupConfig: {
        filterDefs: [
          {name: '材料', field: 'material', canMultiSelect: true},
          {name: '风格', field: 'style', canMultiSelect: true},
          {name: '场景', field: 'scene', canMultiSelect: true},
          {name: '种类', field: 'category', treeView: true},
          {name: '品牌', field: 'brand', canMultiSelect: true},
          {name: '价格', field: 'price'}
        ]
      },
      sortBarConfig: {
        sortDefs: [
          {name: '价格', field: 'price'}
        ],
        initialField: queryParamsFromUrl.order ? 'price' : null,
        initialOrder: queryParamsFromUrl.order
      },
      paginationConfig: {
        quickGo: true
      }
    };
  },
  getInitialState: function () {
    let queryParamsFromUrl = Utils.queryStringToJson(Utils.getUrlQuery());
    return {
      userInfoState: null,
      queryParams: queryParamsFromUrl,    // 全部的搜索参数
      filterGroupState: {
        filterValues: []
      },
      itemsState: {
        items: [],
        amount: 0
      },
      paginationState: {
        pages: 0,
        activePage: parseInt(queryParamsFromUrl.page) || 1
      }
    };
  },
  componentDidMount: function () {
    this.getUserInfo();
    this.getSearchData('init', Utils.getUrlQuery(), true);
    historyWatcher.onPopstate((e) => {
      this.getSearchData('popstate', e.state);
    });
  },

  /* callbacks */
  // FilterGroup
  handleFilterStateChange: function (state) {
    this.getSearchData('filter', this.genUrlQuery({
      filterSelected: state,
      otherParams: this.state.queryParams,
      isFromFilter: true
    }));
  },
  // SortBar
  handleSortSelect: function (field, order) {
    this.getSearchData('sortbar', Utils.oExtends({}, this.state.queryParams, {order: order}));
  },
  // Pagination
  handlePageChange: function (page) {
    this.getSearchData('pagination', Utils.oExtends({}, this.state.queryParams, {page: page}));
  },
  // Items
  handleCollectClick: function (itemReact, item) {
    if (!this.ifUserLogined()) {
      this.refs.loginPopup.show();
      return;
    }
    reqwest({
      url: '/collection',
      method: 'post',
      data: {item: item.item_id},
      success: function (res) {
        res.success && itemReact.setFav();
      }
    });
  },
  handleCompareClick: function (itemReact, item) {
    this.refs.floatBottomTip.compareBarAddItem(item);
  },

  ifUserLogined: function () {
    return this.state.userInfoState && this.state.userInfoState.logined;
  },
  getUserInfo: function () {
    reqwest({
      url: "/logined",
      method: "get",
      success: function(res) {
        if(res.logined) {
          this.setState({userInfoState: res});
        }
      }.bind(this)
    });
  },
  getSearchData: function (origin, params) {
    params = params || Utils.getUrlQuery();
    let jsonToQueryString = Utils.jsonToQueryString;
    let filterGroup = this.refs.filterGroup;
    let progressBar = this.refs.progressBar;
    let sortBar = this.refs.sortBar;

    // 进度条启动
    origin !== 'init' && progressBar.start();

    reqwest({
      url: '/item/filter',
      method: 'GET',
      data: typeof params == 'string' ? params : jsonToQueryString(params),
      complete: function () {
        origin !== 'init' && progressBar.done();    // 进度条完成
      }.bind(this),

      success: function (res) {
        let filters = res.filters;
        let items = res.items;

        this.setState({
          // 更新搜索参数
          queryParams: this.genUrlQuery({
            filterSelected: filters.selected,
            otherParams: items
          }),

          // 更新 filterGroup values
          filterGroupState: {
            filterValues: this.filterValuesMapping(filters.available)
          },

          // 更新 items
          itemsState: {
            items: items.query,
            amount: items.amount
          },

          // 更新 pagination
          paginationState: {
            pages: items.pages,
            activePage: items.page
          }
        });

        // 更新 sortBar
        sortBar.setSortState(items.order ? 'price' : null, items.order);
        // 不来自 popstate 且不来自 init 事件时更新 url
        origin !== 'popstate' && origin !== 'init' && historyWatcher.addHistory(this.state.queryParams, '?' + jsonToQueryString(this.state.queryParams, true));
        // 如果来自 popstate 或 init 则手动更新 filterGroup 的 state
        (origin === 'popstate' || origin === 'init') && filterGroup.setFilterState(this.filterValuesMapping(filters.selected, true));
      }.bind(this),

      error: function (xhr) {

      }
    });
  },
  filterValuesMapping: function (valuesObj, isFilterState=false) {
    return Object.keys(valuesObj).reduce(function (mapped, field) {
      let def = this.refs.filterGroup.getFilterDef(field);
      let values = valuesObj[field];
      let mappedValue = [];

      // 多选或 treeView 的情况 field 对应的 value 目前都以数组呈现, 暂时无法区分
      if (isFilterState && def.treeView) {
        this.deepTravel(values, function (value, valueId) {
          mappedValue.push({
            id: valueId,
            value: value[field]
          });
        });
      } else {
        mappedValue = Object.keys(values).map((valueId) => {
          return {
            id: valueId,
            value: values[valueId][field]
          };
        });
      }
      mapped[field] = mappedValue;

      return mapped;
    }.bind(this), {});
  },
  genUrlQuery: function genUrlQuery(options) {
    let query = Object.keys(options.filterSelected).reduce(function (mapped, field) {
      let def = this.refs.filterGroup.getFilterDef(field);
      let value = options.filterSelected[field];
      // 若 filterSelected 来自 filterGroup，则映射提取 id
      // 数据结构: {brand: {id: 1, value: '美联'}} or {brand: [{id: 1, value: '美联'}, {id: 2, value: '年年红'}]}
      if (options.isFromFilter) {
        if (def.treeView) {
          mapped[field] = value[value.length - 1].id;
        }
        else {
          mapped[field] = !Array.isArray(value) ?
            value.id :
            value.map(function (eachValue) {
              return eachValue.id;
            });
        }
      }
      // 来自响应
      // 数据结构: {brand: {1: {brand: '美联'}}, {2: {brand: '年年红'}}}
      else {
        mapped[field] = def.treeView ?
          this.deepTravel(value) :
          Object.keys(value);
      }
      return mapped;
    }.bind(this), {});
    options.otherParams.order && (query.order = options.otherParams.order);
    options.otherParams.page && (query.page = options.otherParams.page);
    options.otherParams.search && (query.search = options.otherParams.search);
    return query;
  },

  // 深度检索 treeView 型 value
  // treeView 时忽略多选, 只取第一个 value
  deepTravel: function deepTravel (node, cb) {
    let nodeId = Object.keys(node)[0];
    let child = node[nodeId].children;
    Utils.isFunction(cb) && cb(node[nodeId], nodeId);
    if (!child) {
      return nodeId;
    }
    return deepTravel(child, cb);
  },

  render: function () {
    let {progressBarConfig, headerConfig, filterGroupConfig, sortBarConfig, itemsConfig, paginationConfig} = this.props;
    let {userInfoState, filterGroupState, itemsState, paginationState} = this.state;
    return (
      <div>
        <ProgressBar {...progressBarConfig} ref="progressBar" />

        <Header
          {...headerConfig}
          userInfo={userInfoState}
        />

        <div className="filter-wrapper">
          <FilterGroup
            {...filterGroupConfig}
            filterValues={filterGroupState.filterValues}
            onStateChange={this.handleFilterStateChange}
            ref="filterGroup"
          >
            <span className="amount">共 <span id="amount">{itemsState.amount}</span> 件个商品</span>
          </FilterGroup>
        </div>

        <div className="sort-wrapper">
          <SortBar
            {...sortBarConfig}
            onSortSelect={this.handleSortSelect}
            ref="sortBar"
          />
        </div>

        <div className="items-wrapper">
          <Items
            itemTipClick={[this.handleCollectClick, this.handleCompareClick]}
            items={itemsState.items}
          />
        </div>

        <div className="pagination-wrapper">
          <Pagination
            {...paginationConfig}
            pages={paginationState.pages}
            activePage={paginationState.activePage}
            selected={this.handlePageChange}
          />
        </div>

        <FloatBottomTip ref="floatBottomTip" />
        <LoginPopup ref="loginPopup" />
      </div>
    );
  }
});


ReactDOM.render(
  <SearchPage />,
  document.getElementById('box')
);
