/**
 * Created by rain on 15/4/19.
 */

$(function () {

    // USER-NAV
    var userNav = $('.user-nav .nav');
    var userNavTimeout;
    var stayTime = 200;

    userNav.delegate('li[class|="dropdown"]', 'mouseenter', function () {
        var $this = $(this);

        userNavTimeout = setTimeout(function () {
            $this.find('.dropdown-menu').show();
            $this.addClass('open');
            $this.find('.dropdown-toggle').attr('aria-expanded', true);
        }, stayTime);
    });
    userNav.delegate('li[class|="dropdown"]', 'mouseleave', function () {
        var $this = $(this);

        if (userNavTimeout) {
            clearTimeout(userNavTimeout);
        }

        $this.find('.dropdown-menu').hide();
        $this.removeClass('open');
        $this.find('.dropdown-toggle').attr('aria-expanded', false);
    });


    // MAIN-NAV
    var mainNav = $('.main-nav ul.nav');
    var slideTime = 400;
    var fadeTime = 200;
    var dialogTimeout;
    var mainNavTimeout;

    mainNav.delegate('.dropdown-nav', 'mouseenter', function () {
        console.log('entering span');
        var $this = $(this);

        // 防止鼠标在不同导航间快速移动导致蒙版闪烁
        if (dialogTimeout) {
            clearTimeout(dialogTimeout);
        }

        mainNavTimeout = setTimeout(function () {
            $this.find('.dropdown-menu:not(:animated)').slideDown(slideTime);
            $this.addClass('open');
            $this.find('.dropdown-toggle').attr('aria-expanded', true);
            if ($('#banner')) {
                $('.slide-wrapper .dialog:not(animated)').fadeIn(fadeTime);
            }
        }, stayTime);
    });

    mainNav.delegate('.dropdown-nav', 'mouseleave', function () {
        var $this = $(this);

        if (mainNavTimeout) {
            clearTimeout(mainNavTimeout);
        }

        $this.find('.dropdown-menu').slideUp(slideTime);
        $this.removeClass('open');
        $this.find('.dropdown-toggle').attr('aria-expanded', false);

        if ($('#banner')) {
            dialogTimeout = setTimeout(function () {
                $('.slide-wrapper .dialog:not(:animated)').fadeOut(fadeTime);
            }, slideTime);
        }
    });

});
