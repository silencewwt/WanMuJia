// custom.js

jQuery(document).ready(function($) {

    // =========== page init ==================

    // Register page
    if (getPageTitle() === 'register') {
        console.log('register');
        // var districtIdSel = new LinkageSel({
        //     data: address,
        //     select: '#district_cn_id'
        // });
    }


    // Items page
    if (getPageTitle() === 'items') {
        initDatatable($('#items'), {
            ajax: "/privilege/items/datatable",
            columns: [
                {data: "id", bSortable: false, visible: false},
                {data: "item", bSortable: false},
                {data: "second_category_id", bSortable: false},
                {data: "price"},
                {data: "size", bSortable: false}
            ],
            columnDefs: [{
                targets: [5],
                data: "id",
                render: function (id) {
                    return "<a href='/privilege/items/" + id + "'>详情</a>";
                }
            }]
        });
    }


    // Item Detail page
    if (getPageTitle() === 'item-detail') {
        var $form = $('#edit-item-form');
        var originFormValue = $form.serialize();

        // Set form disabled
        setFormDisabled($form);

        // Edit-form
        $form.delegate('.form-control', 'keydown', function () {
            $('#save').next().hide();
        });
        $form.find('select').click(function () {
            $('#save').next().hide();
        });

        $('#save').click(function () {
            var $this = $(this);
            if ($this.hasClass('disabled')) return;

            //$this.addClass('disabled');
            var dirtyCheck = formDirtyCheck($form, originFormValue);
            if (dirtyCheck.isDirty) {
                saveInfos({
                    url: window.location.pathname,
                    method: 'put',
                    form: $form,
                    success: function (data) {
                        $this.next()
                            .text('保存成功！')
                            .addClass('text-success')
                            .removeClass('text-danger')
                            .show();

                        originFormValue = dirtyCheck.origin;
                    },
                    error: function () {
                        $this.next()
                            .text('服务器错误，请稍后重试')
                            .removeClass('text-success')
                            .addClass('text-danger')
                            .show();

                        //$this.removeClass('disabled');
                    }
                });
            }
        });

        // Item Album page
        var $albumImages = $('.album-images');
        var deleteImgHash = '';

        $albumImages
            // 修改 deleteImgHash 变量
            .delegate('[data-action="trash"]', 'click', function () {
                console.log('delete');
                deleteImgHash = $(this)
                    .parents('.album-image')
                    .data('hash');
            })
            // 修改大图弹窗中图片的 src
            .delegate('.album-image', 'click', function () {
                var src = $(this).find('.thumb img').attr('src');
                $('#gallery-image-modal')
                    .find('img').attr('src', src);
            });

        // 确认删除后发送删除请求并删除 gallery 中相应 ui
        $('#gallery-image-delete-modal')
            .find('#delete')
            .click(function () {
                $albumImages
                    .find('[data-hash=' + deleteImgHash + ']')
                    .parent()
                    .remove();

                deleteImage(deleteImgHash);
            });

        $('#sort-confirm').click(function () {
            var sort = [];
            $albumImages
                .find('.album-image')
                .each(function () {
                    sort.push($(this).data('hash'));
                });

            $.ajax({
                url: '/items/image_sort',
                method: 'post',
                data: sort.join(',')
            });
        });

    }



    // =============== plugins config ===============

    // jQuery validate
    if ($.validator) {
        $.validator.addMethod('mobile', function (value, element) {
            var length = value.length;
            var mobile = /^((1[3-8][0-9])+\d{8})$/;
            return this.optional(element) || (length == 11 && mobile.test(value));
        });

        $.validator.addMethod('tel', function (value, element) {
            var tel = /^\d{3,4}-?\d{7,9}$/;    //电话号码格式010-12345678
            return this.optional(element) || (tel.test(value));
        });
    }

    // Dropzone
    var $imgUpload = $('#img-upload.dropzone');
    if ($imgUpload.length > 0) {

        $imgUpload.dropzone({
            url: '/vendor/item_image',
            method: 'put',
            acceptedFiles: 'image/jpg, image/jpeg, image/png',
            addRemoveLinks: getPageTitle() !== 'item-edit',
            dictDefaultMessage: '拖动文件到此以上传',
            dictResponseError: '服务器错误, 上传失败, 请稍后重试。',
            dictCancelUpload: '取消上传',
            dictCancelUploadConfirmation: '确定取消上传吗？',
            dictRemoveFile: '移除文件',

            init: function () {
                this
                    .on('removedfile', function (file) {
                        console.log(file.previewElement);
                        var hash = $(file.previewElement).data('hash');

                        if (hash) deleteImage(hash);
                    })
                    .on('success', function (file, data) {
                        $(file.previewElement).data('hash', data.hash);

                        var $album = $('.album-images');
                        if ($album.length > 0) {
                            $album.append($(genImageView({
                                name: file.name,
                                hash: data.hash,
                                url: data.url,
                                created: data.created
                            })));
                        }
                    });
            }
        });
    }


    // Datatable
    function initDatatable($el, opt) {
        $el.dataTable({
            aLengthMenu: [
                [10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]
            ],
            language: {
                "sProcessing":   "处理中...",
                "sLengthMenu":   "显示 _MENU_ 项结果",
                "sZeroRecords":  "没有匹配结果",
                "sInfo":         "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
                "sInfoEmpty":    "显示第 0 至 0 项结果，共 0 项",
                "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
                "sInfoPostFix":  "",
                "sSearch":       "搜索:",
                "sUrl":          "",
                "sEmptyTable":     "表中数据为空",
                "sLoadingRecords": "载入中...",
                "sInfoThousands":  ",",
                "oPaginate": {
                    "sFirst":    "首页",
                    "sPrevious": "上页",
                    "sNext":     "下页",
                    "sLast":     "末页"
                },
                "oAria": {
                    "sSortAscending":  ": 以升序排列此列",
                    "sSortDescending": ": 以降序排列此列"
                }
            },
            processing: true,
            serverSide: true,
            ajax: opt.ajax,
            columns: opt.columns,
            columnDefs: opt.columnDefs
        });
    }

});

