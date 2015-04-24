/**
 * Created by rain on 15/4/19.
 */

$(function () {

    // USER-NAV
    var userNav = $('.user-nav .nav');

    userNav.delegate('li[class|="dropdown"]', 'mouseenter', function () {
        var $this = $(this);
        $this.find('.dropdown-menu').show();
        $this.addClass('open');
        $this.find('.dropdown-toggle').attr('aria-expanded', true);
    });
    userNav.delegate('li[class|="dropdown"]', 'mouseleave', function () {
        var $this = $(this);

        $this.find('.dropdown-menu').hide();
        $this.removeClass('open');
        $this.find('.dropdown-toggle').attr('aria-expanded', false);
    });


    // MAIN-NAV
    var mainNav = $('.main-nav ul.nav');
    var dialogTimeout;

    mainNav.delegate('.dropdown-nav', 'mouseenter', function () {
        console.log('entering span');
        var $this = $(this);

        // 防止鼠标在不同导航间快速移动导致蒙版闪烁
        if (dialogTimeout) {
            clearTimeout(dialogTimeout);
        }

        $this.find('.dropdown-menu:not(:animated)').slideDown(400);
        $('.slide-wrapper .dialog:not(animated)').fadeIn(200);
        $this.addClass('open');
        $this.find('.dropdown-toggle').attr('aria-expanded', true);
    });

    mainNav.delegate('.dropdown-nav', 'mouseleave', function () {
        var $this = $(this);

        $this.find('.dropdown-menu').slideUp(400);
        $this.removeClass('open');
        $this.find('.dropdown-toggle').attr('aria-expanded', false);

        dialogTimeout = setTimeout(function () {
            $('.slide-wrapper .dialog:not(:animated)').fadeOut(200);
        }, 400);
    });


    // ITEM
    var itemWrapper = $('.item-wrapper');
    itemWrapper.delegate('.item > a', 'mouseover', function () {
        $(this).find('.dialog').show();
    });
    itemWrapper.delegate('.item > a', 'mouseout', function () {
        $(this).find('.dialog').hide();
    });
});