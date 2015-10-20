$(function() {

    var $navItem = $("header .nav ul li a");
    $navItem.click(function() {
        $navItem.removeClass("active");
        $(this).addClass("active");
    });

});

if(window.chrome) {
    $('.banner li').css('background-size', '100% 100%');
}
$('.banner').unslider({
    arrows: false,
    fluid: true,
    dots: true,
    loop: true,
    speed: 500,
	delay: 2000,
	items: '>ul',
	item: '>li'
});
$('.banner ul li').click(function(e){
    var href = $(this).attr('href');
    window.open(href);
});
