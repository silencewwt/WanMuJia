// Tab

$(function () {
    var hash = window.location.hash.slice(1);
    $('.tab .tabs').delegate('li a', 'click', function () {
        var $tab = $(this).parent();
        var tabName = $tab.data('tab');
        $tab.siblings().removeClass('active');
        $tab.addClass('active');

        window.location.hash = tabName;

        $tab.parent()
            .nextAll('.tab-content')
            .find('.' + tabName)
            .show()
            .siblings()
            .hide();
    });
});
