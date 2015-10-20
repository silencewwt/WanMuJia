$(function () {

    // 当前所有查询条件对象
    var queryParams = null;

    /* Progressbar */
    var progressBar = React.render(
        <ProgressBar />,
        $('#progress-bar')[0]
    );


    /* Filters */
    var historyWatcher;
    var filterDefs = [
        {name: '材料', field: 'material', canMultiSelect: true},
        {name: '风格', field: 'style', canMultiSelect: true},
        {name: '场景', field: 'scene', canMultiSelect: true},
        {name: '种类', field: 'category', canMultiSelect: true},
        {name: '品牌', field: 'brand', canMultiSelect: true},
        {name: '价格', field: 'price'}
    ];
    var initialValues = [];

    // filter 状态改变回调
    var onStateChange = function (state, component) {
        console.log('state change:', state);
        getSearchDataWithLoading(genUrlQuery({
            filterSelected: state,
            otherParams: queryParams,
            isFromFilter: true
        }));
    };

    var filterGroup = React.render(
        <FilterGroup
            filterDefs={filterDefs}
            filterValues={initialValues}
            onStateChange={onStateChange}
        >
            <span>所有分类 &gt; 共 <span id="amount">0</span> 个商品</span>
        </FilterGroup>,
        $('#filter-group')[0]
    );

    // url 改变更新数据
    historyWatcher = new HistoryWatcher(function (e) {
        console.log('history changed:', e.state);
        getSearchDataWithLoading(e.state, filterGroup, true);
    });


    /* Sortbar */
    $('.sortbar .sort').delegate('.sort-index', 'click', function () {
        var $this = $(this);

        $this.siblings().removeClass('active');
        if ($this.hasClass('active') && $this.attr('data-sort') != 'hot') {
            $this.children('.darr').toggleClass('reverse');
        }
        $this.addClass('active');

        // 改变商品列表
        // ...

        return false;
    });


    /* Items */
    var Item = React.createClass({
        render: function() {
            var dialogStyle = {
                display: !this.props.item.deleted ? "none" : "block"
            };
            return (
                <div className="item" data-id={this.props.item.item_id}>
                    <a href={"/item/" + this.props.item.item_id}>
                        <img src={this.props.item.image_url} alt={this.props.item.item} />
                    </a>
                    <div className="item-info">
                        <h5>
                            <a href={'/item/' + this.props.item.item_id}>
                                {this.props.item.item}
                            </a>
                        </h5>
                        <div className="price">&yen; {this.props.item.price}</div>
                    </div>
                </div>
            );
        }
    });

    var Items = React.createClass({
        getInitialState: function() {
            return {
                filteredItems: []
            };
        },
        setItems: function(items) {
            this.setState({
                filteredItems: items
            });
        },
        render: function() {
            return (
                <div className="item-wrapper clearfix">
                    {this.state.filteredItems.map(function(item, i) {
                        return <Item item={item} key={i}/>;
                    })}
                </div>
            );
        }
    });

    var items = React.render(
        <Items />,
        $('#items')[0]
    );


    /*Pagination*/
    var pagination;
    var onChangePage = function (page) {
        getSearchDataWithLoading($.extend({}, queryParams, {page: page}), filterGroup, true);
    };
    var renderPagination = function (pages, activePage) {
        return React.render(
            <Pagination pages={pages} activePage={activePage || 1} selected={onChangePage} theme="dark" quickGo={true}/>,
            $('#paging')[0]
        );
    };

    // init
    (function init() {
        getSearchData({
            done: function (data) {
                queryParams = genUrlQuery({
                    filterSelected: data.filters.selected,
                    otherParams: data.items
                });
                $('#amount').text(data.items.amount);
                items.setItems(data.items.query);

                filterGroup.updateFilterValue(filterValuesMapping(data.filters.available));
                filterGroup.setFilterState(filterValuesMapping(data.filters.selected));

                // render pagination
                pagination = renderPagination(data.items.pages, data.items.page);
            },
            fail: function (xhr) {

            }
        });
    })();


    function getSearchDataWithLoading (params, isFromPopstate) {
        getSearchData({
            params: params,
            done: function (data) {
                var filters = data.filters;
                queryParams = genUrlQuery({
                    filterSelected: filters.selected,
                    otherParams: data.items
                });
                // 更新商品数量
                $('#amount').text(data.items.amount);
                // 更新商品数据
                items.setItems(data.items.query);
                // 更新过滤数据
                filterGroup.updateFilterValue(filterValuesMapping(filters.available));
                // 更新 pagination
                pagination = renderPagination(data.items.pages, data.items.page);
                // 不来自 popstate 事件时更新 url
                !isFromPopstate && historyWatcher.addHistory(queryParams, '?' + $.param(queryParams, true));
                // 如果来自 popstate 事件则需要手动更新过滤器的状态
                isFromPopstate && filterGroup.setFilterState(filterValuesMapping(filters.selected));
            },
            fail: function (xhr) {

            }
        });
    }
});