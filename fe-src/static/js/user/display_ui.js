$(function () {
    // More button
    $('.filter-more').click(function () {
        var $this = $(this);
        var itemList = $this.prevAll('.filter-items');

        itemList.toggleClass('expanded');
        if (itemList.hasClass('expanded')) {
            $this.html('收起 <span class="caret-up"></span>');
        }
        else {
            $this.html('更多 <span class="caret"></span>');
        }
        $this.trigger('blur');  // 有没有通过css的实现方法让按钮不保持获取焦点时的颜色？

        return false;
    });


    // Filter muti-select
    $('.filter').delegate('.filter-item a', 'click', function () {
        $(this).parent().toggleClass('active');

        // 改变商品列表
        // ...

        return false;
    });


    // Filter radio (price)
    //$('.filter.price').delegate('.filter-item a', 'click', function () {
    //    var $this = $(this);
    //    $this.parent().siblings().removeClass('active');
    //    $this.parent().toggleClass('active');
    //
    //    // 改变商品列表
    //    // ...
    //
    //    return false;
    //});


    // Sortbar
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
});