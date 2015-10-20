$(function () {

    // 当前所有查询条件对象
    var queryParams = null;

    /* Progressbar */
    var progressBar = React.render(
        <ProgressBar color="#009966" />,
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
        }), 'filter');
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
        getSearchDataWithLoading(e.state, true, 'popstate');
    });


    /* Sortbar */
    $('.sortbar .sort').delegate('.sort-index', 'click', function () {
        var $this = $(this);
        var sortArrow = null;
        var sortType = null;
        $this.siblings().removeClass('active');
        $this.addClass('active');
        if ($this.attr('data-sort') != 'hot') {
            sortArrow = $this.children('.darr');
            sortArrow.toggleClass('inc').show();
        }
        sortType = sortArrow.hasClass('inc') ? 'asc' : 'desc';

        getSearchDataWithLoading($.extend({}, queryParams, {order: sortType}), 'sortbar');

        return false;
    });
    var updateSortBar = function (order) {
        var $sort = $('[data-sort="price"]');
        var $sortArrow = $sort.find('.darr');
        if (!order) {
            $sort.removeClass('.active');
            $sortArrow.hide();
        }
        else if (order == 'asc') {
            $sort.addClass('active');
            $sortArrow.addClass('inc').show();
        }
        else {
            $sort.addClass('active');
            $sortArrow.removeClass('inc').show();
        }
    };


    /* Items */
    var Item = React.createClass({
        render: function() {
            return (
                <div className="item" data-id={this.props.item.item_id}>
                    <a href={"/item/" + this.props.item.item_id}>
                        <img src={this.props.item.image_url} alt={this.props.item.item} />
                    </a>
                    <div className="item-info">
                        <h5>
                            <a href={'/item/' + this.props.item.id}>
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
        getSearchDataWithLoading($.extend({}, queryParams, {page: page}), 'pagination');
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

                updateSortBar(data.items.order);
                // render pagination
                pagination = renderPagination(data.items.pages, data.items.page);
            },
            fail: function (xhr) {

            }
        });
    })();


    function getSearchDataWithLoading (params, origin) {
        // 请求非 popstate 触发和分页回调触发时，直接重置请求页码为1
        origin == 'popstate' && origin == 'pagination' &&
            (params.page = 1);

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
                // 更新 sortbar
                updateSortBar(data.items.order);
                // 更新 pagination
                pagination = renderPagination(data.items.pages, data.items.page);
                // 不来自 popstate 事件时更新 url
                origin !== 'popstate' && historyWatcher.addHistory(queryParams, '?' + $.param(queryParams, true));
                // 如果来自 popstate 事件则需要手动更新过滤器的状态
                origin === 'popstate' && filterGroup.setFilterState(filterValuesMapping(filters.selected));
            },
            fail: function (xhr) {

            },
            beforeSend: function () {
                progressBar.start();
            },
            complete: function () {
                progressBar.done();
            }
        });
    }
});