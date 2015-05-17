// ITEM
$(function () {
    var itemWrapper = $('.item-wrapper');
    itemWrapper.delegate('.item > a', 'mouseover', function () {
        $(this).find('.dialog').show();
    });
    itemWrapper.delegate('.item > a', 'mouseout', function () {
        $(this).find('.dialog').hide();
    });
});