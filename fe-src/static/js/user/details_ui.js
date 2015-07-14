// details ui

$(function () {
    // Thumbnail
    var $thumb = $('.gallery .thumbnail');
    var stayTime = 200;
    var thumbTimeout;

    $thumb.delegate('li', 'mouseenter', function () {
        var $this = $(this);
        var imgSrc = $this.find('img').attr('src');

        thumbTimeout = setTimeout(function () {
            $('.booth img').attr('src', imgSrc);
            $this.siblings().removeClass('active');
            $this.addClass('active');
        }, stayTime);
    });

    $thumb.delegate('li', 'mouseleave', function () {
        if (thumbTimeout) {
            clearTimeout(thumbTimeout);
        }
    });
});