// ========= util fn ===============

function setCookie(cookieName, coockieValue, expiredays) {
    var cookieText = encodeURIComponent(cookieName) + '=' +
        encodeURIComponent(coockieValue);

    if (expiredays instanceof Date) {
        cookieText += "; expires=" + expiredays.toGMTString();
    }

    return (document.cookie = cookieText);
}

function getCookie(cookieName) {
    var value;

    decodeURIComponent(document.cookie)
        .split('; ')
        .forEach(function (cookie) {
            cookie = cookie.split('=');
            if (cookieName === cookie[0]) {
                value = cookie[1];
            }
        });

    return value;
}

function convertTimeString(seconds) {
    if (typeof seconds != 'number') return '';

    var time = new Date(seconds * 1000);
    return time.getFullYear() + '-' +
        time.getMonth() + '-' +
        time.getDay();
}


// ============= page fn ========================

function getPageTitle() {
    return $('.page-title').data('page');
}

function saveInfos(options) {
    $.ajax({
        url: options.url,
        method: options.method,
        data: options.form.serialize(),
        success: options.success,
        error: options.error
    });
}

function deleteImage(hash) {
    $.ajax({
        url: '/vendor/item_image',
        method: 'put',
        data: {
            image_hash: hash
        }
    });
}

function formDirtyCheck($form, origin) {
    var newValue = $form.serialize();
    var isDirty = newValue !== origin;
    return {
        isDirty: isDirty,
        origin: isDirty ? newValue : origin
    };
}

function genImageView(image) {
    return '<div class="col-md-3 col-sm-4 col-xs-6">' +
                '<div class="album-image" data-hash="' + image.hash + '">' +
                    '<a href="#" class="thumb" data-action="edit" data-toggle="modal" data-target="#gallery-image-modal">' +
                        '<img src="' + image.url + '" class="img-responsive" />' +
                    '</a>' +

                    '<a href="#" class="name">' +
                        '<span>' + image.name + '</span>' +
                        '<em>' + convertTimeString(image.created) + '</em>' +
                    '</a>' +

                    '<div class="image-options">' +
                        '<a href="#" data-action="trash" data-toggle="modal" data-target="#gallery-image-delete-modal"><i class="fa-trash"></i></a>' +
                    '</div>' +
                '</div>' +
           '</div>';
}

function setElemText($el, text) {
    if ($el.is('input')) $el.val(text);
    else $el.text(text);
}

function sendEnable($send, value) {
    setElemText($send, value);
    $send.removeClass('disabled');
}

function sendDisable($send, time, delayTime) {
    var timePass = parseInt((delayTime - time + parseInt(getCookie('clickTime'))) / 1000);  // convert second to millisecond
    $send.addClass('disabled');
    setElemText($send, timePass + ' 秒后点击再次发送');
}

function setCountDown($send, originValue, DELAYTIME) {
    var countDown = setInterval(function () {
        if (Date.now() - getCookie('clickTime') >= DELAYTIME - 1000) {
            clearTimeout(countDown);
            sendEnable($send, originValue);
            setCookie('clickTime', '', new Date(0));
        }
        else {
            sendDisable($send, Date.now(), DELAYTIME);
        }
    }, 200);
}

function setFormDisabled($form) {
    $form.find('.form-control').attr('disabled', true);
}
