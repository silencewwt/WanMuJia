// Tab

$(function () {
    $('.tab .tabs').delegate('li a', 'click', function () {
        var $tab = $(this).parent();
        var tabName = $tab.data('tab');
        $tab.siblings().removeClass('active');
        $tab.addClass('active');

        $tab.parent()
            .nextAll('.tab-content')
            .find('.' + tabName)
            .show()
            .siblings()
            .hide();
    });
});