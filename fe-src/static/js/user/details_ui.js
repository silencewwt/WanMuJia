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

    var likeUrl = "/collection";

    var $like = $(".property .action .like");
    var $vs = $(".property .action .vs");
    var $addvsTipBall = $(".addvs-tip-ball");

    $vs.click(function(e) {
        var _this = $(this);
        var id = _this.attr('data-id');
        if(CompareBarCom.addItem(id)) {
            // _this.attr('disabled' , true);
            // _this.text('已加入对比');
            // _this.addClass("had-vs");
            $addvsTipBall.show();
            var _ballX = e.pageX;
            var _ballY = e.pageY;
            var _toX = $("#comparebar_link").offset().left + 24;
            var _toY = "2px";
            $addvsTipBall.css({left: _ballX,top: _ballY});
            $addvsTipBall.animate({left: _toX,top: _toY} , 350 , function() {
                $addvsTipBall.hide();
            });
        }
    });

    $like.click(function() {
        var _this = $(this);
        var id = _this.attr('data-id');
        var method = _this.attr('data-method');
        _this.attr('disabled' , true);
        $.ajax({
            method: method,
            url: likeUrl,
            dataType: "json",
            data: {item: id},
            success: function(data) {
                _this.attr('disabled' , false);
                if(data.success) {
                    if(method == "POST") {
                        _this.text("取消收藏");
                        _this.attr('data-method' , 'DELETE');
                    } else if(method == "DELETE") {
                        _this.text("收藏");
                        _this.attr('data-method' , 'POST');
                    }
                } else if(!data.success) {

                }
            },
            error: function(xhr, status, err) {
		        console.error(likeUrl, status, err.toString());
		    }
        });
    });
});
