// Forms

$(function () {
    $('.upload input[type="file"]').on('change', function () {
        var $this = $(this);
        var value = $this.val();
        var $state = $(this).parents('.form-group').find('.state');

        $state.empty().append($('<div>' + value + '</div>'));
    });
});