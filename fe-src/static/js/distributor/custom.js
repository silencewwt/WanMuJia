// custom.js

jQuery(document).ready(function($) {

    // =========== page init ==================

    // Items page
    if (getPageTitle() === 'items') {

        initDatatable($('#items'), {
            ajax: "/distributor/items/datatable",
            columns: [
                {data: "id", visible: false},
                {data: "item", bSortable: false},
                {data: "second_category_id", bSortable: false},
                {data: "price"},
                {data: "size", bSortable: false},
                {data: "inventory", visible: false},
            ],
            columnDefs: [{
                targets: [6],
                data: {},
                render: function (data) {
                    var text = null, checked = null;
                    if (data.inventory === 1) {
                        text = '有货';
                        checked = 'checked';
                    }
                    else {
                        text = '无货';
                        checked = '';
                    }

                    return '<label class="inventory-info">' + text + '</label>' +
                            '<input type="checkbox" ' + checked + ' class="inventory-checkbox iswitch iswitch-secondary" data-id="' + data.id + '">' +
                            '<div class="disable-div"></div>';
                }
            }]
        });

        $('#items').delegate('.inventory-checkbox', 'click', function () {
            var $this = $(this);
            if ($this.hasClass('disabled')) return;

            var $loading = $('<span class="loading fa fa-spin fa-spinner"></span>');
            var $errorHint = function (message) {
                message = message || '服务器错误请重试';
                return $('<span class="error-hint text-danger">' + message + '</span>');
            };

            var id = $this.data('id');
            var $td = $this.parent();

            // Set waiting state
            $this.prop('disabled', true);
            $td.append($loading);

            $.ajax({
                url: '/distributor/items/' + id,
                method: 'post',
                data: $this.is(':checked') ?
                        {stock: 1}
                        : {stock: 0},
                success: function (data) {
                    var $errorSpan = $td.find('.error-hint');

                    if (data.success) {
                        setStock();
                        $errorSpan.remove();
                    }
                    else {
                        toggleCheckState();
                        setStock();
                        if ($errorSpan.length === 0) {
                            $td.append($errorHint(data.message));
                        }
                        else {
                            $errorSpan.text(data.message);
                        }
                    }
                },
                error: function () {
                    toggleCheckState();
                    setStock();
                    if ($td.find('.error-hint').length === 0) {
                        $td.append($errorHint());
                    }
                },
            });

            function setStock() {
                var $info = $this.prev('.inventory-info');
                if ($this.is(':checked')) {
                    $info.text('有货');
                }
                else {
                    $info.text('无货');
                }
                $this.prop('disabled', false);
                $td.find('.loading').remove();
            }

            function toggleCheckState() {
                if ($this.is(':checked')) $this.prop('checked', false);
                else $this.prop('checked', true);
            }
        });
    }


    // Settings page
    if (getPageTitle() === 'settings') {
        $('#contact_mobile').rules('add', {
            mobile: true,
            messages: {
                mobile: '手机号码格式不正确'
            }
        });
        $('#contact_telephone').rules('add', {
            tel: true,
            messages: {
                tel: '固定电话号码格式不正确'
            }
        });
    }


    // =============== plugins config ===============

    // jQuery validate
    if ($.validator) {
        $.validator.addMethod(
            "regex",
            function(value, element, regexp) {
                if (regexp.constructor != RegExp)
                    regexp = new RegExp(regexp);
                else if (regexp.global)
                    regexp.lastIndex = 0;
                return this.optional(element) || regexp.test(value);
            },
            "Please check your input."
        );

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
