// Paging

function insertPage(index, max, $lastPage) {
    var pageStr = '<li class="page" data-page="' + index + '">' +
            '<a href="#">' + index + '<\/a>' +
            '<\/li>',
        $newPage = null;

    if (max >= index && !$('.page[data-page="' + index + '"]')[0]) {
        $newPage = $(pageStr);
        $newPage.insertAfter($lastPage);
    }
    return $newPage ? $newPage : $lastPage;
}

function getCurrentLastPage() {
    var $pages = $('.page');
    return $pages[$pages.length - 1];
}

function expandPage(index, max) {
    index = typeof index == 'number' ? index : parseInt(index);
    max = typeof max == 'number' ? max : parseInt(max);

    var OMIT_EDGE = 8;
    var EXPAND_NUM = 2;
    var $lastPage = $(getCurrentLastPage());
    var lastPageIndex = parseInt($lastPage.attr('data-page'));

    // 页码小于省略界限时，插入新的页码到最后
    if (index + EXPAND_NUM < OMIT_EDGE) {
        for (var i = 1; i <= EXPAND_NUM; i++) {
            $lastPage = insertPage(index + i, max, $lastPage);
        }
    }
    // 页码过大时，省略前面部分页码，添加省略符号，并改写后面的页码
    else if (index >= OMIT_EDGE) {

    }

    // 若当前页码加上扩展页码大于等于最大页码数，则删去最后的省略符号
    if (max <= index + EXPAND_NUM) {

    }

    return $('.page[data-page="' + index + '"]');
}

function checkEdge(index, max, $pre, $next) {
    index = typeof index == 'number' ? index : parseInt(index);
    max = typeof max == 'number' ? max : parseInt(max);

    if (index > 1) {
        $pre.removeClass('disabled');
    }
    else {
        $pre.addClass('disabled');
    }

    if (index < max) {
        $next.removeClass('disabled');
    }
    else {
        $next.addClass('disabled');
    }
}

function changePage(index) {
    index = typeof index == 'number' ? index : parseInt(index);

    var maxPage = parseInt($('.pages').attr('data-max-page'));
    var $pre = $('.pages .pre');
    var $next = $('.pages .next');
    var $page = expandPage(index, maxPage);

    $page.siblings().removeClass('active');
    $page.addClass('active');
    $pre.attr('data-page', index - 1);
    $next.attr('data-page', index + 1);

    // 检查改变后的页码是否到达边界
    checkEdge(index, maxPage, $pre, $next);

    // 改变列表内容
    // ...
}



$(function () {
    $('.pages .page[data-page="1"]').addClass('active');

    $('.pages').delegate('.page', 'click', function () {
        var $this = $(this);
        changePage($this.attr('data-page'));

        return false;
    });

    $('.pages .pre').click(function () {
        var $this = $(this);
        if ($this.hasClass('disabled')) return false;

        changePage($this.attr('data-page'));

        // 自动丢焦点
        $this.children('a').trigger('blur');

        return false;
    });

    $('.pages .next').click(function () {
        var $this = $(this);
        if ($this.hasClass('disabled')) return false;

        changePage($this.attr('data-page'));

        // 自动丢焦点
        $this.children('a').trigger('blur');

        return false;
    });

    $('.wrapper-page input[type="submit"]').click(function () {
        var page = $('.wrapper-page input[type="number"]').val();
        changePage(page);

        return false;
    });
});