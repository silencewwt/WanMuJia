// custom.js

jQuery(document).ready(function($) {

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
            url: '/vendor/items/image',
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

    // toastr
    var toastrOpts = {
        "closeButton": true,
        "debug": false,
        "positionClass": "toast-top-full-width",
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };


    // =========== page init ==================

    // Item Edit page
    if (getPageTitle() === 'item-edit') {
        var $form = $('#edit-item-form');
        var originFormValue = $form.serialize();

        // Edit-form
        $form.delegate('.form-control', 'keydown', function () {
            $('#save').next().hide();
        });
        $form.find('select').click(function () {
            $('#save').next().hide();
        });

        $('#save').click(function () {
            var $this = $(this);
            var originButtonText = $this.html();
            if ($this.hasClass('disabled')) return;

            //$this.addClass('disabled');
            var dirtyCheck = formDirtyCheck($form, originFormValue);
            if (dirtyCheck.isDirty) {
                setButtonLoading($this);

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
                        resetButton($this, originButtonText);
                    },
                    error: function () {
                        $this.next()
                            .text('服务器错误，请稍后重试')
                            .removeClass('text-success')
                            .addClass('text-danger')
                            .show();

                        resetButton($this, originButtonText);
                    }
                });
            }
            else {
                $this.next().text('没有修改, 无法提交').show();
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


    // Item New page
    if (getPageTitle() === 'item-new') {
        var $newItemForm = $('#new-item-form');

        var nextHandler = function () {
            var $this = $(this);
            if ($this.hasClass('disabled')) {
                return;
            }

            if (!checkValidate($newItemForm)) {
                return;
            }

            var $link = $this.children('a');
            var originVal = $link.html();

            setButtonLoading($link);

            saveInfos({
                url: '/vendor/items/new_item',
                method: 'post',
                form: $('#new-item-form'),
                success: function (data) {
                    if (data.success) {
                        $newItemForm.bootstrapWizard('next');
                    }
                    else {
                        toastr.error(data.message, '提交失败');
                    }

                    resetButton($link, originVal);
                }
            });
        };


        $('.wizard .next')
            .off('click')
            .click(nextHandler);
    }


    // Distributors page
    if (getPageTitle() === 'distributors') {
        $('#distributors').delegate('[data-target="#revocation-modal"]', 'click', function () {
            var id = $(this).data('dist-id');
            var $contractForm = $('#contract-form');
            var actions = $contractForm
                            .attr('action')
                            .split('/');

            actions[3] = id;    // url: /vendor/distributors/{id}/revocation

            $contractForm.attr('action', actions.join('/'));
        });
    }


    // Invitation page
    if (getPageTitle() === 'dist-invitation') {
        $('#get-key').click(function () {
            $.ajax({
                url: '/vendor/distributors/invitation',
                method: 'post',
                success: function (data) {
                    $('.invite-key').text(data);
                },
                error: function () {

                }
            });
        });
    }


    // Settings page
    if (getPageTitle() === 'settings') {
        $('#logo').on('change', function () {
            var $this = $(this);
            var files = !!this.files ? this.files : [];

            if (files.length <= 0 || !window.FileReader) return;

            if (/^image/.test(files[0].type)) {
                var reader = new FileReader();
                reader.readAsDataURL(files[0]);
                reader.onloadend = function () {
                    $this.siblings('.logo-preview')
                        .find('img')
                        .attr('src', this.result);
                };
            }
        });

        $('#contact_mobile').rules('add', {
            mobile: true,
            messages: {
                mobile: '请填写合法的手机号码'
            }
        });
        $('#contact_telephone').rules('add', {
            tel: true,
            messages: {
                tel: '请填写合法的固定电话号码'
            }
        });
    }


    // Register page
    if ($('body').data('page') == 'register') {
        // 发送按钮倒计时
        var $send = $('.send');
        var DELAYTIME = 60000;  // 1min
        var originValue = $send.val() || $send.text();

        // 页面加载完成时获取发送按钮情况
        if (getCookie('clickTime')) {
            sendDisable($send, Date.now(), DELAYTIME);
            setCountDown($send, originValue, DELAYTIME);
        }

        $send.click(function () {
            if (!checkValidate($('#register'), '#mobile')) {
                return;
            }

            var $this = $(this);

            if ($this.hasClass('disabled')) return;

            setCookie('clickTime', Date.now());

            // 发送请求
            $.ajax({
                url: '/service/mobile_register_sms',
                method: 'post',
                data: {
                    mobile: $('#mobile').val()
                }
            });

            setCountDown($this, originValue, DELAYTIME);
        });
    }


    // Register_next or Reconfirm page
    if ($('body').data('page') == 'register-next' ||
            $('body').data('page') == 'reconfirm') {

        // form validate

        // only in register-next page
        if ($('body').data('page') == 'register-next') {
            $('#email').rules('add', {
                required: true,
                email: true,
                messages: {
                    required: '请输入您的邮箱',
                    email: '请输入合法的邮箱地址'
                }
            });

            $('#password').rules('add', {
                required: true,
                regex: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,}$/,
                messages: {
                    required: '请设置密码',
                    regex: '密码长度必须大于等于6位且为字母和数字的组合'
                }
            });

            $('#confirm_password').rules('add', {
                required: true,
                equalTo: '#password',
                messages: {
                    required: '请再次输入密码',
                    equalTo: '两次密码输入不一致'
                }
            });

            $('#agent_identity_front').rules('add', {
                required: true,
                messages: {
                    required: '请上传代理人身份证正面照片',
                }
            });

            $('#agent_identity_back').rules('add', {
                required: true,
                messages: {
                    required: '请上传代理人身份证反面照片',
                }
            });
        }

        $('#agent_name').rules('add', {
            required: true,
            messages: {
                required: '请输入代理人姓名',
            }
        });

        $('#agent_identity').rules('add', {
            required: true,
            regex: /^\d{15}(\d\d[0-9xX])?$/,
            messages: {
                required: '请输入代理人身份证',
                regex: '不合法的身份证号码'
            }
        });

        $('#name').rules('add', {
            required: true,
            messages: {
                required: '请填写厂家名称',
            }
        });

        $('#license_address').rules('add', {
            required: true,
            messages: {
                required: '请填写营业执照所在地',
            }
        });

        $('#limit').rules('add', {
            required: true,
            messages: {
                required: '请填写营业期限',
            }
        });

        $('#province_cn_id').rules('add', {
            required: true,
            messages: {
                required: '请选择省级行政区',
            }
        });

        $('#city_cn_id').rules('add', {
            required: true,
            messages: {
                required: '请选择市级行政区',
            }
        });

        $('#district_cn_id').rules('add', {
            required: true,
            messages: {
                required: '请选择区级行政区',
            }
        });

        $('#address').rules('add', {
            required: true,
            messages: {
                required: '请填写联系地址',
            }
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

function setButtonLoading($el) {
    $el.addClass('disabled')
        .html('<i><span class="fa fa-spin fa-spinner"></span></i>');
}
function resetButton($el, innerHtml) {
    $el.removeClass('disabled')
        .html(innerHtml);
}

function checkValidate($form, selector) {
    if($form.hasClass('validate')) {
        var valid = null,
            $el = $form.find(selector);

        if (selector) {
            if ($el.length > 0) {
                valid = $el.valid();
            }
            else {
                return;
            }
        }
        else {
            valid = $form.valid();
        }


        if(!valid) {
            $form.data('validator').focusInvalid();
            return false;
        }
    }

    return true;
}
