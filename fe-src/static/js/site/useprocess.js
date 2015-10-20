$(function() {

    var $contItem = $(".use-process .item");
    $contItem.click(function() {
        var data = $(this).attr("data-item");
        showContItem(data);
    });

    var proData = location.search.substr(5);
    showContItem(proData);

});

function showContItem(w) {
    $(".content .cont-item").fadeOut();
    $(".content .cont-item-" + w).fadeIn();
}
