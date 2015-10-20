function getSearchData(option) {
    option.params = option.params || location.search.slice(1);
    $.ajax({
        url: '/item/filter',
        type: 'GET',
        data: typeof option.params == 'string' ?
            option.params :
            $.param(option.params, true),
        beforeSend: option.beforeSend,
        complete: option.complete,
        success: option.done,
        fail: option.fail
    });
}

function filterValuesMapping(valuesObj) {
    return Object.keys(valuesObj).reduce(function (mapped, field) {
        var values = valuesObj[field];
        mapped[field] = Object.keys(values).map(function (valueId) {
            return {
                id: valueId,
                value: values[valueId][field]
            };
        });
        return mapped;
    }, {});
}

function genUrlQuery(options) {
    var query = Object.keys(options.filterSelected).reduce(function (mapped, field) {
        var value = options.filterSelected[field];
        // 若 filterSelected 来自 filterGroup，则映射提取 id
        // 数据结构: {brand: {id: 1, value: '美联'}} or {brand: [{id: 1, value: '美联'}, {id: 2, value: '年年红'}]}
        if (options.isFromFilter) {
            mapped[field] = !Array.isArray(value) ?
                value.id :
                value.map(function (eachValue) {
                    return eachValue.id;
                });
        }
        // 来自响应
        // 数据结构: {brand: {1: {brand: '美联'}}, {2: {brand: '年年红'}}}
        else {
            mapped[field] = Object.keys(value);
        }
        return mapped;
    }, {});
    options.otherParams.order && (query.order = options.otherParams.order);
    options.otherParams.page && (query.page = options.otherParams.page);
    options.otherParams.search && (query.search = options.otherParams.search);
    return query;
}

function HistoryWatcher (onHistoryChange) {
    this.supportedHistoryAPI() && (window.onpopstate = onHistoryChange);
}
HistoryWatcher.prototype.supportedHistoryAPI = function () {
    return window.history.pushState ? true : false;
};
HistoryWatcher.prototype.addHistory = function (state, url) {
    this.supportedHistoryAPI() ?
        window.history.pushState(state, 'search', url) :
        window.location.search = url;
};